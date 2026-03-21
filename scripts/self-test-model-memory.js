#!/usr/bin/env node
/**
 * 自测：当前模型与记忆模型接入是否正确，并验证 DEV 与 opt 路径是否符合。
 * 用法：
 *   OPENCLAW_STATE_DIR=/root/.openclaw node scripts/self-test-model-memory.js
 *   node scripts/self-test-model-memory.js --template   # 仅校验 production-template 配置
 */

const fs = require("fs");
const path = require("path");
const http = require("http");
const https = require("https");

const REPO_ROOT = path.resolve(__dirname, "..");
const STATE_DIR = process.env.OPENCLAW_STATE_DIR || path.join(process.env.HOME || "/root", ".openclaw");
const USE_TEMPLATE = process.argv.includes("--template");

function loadJson(p) {
  try {
    return JSON.parse(fs.readFileSync(p, "utf8"));
  } catch (e) {
    return null;
  }
}

function loadEnv(dir) {
  const envPath = path.join(dir, ".env");
  const out = {};
  if (!fs.existsSync(envPath)) return out;
  const content = fs.readFileSync(envPath, "utf8");
  for (const line of content.split("\n")) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (m) out[m[1]] = m[2].replace(/^["']|["']$/g, "").trim();
  }
  return out;
}

function fetchJson(url, options = {}) {
  const u = new URL(url);
  const mod = u.protocol === "https:" ? https : http;
  const body = options.body != null ? (typeof options.body === "string" ? options.body : JSON.stringify(options.body)) : undefined;
  const headers = { ...options.headers };
  if (body) headers["Content-Length"] = Buffer.byteLength(body, "utf8");
  return new Promise((resolve, reject) => {
    const req = mod.request(
      url,
      { method: options.method || "GET", headers, signal: options.signal },
      (res) => {
        let body = "";
        res.on("data", (c) => (body += c));
        res.on("end", () => {
          try {
            resolve({ ok: res.statusCode >= 200 && res.statusCode < 300, status: res.statusCode, data: JSON.parse(body) });
          } catch {
            resolve({ ok: false, status: res.statusCode, data: null, raw: body });
          }
        });
      }
    );
    req.on("error", reject);
    if (body) req.write(body, "utf8");
    req.end();
  });
}

async function main() {
  console.log("=== 模型与记忆接入自测 ===\n");

  const configPath = USE_TEMPLATE
    ? path.join(REPO_ROOT, "openclaw/production-template/state/openclaw.json")
    : path.join(STATE_DIR, "openclaw.json");

  if (!fs.existsSync(configPath)) {
    console.log("配置路径:", configPath);
    console.log("错误: 未找到 openclaw.json");
    process.exit(1);
  }

  const config = loadJson(configPath);
  if (!config) {
    console.log("错误: 无法解析 openclaw.json");
    process.exit(1);
  }

  const errors = [];
  const warnings = [];

  // --- 模型：google 专用 + idatabase v1beta
  const google = config?.models?.providers?.google;
  if (!google) {
    errors.push("models.providers.google 不存在");
  } else {
    const baseUrl = (google.baseUrl || "").trim();
    if (!baseUrl.includes("idatabase.ai") || !baseUrl.includes("v1beta")) {
      warnings.push(`google.baseUrl 建议为 idatabase v1beta，当前: ${baseUrl || "(空)"}`);
    }
    if ((google.api || "").toLowerCase() !== "google-generative-ai") {
      warnings.push(`google.api 应为 google-generative-ai，当前: ${google.api || "(空)"}`);
    }
    const models = google.models;
    if (!Array.isArray(models) || models.length === 0) {
      errors.push("google.models 为空或非数组");
    } else {
      const ids = models.map((m) => m && m.id).filter(Boolean);
      if (!ids.includes("gemini-3.1-pro-preview") && !ids.includes("gemini-3.1-flash-lite-preview")) {
        warnings.push("google.models 中建议包含 gemini-3.1-pro-preview 或 gemini-3.1-flash-lite-preview");
      }
    }
  }

  const primary = config?.agents?.defaults?.model?.primary;
  if (!primary || typeof primary !== "string") {
    errors.push("agents.defaults.model.primary 未设置");
  } else {
    const [provider, modelId] = primary.split("/");
    if (provider !== "google") {
      warnings.push(`主模型当前为 ${primary}，期望 google/*（google 专用）`);
    }
    if (google && !(google.models || []).some((m) => m && (m.id === modelId || m.id === primary))) {
      const firstId = (google.models && google.models[0] && google.models[0].id) || "";
      if (firstId && modelId !== firstId) {
        warnings.push(`primary ${primary} 不在 google.models 的 id 中，请确认是否已配置该模型`);
      }
    }
  }

  // --- 记忆：openai 兼容 + idatabase v1 embeddings
  const mem = config?.agents?.defaults?.memorySearch;
  if (!mem) {
    errors.push("agents.defaults.memorySearch 未设置");
  } else {
    if ((mem.provider || "").toLowerCase() !== "openai") {
      warnings.push(`memorySearch.provider 建议为 openai（idatabase 向量为 OpenAI 兼容），当前: ${mem.provider || "(空)"}`);
    }
    const remote = mem.remote;
    if (!remote) {
      errors.push("memorySearch.remote 未设置");
    } else {
      const rBase = (remote.baseUrl || "").trim();
      if (!rBase.includes("idatabase.ai") || !rBase.includes("/v1")) {
        warnings.push(`memorySearch.remote.baseUrl 建议为 idatabase v1（如 https://api.idatabase.ai/v1/），当前: ${rBase || "(空)"}`);
      }
    }
    const modelName = (mem.model || "").trim();
    if (!modelName) {
      errors.push("memorySearch.model 未设置");
    } else if (modelName !== "text-embedding-005" && modelName !== "text-embedding-3-small") {
      warnings.push(`memorySearch.model 常用为 text-embedding-005（idatabase）或 text-embedding-3-small，当前: ${modelName}`);
    }
  }

  // --- 输出校验结果
  console.log("配置路径:", configPath);
  console.log("主模型:", primary || "(未设置)");
  console.log("记忆 provider:", mem?.provider ?? "(未设置)");
  console.log("记忆 model:", mem?.model ?? "(未设置)");
  console.log("");

  if (errors.length) {
    console.log("错误:");
    errors.forEach((e) => console.log("  -", e));
  }
  if (warnings.length) {
    console.log("提示:");
    warnings.forEach((w) => console.log("  -", w));
  }
  if (errors.length) {
    console.log("\n结论: 配置有误，请按上表修正。");
    process.exit(1);
  }

  // --- DEV vs opt
  console.log("--- DEV 与 opt 路径 ---");
  const devPath = process.env.AMYCLAW_DEV_PATH || "/mnt/disk/amyclaw";
  const optPath = "/opt/amyclaw";
  const optExists = fs.existsSync(optPath);
  console.log("开发路径 (DEV):", devPath, fs.existsSync(devPath) ? "(存在)" : "(不存在)");
  console.log("量产路径 (opt):", optPath, optExists ? "(存在)" : "(不存在)");
  try {
    const { execSync } = require("child_process");
    const gwDir = execSync("systemctl show openclaw-gateway --property=WorkingDirectory -v 2>/dev/null || true", { encoding: "utf8" }).trim();
    const mgmtDir = execSync("systemctl show openclaw-management --property=WorkingDirectory -v 2>/dev/null || true", { encoding: "utf8" }).trim();
    console.log("Gateway WorkingDirectory:", gwDir || "(无法读取)");
    console.log("Management WorkingDirectory:", mgmtDir || "(无法读取)");
    if (gwDir && gwDir.includes("/opt/amyclaw") && !optExists) {
      warnings.push("systemd 指向 /opt/amyclaw 但该目录不存在，需执行 deploy-to-opt.sh 或从镜像恢复");
    }
  } catch (_) {
    console.log("(无法读取 systemd 属性，可能未安装或非 systemd 环境)");
  }
  console.log("");

  // --- 可选：用 .env 调上游验证
  if (!USE_TEMPLATE && fs.existsSync(path.join(STATE_DIR, ".env"))) {
    const env = loadEnv(STATE_DIR);
    const apiKey = env.IDATABASE_API_KEY || env.GOOGLE_API_KEY || "";
    if (apiKey.length >= 10) {
      console.log("--- 上游连通性（可选）---");
      const baseUrl = (google && google.baseUrl) ? google.baseUrl.replace(/\/$/, "") : "https://api.idatabase.ai/v1beta";
      const memBase = (mem?.remote?.baseUrl || "https://api.idatabase.ai/v1/").replace(/\/$/, "");
      const memModel = (mem?.model || "text-embedding-005").trim();
      const controller = new AbortController();
      const t = setTimeout(() => controller.abort(), 12000);
      try {
        const rModels = await fetchJson(`${baseUrl}/models`, {
          headers: { Authorization: `Bearer ${apiKey}` },
          signal: controller.signal,
        });
        clearTimeout(t);
        if (rModels.ok && Array.isArray(rModels.data?.models)) {
          console.log("  v1beta 模型列表: 正常，共", rModels.data.models.length, "个模型");
        } else {
          console.log("  v1beta 模型列表: 失败或非预期格式", rModels.status, rModels.data ? "" : (rModels.raw || "").slice(0, 80));
        }
      } catch (e) {
        clearTimeout(t);
        console.log("  v1beta 模型列表: 请求异常", e.message || e);
      }
      const c2 = new AbortController();
      const t2 = setTimeout(() => c2.abort(), 10000);
      try {
        const rEmb = await fetchJson(`${memBase}/embeddings`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
          body: JSON.stringify({ model: memModel, input: "自测向量" }),
          signal: c2.signal,
        });
        clearTimeout(t2);
        const hasEmbedding =
          rEmb.ok &&
          (Array.isArray(rEmb.data?.data) ||
            (rEmb.data?.data?.[0] && Array.isArray(rEmb.data.data[0].embedding)) ||
            (Array.isArray(rEmb.data?.data) && rEmb.data.data.some((d) => Array.isArray(d?.embedding))));
        if (hasEmbedding) {
          console.log("  向量 embeddings: 正常");
        } else {
          console.log("  向量 embeddings: 失败或非预期格式", rEmb.status, rEmb.data ? "(见上)" : (rEmb.raw || "").slice(0, 60));
        }
      } catch (e) {
        clearTimeout(t2);
        console.log("  向量 embeddings: 请求异常", e.message || e);
      }
    } else {
      console.log("(未设置 IDATABASE_API_KEY / GOOGLE_API_KEY，跳过上游连通性测试)");
    }
  }

  console.log("\n结论: 配置结构校验通过。若上游连通性失败，请检查 .env 中的 API Key 与网络。");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
