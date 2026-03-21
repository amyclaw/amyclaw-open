#!/usr/bin/env node
/**
 * 闭环测试：直接调用 idatabase.ai v1beta generateContent（与 openclaw google 提供商一致）
 * 用法：OPENCLAW_STATE_DIR=/root/.openclaw node scripts/test-google-generate-content.mjs
 *   或：IDATABASE_API_KEY=sk-xxx node scripts/test-google-generate-content.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");

function loadEnv() {
  const stateDir = process.env.OPENCLAW_STATE_DIR || path.join(process.env.HOME || "/root", ".openclaw");
  const envPath = path.join(stateDir, ".env");
  try {
    const raw = fs.readFileSync(envPath, "utf8");
    const env = {};
    for (const line of raw.split("\n")) {
      const m = line.match(/^([^#=]+)=(.*)$/);
      if (m) env[m[1].trim()] = m[2].trim();
    }
    return env;
  } catch {
    return {};
  }
}

const env = { ...process.env, ...loadEnv() };
const apiKey = (env.IDATABASE_API_KEY || "").trim();
const baseUrl = "https://api.idatabase.ai";
const modelId = "gemini-3.1-flash-lite-preview";
const url = `${baseUrl}/v1beta/models/${modelId}:generateContent`;

const body = {
  contents: [
    {
      role: "user",
      parts: [{ text: "你好，请只回复一句话：收到。" }],
    },
  ],
  generationConfig: {
    maxOutputTokens: 256,
  },
};

async function run() {
  console.log("--- 闭环测试: idatabase v1beta generateContent ---");
  console.log("URL:", url);
  console.log("Model:", modelId);
  if (!apiKey) {
    console.error("缺少 IDATABASE_API_KEY（.env 或环境变量）");
    process.exit(1);
  }
  console.log("API Key:", apiKey.slice(0, 8) + "..." + apiKey.slice(-4));

  // idatabase 常见用 Bearer；官方 Gemini 用 x-goog-api-key。先试 Bearer。
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${apiKey}`,
  };

  console.log("\n请求体:", JSON.stringify(body, null, 2));
  console.log("\n发送请求...");

  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(30000),
  });

  const text = await res.text();
  console.log("\nHTTP 状态:", res.status, res.statusText);

  let json;
  try {
    json = JSON.parse(text);
  } catch {
    console.log("响应体 (非 JSON):", text.slice(0, 500));
    process.exit(res.ok ? 0 : 1);
  }

  if (!res.ok) {
    console.log("错误响应:", JSON.stringify(json, null, 2));
    process.exit(1);
  }

  const candidate = json.candidates?.[0];
  const content = candidate?.content?.parts?.map((p) => p.text).filter(Boolean).join("") ?? "";
  console.log("\n--- 解析结果 ---");
  console.log("candidates[0].content:", content || "(空)");
  if (json.promptFeedback) {
    console.log("promptFeedback:", JSON.stringify(json.promptFeedback));
  }
  if (!content.trim()) {
    console.log("完整响应:", JSON.stringify(json, null, 2).slice(0, 1500));
  }

  if (content.trim()) {
    console.log("\n[OK] 模型已返回文本，闭环测试通过。");
  } else {
    console.log("\n[FAIL] 模型未返回文本，请检查 baseUrl/认证/模型名。");
    process.exit(1);
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
