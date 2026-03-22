/**
 * Dry-run：仅校验 POST /api/system/change-password 的鉴权与参数规则，
 * 覆盖 root 与标准用户（GET /api/system/users 返回的 standardUser，默认 amyclaw）。
 * 不发送会通过校验的密码，因此不会触发 chpasswd 写盘。
 *
 * 用法：node scripts/e2e-change-password-dry.js
 * 可选：MANAGEMENT_PORT=18081 OPENCLAW_STATE_DIR=/tmp/xxx
 */
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(__dirname, "..");

const TEST_PORT = Number(process.env.MANAGEMENT_PORT) || 18081;
const TEST_TOKEN = "e2e-dry-pwd-" + Date.now();
const STATE_DIR = process.env.OPENCLAW_STATE_DIR?.trim() || path.join(os.tmpdir(), "openclaw-e2e-pwd-dry-" + Date.now());
const CONFIG_PATH = path.join(STATE_DIR, "openclaw.json");
const DATA_DIR = path.join(REPO, "data");
const TOKEN_FILE = path.join(DATA_DIR, "token.txt");

function log(msg) {
  console.log("[e2e-pwd-dry]", msg);
}

async function ensureDir(p) {
  await fs.mkdir(p, { recursive: true });
}

async function waitForPort(port, maxMs = 10000) {
  const start = Date.now();
  while (Date.now() - start < maxMs) {
    try {
      const res = await fetch(`http://127.0.0.1:${port}/api/status`, {
        signal: AbortSignal.timeout(1000),
      });
      if (res.ok) return true;
    } catch {
      await new Promise((r) => setTimeout(r, 200));
    }
  }
  return false;
}

async function postJson(port, headers, body) {
  const res = await fetch(`http://127.0.0.1:${port}/api/system/change-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(8000),
  });
  const text = await res.text();
  let json = {};
  try {
    json = text ? JSON.parse(text) : {};
  } catch {
    json = { raw: text };
  }
  return { status: res.status, json };
}

async function run() {
  log("STATE_DIR=" + STATE_DIR);
  await ensureDir(STATE_DIR);
  await ensureDir(DATA_DIR);

  const initialConfig = {
    agents: { defaults: { model: { primary: "idatabase/gemini-3.1-flash-lite-preview" } } },
    models: { providers: {} },
  };
  await fs.writeFile(CONFIG_PATH, JSON.stringify(initialConfig, null, 2), "utf8");
  await fs.writeFile(TOKEN_FILE, TEST_TOKEN, "utf8");

  const child = spawn(process.execPath, ["server.js"], {
    cwd: REPO,
    env: {
      ...process.env,
      OPENCLAW_STATE_DIR: STATE_DIR,
      MANAGEMENT_PORT: String(TEST_PORT),
    },
    stdio: ["ignore", "pipe", "pipe"],
  });

  child.stderr.on("data", (c) => process.stderr.write(c));

  try {
    if (!(await waitForPort(TEST_PORT))) {
      throw new Error("管理服务未在 " + TEST_PORT + " 端口就绪");
    }
    log("管理服务已就绪 (port " + TEST_PORT + ")");

    const noAuth = await postJson(TEST_PORT, {}, { user: "root", password: "GoodPass1" });
    if (noAuth.status !== 401) {
      throw new Error("无 Bearer 应 401，实际 " + noAuth.status + " " + JSON.stringify(noAuth.json));
    }
    log("无鉴权 → 401 通过");

    const auth = { Authorization: "Bearer " + TEST_TOKEN };

    const usersRes = await fetch(`http://127.0.0.1:${TEST_PORT}/api/system/users`, {
      headers: auth,
      signal: AbortSignal.timeout(5000),
    });
    if (!usersRes.ok) throw new Error("GET /api/system/users 应 200，实际 " + usersRes.status);
    const users = await usersRes.json();
    if (users.root !== "root" || typeof users.standardUser !== "string" || !users.standardUser) {
      throw new Error("GET /api/system/users 结构异常: " + JSON.stringify(users));
    }
    const std = users.standardUser;
    log("标准用户名为: " + std);

    const rootWeak = await postJson(TEST_PORT, auth, { user: "root", password: "short" });
    if (rootWeak.status < 400 || rootWeak.status >= 500) {
      throw new Error("root 弱密码应 4xx，实际 " + rootWeak.status + " " + JSON.stringify(rootWeak.json));
    }
    log("root + 弱密码 → 4xx 通过");

    const stdWeak = await postJson(TEST_PORT, auth, { user: std, password: "noupper1" });
    if (stdWeak.status < 400 || stdWeak.status >= 500) {
      throw new Error(std + " 弱密码（无大写）应 4xx，实际 " + stdWeak.status + " " + JSON.stringify(stdWeak.json));
    }
    log(std + " + 不符合规则密码 → 4xx 通过");

    const badUser = await postJson(TEST_PORT, auth, { user: "not_allowed_user_xyz", password: "GoodPass1" });
    if (badUser.status < 400 || badUser.status >= 500) {
      throw new Error("非法 user 应 4xx，实际 " + badUser.status + " " + JSON.stringify(badUser.json));
    }
    log("非法用户名 → 4xx 通过");

    log("Dry-run 完成：未发送合法密码，未执行 chpasswd。");
  } finally {
    child.kill("SIGTERM");
    await new Promise((r) => setTimeout(r, 400));
    if (child.exitCode === null) child.kill("SIGKILL");
  }
}

run().catch((e) => {
  console.error("[e2e-pwd-dry] 失败:", e.message);
  process.exit(1);
});
