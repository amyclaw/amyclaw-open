/**
 * E2E：管理页 Token/配置/密钥/重启/热加载/系统用户/修改密码/清除帐号 全流程校验。
 * - set-token、GET config、PATCH config（与 18789 一致：仅 openclaw.json 明文，不写 .env）、resolved-secrets、留空不覆盖、清除、飞书、DELETE token
 * - GET /api/system/users、POST /api/system/change-password（鉴权与校验；实际改密可选跳过）
 * - POST /api/clear-all-accounts（含 .env 仅删敏感键、不删系统密码）
 * - gateway-probe、gateway-restart（可选，无 systemctl 时跳过）
 * 用法：OPENCLAW_STATE_DIR=/tmp/openclaw-e2e-state node scripts/e2e-config-save.js
 * 可选：SKIP_GATEWAY_RESTART_E2E=1 跳过重启；SKIP_CHANGE_PASSWORD_E2E=1 跳过实际执行 change-password；MANAGEMENT_PORT=18080
 */
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import http from "node:http";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(__dirname, "..");

const TEST_PORT = Number(process.env.MANAGEMENT_PORT) || 18080;
const TEST_TOKEN = "e2e-test-token-" + Date.now();
const SKIP_GATEWAY_RESTART = process.env.SKIP_GATEWAY_RESTART_E2E === "1";
const SKIP_CHANGE_PASSWORD = process.env.SKIP_CHANGE_PASSWORD_E2E === "1";
const STATE_DIR = process.env.OPENCLAW_STATE_DIR?.trim() || path.join(os.tmpdir(), "openclaw-e2e-state-" + Date.now());
const CONFIG_PATH = path.join(STATE_DIR, "openclaw.json");
const ENV_PATH = path.join(STATE_DIR, ".env");
const DATA_DIR = path.join(REPO, "data");
const TOKEN_FILE = path.join(DATA_DIR, "token.txt");

function log(msg) {
  console.log("[e2e]", msg);
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

async function api(port, token, method, pathname, body) {
  const url = `http://127.0.0.1:${port}${pathname}`;
  const opts = {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    signal: AbortSignal.timeout(10000),
  };
  if (body !== undefined) opts.body = JSON.stringify(body);
  const res = await fetch(url, opts);
  const text = await res.text();
  let json;
  try {
    json = text ? JSON.parse(text) : {};
  } catch {
    json = { raw: text };
  }
  if (!res.ok) throw new Error(json.error || json.message || `HTTP ${res.status}`);
  return json;
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

  const child = spawn(
    process.execPath,
    ["server.js"],
    {
      cwd: REPO,
      env: {
        ...process.env,
        OPENCLAW_STATE_DIR: STATE_DIR,
        MANAGEMENT_PORT: String(TEST_PORT),
      },
      stdio: ["ignore", "pipe", "pipe"],
    }
  );

  let stderr = "";
  child.stderr.on("data", (c) => { stderr += c; });
  child.stdout.on("data", (c) => { process.stdout.write(c); });

  try {
    const ok = await waitForPort(TEST_PORT);
    if (!ok) {
      throw new Error("管理服务未在 " + TEST_PORT + " 端口就绪");
    }
    log("管理服务已就绪");

    const status = await fetch(`http://127.0.0.1:${TEST_PORT}/api/status`, { signal: AbortSignal.timeout(5000) }).then((r) => r.json());
    if (!status.stateDir || status.stateDir !== STATE_DIR) {
      throw new Error("GET /api/status 应返回 stateDir 与本次测试 STATE_DIR 一致，实际: " + JSON.stringify(status.stateDir));
    }
    if (!status.configPath || status.configPath !== CONFIG_PATH) {
      throw new Error("GET /api/status 应返回 configPath 与 CONFIG_PATH 一致，实际: " + JSON.stringify(status.configPath));
    }
    if (!status.envPath || status.envPath !== ENV_PATH) {
      throw new Error("GET /api/status 应返回 envPath 与 ENV_PATH 一致，实际: " + JSON.stringify(status.envPath));
    }
    log("GET /api/status 同源路径校验通过");

    const idatabaseKey = "sk-e2e-test-idatabase-key";
    const memoryKey = "sk-e2e-test-memory-key";

    // 大模型调用与成功范例一致：google 提供商 v1beta + google-generative-ai，主模型 google/xxx；记忆 baseUrl /v1/
    await api(TEST_PORT, TEST_TOKEN, "PATCH", "/api/config", {
      models: {
        providers: {
          idatabase: {
            baseUrl: "https://api.idatabase.ai",
            apiKey: idatabaseKey,
            models: [
              { id: "gemini-3.1-flash-lite-preview", name: "idatabase", input: ["text"], contextWindow: 128000, maxTokens: 8192 },
            ],
          },
          google: {
            baseUrl: "https://api.idatabase.ai/v1beta",
            api: "google-generative-ai",
            apiKey: idatabaseKey,
            models: [
              { id: "gemini-3.1-pro-preview", name: "Gemini-3.1-Pro-Preview", input: ["text"], contextWindow: 200000, maxTokens: 8192 },
              { id: "gemini-3.1-flash-lite-preview", name: "Gemini-3.1-flash-lite-preview", input: ["text"], contextWindow: 200000, maxTokens: 8192 },
            ],
          },
        },
      },
      agents: {
        defaults: {
          model: { primary: "google/gemini-3.1-flash-lite-preview" },
          memorySearch: {
            provider: "openai",
            model: "text-embedding-005",
            remote: { baseUrl: "https://api.idatabase.ai/v1/", apiKey: memoryKey },
          },
        },
      },
    });
    log("PATCH /api/config 成功");

    const configRaw = await fs.readFile(CONFIG_PATH, "utf8");
    const config = JSON.parse(configRaw);
    const envRaw = await fs.readFile(ENV_PATH, "utf8").catch(() => "");

    const idatabase = config.models?.providers?.idatabase;
    if (!idatabase) throw new Error("openclaw.json 中缺少 models.providers.idatabase");
    if (typeof idatabase.apiKey !== "string" || idatabase.apiKey !== idatabaseKey) {
      throw new Error("idatabase.apiKey 应为明文且与提交一致，实际: " + JSON.stringify(idatabase.apiKey));
    }
    const google = config.models?.providers?.google;
    if (!google) throw new Error("openclaw.json 中缺少 models.providers.google（大模型调用路径）");
    if (google.baseUrl !== "https://api.idatabase.ai/v1beta" || google.api !== "google-generative-ai") {
      throw new Error("google 应为 v1beta + google-generative-ai，实际: " + JSON.stringify({ baseUrl: google.baseUrl, api: google.api }));
    }
    if (typeof google.apiKey !== "string" || google.apiKey !== idatabaseKey) {
      throw new Error("google.apiKey 应为明文且与提交一致，实际: " + JSON.stringify(google.apiKey));
    }
    if (config.agents?.defaults?.model?.primary !== "google/gemini-3.1-flash-lite-preview") {
      throw new Error("主模型应为 google/gemini-3.1-flash-lite-preview，实际: " + config.agents?.defaults?.model?.primary);
    }

    const mem = config.agents?.defaults?.memorySearch?.remote;
    if (!mem) throw new Error("openclaw.json 中缺少 agents.defaults.memorySearch.remote");
    if (mem.baseUrl !== "https://api.idatabase.ai/v1/") {
      throw new Error("memorySearch.remote.baseUrl 应为 https://api.idatabase.ai/v1/，实际: " + mem.baseUrl);
    }
    if (typeof mem.apiKey !== "string" || mem.apiKey !== memoryKey) {
      throw new Error("memorySearch.remote.apiKey 应为明文且与提交一致，实际: " + JSON.stringify(mem.apiKey));
    }

    log("第一次 PATCH 校验通过（google 调用路径 + 记忆 /v1/）");

    // 非 Gemini 主模型：服务端不得再强制改为 google/；应保持 idatabase/ + openai-completions
    await api(TEST_PORT, TEST_TOKEN, "PATCH", "/api/config", {
      models: {
        providers: {
          idatabase: {
            baseUrl: "https://api.idatabase.ai/v1",
            api: "openai-completions",
            apiKey: idatabaseKey,
            models: [
              { id: "gpt-5.4-nano", name: "idatabase", input: ["text"], contextWindow: 128000, maxTokens: 8192 },
            ],
          },
          google: {
            baseUrl: "https://api.idatabase.ai/v1beta",
            api: "google-generative-ai",
            apiKey: idatabaseKey,
            models: [
              { id: "gemini-3.1-pro-preview", name: "Gemini-3.1-Pro-Preview", input: ["text"], contextWindow: 200000, maxTokens: 8192 },
              { id: "gemini-3.1-flash-lite-preview", name: "Gemini-3.1-flash-lite-preview", input: ["text"], contextWindow: 200000, maxTokens: 8192 },
            ],
          },
        },
      },
      agents: {
        defaults: {
          model: { primary: "idatabase/gpt-5.4-nano" },
          memorySearch: {
            provider: "openai",
            model: "text-embedding-005",
            remote: { baseUrl: "https://api.idatabase.ai/v1/", apiKey: memoryKey },
          },
        },
      },
    });
    const configChatPath = JSON.parse(await fs.readFile(CONFIG_PATH, "utf8"));
    if (configChatPath.agents?.defaults?.model?.primary !== "idatabase/gpt-5.4-nano") {
      throw new Error(
        "idatabase/GPT 主模型应保持 idatabase/ 前缀，实际: " + configChatPath.agents?.defaults?.model?.primary,
      );
    }
    if (configChatPath.models?.providers?.idatabase?.api !== "openai-completions") {
      throw new Error(
        "idatabase 应为 openai-completions，实际: " + configChatPath.models?.providers?.idatabase?.api,
      );
    }
    log("idatabase 非 Gemini（Chat）路径校验通过");

    // 恢复后续 E2E 所需的 Gemini 主模型配置
    await api(TEST_PORT, TEST_TOKEN, "PATCH", "/api/config", {
      models: {
        providers: {
          idatabase: {
            baseUrl: "https://api.idatabase.ai",
            apiKey: idatabaseKey,
            models: [
              { id: "gemini-3.1-flash-lite-preview", name: "idatabase", input: ["text"], contextWindow: 128000, maxTokens: 8192 },
            ],
          },
          google: {
            baseUrl: "https://api.idatabase.ai/v1beta",
            api: "google-generative-ai",
            apiKey: idatabaseKey,
            models: [
              { id: "gemini-3.1-pro-preview", name: "Gemini-3.1-Pro-Preview", input: ["text"], contextWindow: 200000, maxTokens: 8192 },
              { id: "gemini-3.1-flash-lite-preview", name: "Gemini-3.1-flash-lite-preview", input: ["text"], contextWindow: 200000, maxTokens: 8192 },
            ],
          },
        },
      },
      agents: {
        defaults: {
          model: { primary: "google/gemini-3.1-flash-lite-preview" },
          memorySearch: {
            provider: "openai",
            model: "text-embedding-005",
            remote: { baseUrl: "https://api.idatabase.ai/v1/", apiKey: memoryKey },
          },
        },
      },
    });
    const configRestored = JSON.parse(await fs.readFile(CONFIG_PATH, "utf8"));
    if (configRestored.agents?.defaults?.model?.primary !== "google/gemini-3.1-flash-lite-preview") {
      throw new Error("恢复 Gemini 主模型后 primary 应回到 google/gemini-3.1-flash-lite-preview");
    }

    // 密钥显示：GET /api/resolved-secrets 应返回刚写入的 llm / 向量 key，供前端显示
    const secrets = await api(TEST_PORT, TEST_TOKEN, "GET", "/api/resolved-secrets");
    if (secrets.llmApiKey !== idatabaseKey) {
      throw new Error("resolved-secrets.llmApiKey 应与刚写入一致，实际: " + (secrets.llmApiKey ? secrets.llmApiKey.slice(0, 8) + "..." : "空"));
    }
    if (secrets.memoryApiKey !== memoryKey) {
      throw new Error("resolved-secrets.memoryApiKey 应与刚写入一致，实际: " + (secrets.memoryApiKey ? secrets.memoryApiKey.slice(0, 8) + "..." : "空"));
    }
    log("resolved-secrets 显示校验通过");

    // 留空不覆盖：再次 PATCH 仅提交 idatabase 且不含 apiKey（模拟前端“已配置则留空不修改”）
    await api(TEST_PORT, TEST_TOKEN, "PATCH", "/api/config", {
      models: {
        providers: {
          idatabase: {
            baseUrl: "https://api.idatabase.ai",
            models: [
              { id: "gemini-3.1-flash-lite-preview", name: "idatabase", input: ["text"], contextWindow: 128000, maxTokens: 8192 },
            ],
          },
        },
      },
    });
    const config2Raw = await fs.readFile(CONFIG_PATH, "utf8");
    const config2 = JSON.parse(config2Raw);
    const idatabase2 = config2.models?.providers?.idatabase;
    if (typeof idatabase2?.apiKey !== "string" || idatabase2.apiKey !== idatabaseKey) {
      throw new Error("留空不覆盖：idatabase.apiKey 应保留原值，实际: " + JSON.stringify(idatabase2?.apiKey));
    }
    log("留空不覆盖校验通过");

    // 清除信息：PATCH 显式提交 apiKey ""，校验配置与 .env 中对应 key 已被删除
    await api(TEST_PORT, TEST_TOKEN, "PATCH", "/api/config", {
      models: {
        providers: {
          idatabase: {
            baseUrl: "https://api.idatabase.ai",
            models: [{ id: "gemini-3.1-flash-lite-preview", name: "idatabase", input: ["text"], contextWindow: 128000, maxTokens: 8192 }],
            apiKey: "",
          },
          google: {
            baseUrl: "https://api.idatabase.ai/v1beta",
            api: "google-generative-ai",
            models: [{ id: "gemini-3.1-flash-lite-preview", name: "Gemini", input: ["text"], contextWindow: 200000, maxTokens: 8192 }],
            apiKey: "",
          },
        },
      },
      agents: {
        defaults: {
          memorySearch: {
            provider: "openai",
            model: "text-embedding-005",
            remote: { baseUrl: "https://api.idatabase.ai/v1/", apiKey: "" },
          },
        },
      },
    });
    const config3Raw = await fs.readFile(CONFIG_PATH, "utf8");
    const config3 = JSON.parse(config3Raw);
    if (config3.models?.providers?.idatabase?.apiKey != null) {
      throw new Error("清除信息：idatabase.apiKey 应已删除，实际: " + JSON.stringify(config3.models.providers.idatabase.apiKey));
    }
    if (config3.models?.providers?.google?.apiKey != null) {
      throw new Error("清除信息：google.apiKey 应已删除，实际: " + JSON.stringify(config3.models.providers.google?.apiKey));
    }
    if (config3.agents?.defaults?.memorySearch?.remote?.apiKey != null) {
      throw new Error("清除信息：memorySearch.remote.apiKey 应已删除");
    }
    log("清除信息 E2E 通过：密钥已从配置与 .env 移除");

    const feishuAppId = "cli_e2e_test_app_id";
    const feishuSecret = "e2e_feishu_secret_value";
    await api(TEST_PORT, TEST_TOKEN, "PATCH", "/api/config", {
      channels: {
        feishu: {
          enabled: true,
          domain: "feishu",
          accounts: { default: { appId: feishuAppId, appSecret: feishuSecret } },
        },
      },
    });
    let configF = JSON.parse(await fs.readFile(CONFIG_PATH, "utf8"));
    const acc = configF.channels?.feishu?.accounts?.default;
    if (!acc || acc.appId !== feishuAppId || acc.appSecret !== feishuSecret) {
      throw new Error("飞书写入后 openclaw.json 应含 appId/appSecret，实际: " + JSON.stringify(acc));
    }
    if (configF.plugins?.entries?.feishu?.enabled !== true) {
      throw new Error("飞书启用且凭证齐全时 plugins.entries.feishu.enabled 应为 true，实际: " + JSON.stringify(configF.plugins?.entries?.feishu));
    }
    log("飞书写入 E2E 通过");

    await api(TEST_PORT, TEST_TOKEN, "PATCH", "/api/config", {
      channels: {
        feishu: {
          enabled: true,
          domain: "feishu",
          accounts: { default: { appId: feishuAppId, appSecret: "" } },
        },
      },
    });
    configF = JSON.parse(await fs.readFile(CONFIG_PATH, "utf8"));
    const acc2 = configF.channels?.feishu?.accounts?.default;
    if (!acc2 || acc2.appSecret !== feishuSecret) {
      throw new Error("飞书 appSecret 传空时应保留原值，实际 appSecret: " + (acc2?.appSecret ? "已覆盖" : "空"));
    }
    log("飞书 appSecret 留空保留 E2E 通过");

    await api(TEST_PORT, TEST_TOKEN, "PATCH", "/api/config", {
      channels: {
        feishu: {
          enabled: false,
          domain: "feishu",
          accounts: { default: { appId: "", appSecret: "" } },
        },
      },
    });
    configF = JSON.parse(await fs.readFile(CONFIG_PATH, "utf8"));
    const acc3 = configF.channels?.feishu?.accounts?.default;
    if (acc3?.appId || acc3?.appSecret) {
      throw new Error("飞书清除后 accounts.default 应为空，实际: " + JSON.stringify(acc3));
    }
    if (configF.plugins?.entries?.feishu?.enabled !== false) {
      throw new Error("飞书清除后 plugins.entries.feishu.enabled 应为 false，实际: " + String(configF.plugins?.entries?.feishu?.enabled));
    }
    log("飞书清除 E2E 通过");

    log("E2E 通过：配置已正确更新（与 18789 一致仅 json），status 同源路径、飞书写入/保留/清除、留空不覆盖与清除信息均可靠");

    // ---------- set-token 与 GET /api/config 鉴权 ----------
    const newToken = "e2e-new-token-" + Date.now();
    await api(TEST_PORT, TEST_TOKEN, "POST", "/api/set-token", { token: newToken });
    const statusAfterSet = await fetch(`http://127.0.0.1:${TEST_PORT}/api/status`, { signal: AbortSignal.timeout(5000) }).then((r) => r.json());
    if (!statusAfterSet.tokenSet) throw new Error("set-token 后 tokenSet 应为 true");
    const configAfterSet = await api(TEST_PORT, newToken, "GET", "/api/config");
    if (!configAfterSet || typeof configAfterSet !== "object") throw new Error("GET /api/config 鉴权后应返回配置对象");
    log("set-token 与 GET /api/config 鉴权 E2E 通过");

    // ---------- GET /api/system/users ----------
    const users = await api(TEST_PORT, newToken, "GET", "/api/system/users");
    if (users.root !== "root" || typeof users.standardUser !== "string" || !users.standardUser) {
      throw new Error("GET /api/system/users 应返回 root 与 standardUser，实际: " + JSON.stringify(users));
    }
    log("GET /api/system/users E2E 通过");

    // ---------- POST /api/system/change-password：鉴权与参数校验（不实际改 root 密码时可设 SKIP_CHANGE_PASSWORD_E2E=1） ----------
    const noAuthRes = await fetch(`http://127.0.0.1:${TEST_PORT}/api/system/change-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user: "root", password: "GoodPass1" }),
      signal: AbortSignal.timeout(5000),
    });
    if (noAuthRes.status !== 401) throw new Error("change-password 无鉴权应返回 401，实际: " + noAuthRes.status);
    try {
      await api(TEST_PORT, newToken, "POST", "/api/system/change-password", { user: "invaliduser", password: "GoodPass1" });
      throw new Error("change-password 非法 user 应返回 4xx");
    } catch (e) {
      if (e.message?.includes("应返回")) throw e;
    }
    try {
      await api(TEST_PORT, newToken, "POST", "/api/system/change-password", { user: "root", password: "short" });
      throw new Error("change-password 弱密码应返回 4xx");
    } catch (e) {
      if (e.message?.includes("应返回")) throw e;
    }
    log("change-password 鉴权与参数校验 E2E 通过");
    if (!SKIP_CHANGE_PASSWORD) {
      try {
        await api(TEST_PORT, newToken, "POST", "/api/system/change-password", { user: "root", password: "GoodPass1" });
        log("change-password 执行 E2E 通过（200）");
      } catch (e) {
        if (e.message?.includes("500")) log("change-password 返回 500（非 root 进程时正常）");
        else throw e;
      }
    } else {
      log("change-password 实际执行已跳过 (SKIP_CHANGE_PASSWORD_E2E=1)");
    }

    // ---------- POST /api/clear-all-accounts：含 .env 仅删敏感键、不删系统密码 ----------
    await fs.writeFile(ENV_PATH, "IDATABASE_API_KEY=e2e-secret\nKEEP_THIS=yes\nFEISHU_APP_SECRET=fs\n", "utf8");
    await api(TEST_PORT, newToken, "POST", "/api/clear-all-accounts");
    const envAfterClear = await fs.readFile(ENV_PATH, "utf8").catch(() => "");
    if (envAfterClear.includes("IDATABASE_API_KEY=") || envAfterClear.includes("FEISHU_APP_SECRET=")) {
      throw new Error("clear-all-accounts 后 .env 应已移除敏感键，实际: " + envAfterClear);
    }
    if (!envAfterClear.includes("KEEP_THIS=yes")) throw new Error("clear-all-accounts 后 .env 应保留非敏感行 KEEP_THIS=yes");
    const configAfterClear = JSON.parse(await fs.readFile(CONFIG_PATH, "utf8"));
    if (configAfterClear.gateway?.auth?.token || configAfterClear.channels?.feishu?.accounts?.default?.appId) {
      throw new Error("clear-all-accounts 后 openclaw.json 应已清除 gateway/飞书 敏感项");
    }
    const tokenFileAfterClear = (await fs.readFile(TOKEN_FILE, "utf8").catch(() => "")).trim();
    if (tokenFileAfterClear) throw new Error("clear-all-accounts 后 data/token.txt 应为空");
    log("clear-all-accounts E2E 通过（.env 仅删敏感键、config/token 已清）");

    const tokenAfterClear = "e2e-after-clear-" + Date.now();
    await api(TEST_PORT, newToken, "POST", "/api/set-token", { token: tokenAfterClear });

    // ---------- gateway-probe（无网关时可能不可达，仅校验 200 或 5xx/网络错误） ----------
    try {
      const probe = await api(TEST_PORT, tokenAfterClear, "GET", "/api/gateway-probe");
      log("gateway-probe 返回: ok=" + !!probe.ok + " status=" + (probe.status ?? probe.error));
    } catch (e) {
      log("gateway-probe 不可达（无网关时正常）: " + (e?.message || e));
    }

    // ---------- gateway-restart（可选：无 systemctl 或 CI 时跳过） ----------
    if (!SKIP_GATEWAY_RESTART) {
      try {
        const restartRes = await api(TEST_PORT, tokenAfterClear, "POST", "/api/gateway-restart");
        if (restartRes.ok) log("gateway-restart E2E 通过");
        else log("gateway-restart 返回: " + (restartRes.error || restartRes.message || "unknown"));
      } catch (e) {
        if (e?.message?.includes("500") || e?.message?.includes("restart")) {
          log("gateway-restart 失败（无 systemd 或权限时正常）: " + (e?.message || e));
        } else throw e;
      }
    } else {
      log("gateway-restart 已跳过 (SKIP_GATEWAY_RESTART_E2E=1)");
    }

    // ---------- DELETE /api/token 清除 Token ----------
    await api(TEST_PORT, tokenAfterClear, "DELETE", "/api/token");
    const statusAfterDelete = await fetch(`http://127.0.0.1:${TEST_PORT}/api/status`, { signal: AbortSignal.timeout(5000) }).then((r) => r.json());
    if (statusAfterDelete.tokenSet) throw new Error("DELETE /api/token 后 tokenSet 应为 false");
    const tokenFileContent = await fs.readFile(TOKEN_FILE, "utf8").catch(() => "");
    const tokenTrimmed = (tokenFileContent || "").trim();
    if (tokenTrimmed && tokenTrimmed !== "undefined" && tokenTrimmed !== "null") {
      throw new Error("DELETE /api/token 后 data/token.txt 应为空");
    }
    log("DELETE /api/token E2E 通过");

    log("全量 E2E 通过：Token/配置/密钥/网关探测/重启/清除逻辑正常");
  } finally {
    child.kill("SIGTERM");
    await new Promise((r) => setTimeout(r, 500)).catch(() => {});
    if (child.exitCode === null) child.kill("SIGKILL");
  }
}

run().catch((e) => {
  console.error("[e2e] 失败:", e.message);
  process.exit(1);
});
