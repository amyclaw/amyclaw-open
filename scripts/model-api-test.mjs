#!/usr/bin/env node
/**
 * NEW API / idatabase.ai 模型调用诊断脚本
 * 用法: sudo node model-api-test.mjs
 */
import fs from "fs";

const CONFIG = "/root/.openclaw/openclaw.json";
const MODEL = "gpt-5.4-nano";

function loadConfig() {
  const raw = fs.readFileSync(CONFIG, "utf8");
  return JSON.parse(raw);
}

function pickGoogle(cfg) {
  const g = cfg.models?.providers?.google;
  if (!g?.apiKey) throw new Error("no google provider apiKey");
  return {
    apiKey: g.apiKey,
    baseV1Beta: (g.baseUrl || "").replace(/\/$/, ""),
    baseV1: "https://api.idatabase.ai/v1",
  };
}

async function req(name, url, opts) {
  const t0 = Date.now();
  let res;
  let text;
  try {
    res = await fetch(url, opts);
    text = await res.text();
  } catch (e) {
    console.log(`\n[${name}] FETCH FAIL: ${e.message}`);
    return { ok: false, err: e };
  }
  const ms = Date.now() - t0;
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = { _raw: text.slice(0, 2000) };
  }
  const ok = res.ok;
  console.log(`\n=== ${name} ===`);
  console.log(`URL: ${url}`);
  console.log(`HTTP: ${res.status} (${ms}ms)`);
  if (!ok) {
    console.log("Body:", JSON.stringify(json, null, 2).slice(0, 4000));
  } else {
    const preview =
      json.choices?.[0]?.message?.content ??
      json.candidates?.[0]?.content?.parts?.[0]?.text ??
      json.candidates?.[0];
    console.log(
      "OK preview:",
      typeof preview === "string"
        ? preview.slice(0, 500)
        : JSON.stringify(preview).slice(0, 500),
    );
  }
  return { ok, status: res.status, json };
}

async function main() {
  if (process.getuid?.() !== 0) {
    console.error("请用 sudo 运行以读取 /root/.openclaw/openclaw.json");
    process.exit(1);
  }
  const cfg = loadConfig();
  const { apiKey, baseV1Beta, baseV1 } = pickGoogle(cfg);

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${apiKey}`,
  };

  console.log("配置: MODEL=%s", MODEL);
  console.log("baseV1Beta=%s", baseV1Beta);
  console.log("baseV1=%s", baseV1);

  await req(
    "1-openai-chat-minimal",
    `${baseV1}/chat/completions`,
    {
      method: "POST",
      headers,
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: "user", content: "Reply with exactly: OK-MINIMAL" }],
        max_tokens: 32,
        stream: false,
      }),
    },
  );

  const validMessages = [
    { role: "user", content: "Call the tool with x=1" },
    {
      role: "assistant",
      content: null,
      tool_calls: [
        {
          id: "call_valid_1",
          type: "function",
          function: { name: "dummy", arguments: "{}" },
        },
      ],
    },
    {
      role: "tool",
      tool_call_id: "call_valid_1",
      content: '{"result":"ok"}',
    },
    { role: "user", content: "Summarize in one word." },
  ];

  await req(
    "2-openai-chat-tools-VALID-sequence",
    `${baseV1}/chat/completions`,
    {
      method: "POST",
      headers,
      body: JSON.stringify({
        model: MODEL,
        messages: validMessages,
        tools: [
          {
            type: "function",
            function: {
              name: "dummy",
              description: "test",
              parameters: { type: "object", properties: {} },
            },
          },
        ],
        max_tokens: 64,
        stream: false,
      }),
    },
  );

  const badMessages = [
    { role: "user", content: "u0" },
    { role: "assistant", content: "a0" },
    { role: "user", content: "u1" },
    { role: "assistant", content: "a1" },
    { role: "user", content: "u2" },
    { role: "assistant", content: "a2" },
    { role: "user", content: "u3" },
    { role: "assistant", content: "no tool_calls here" },
    {
      role: "tool",
      tool_call_id: "call_0",
      content: "orphan tool result",
    },
  ];

  await req(
    "3-openai-chat-tools-INVALID-messages7-orphan-call_0",
    `${baseV1}/chat/completions`,
    {
      method: "POST",
      headers,
      body: JSON.stringify({
        model: MODEL,
        messages: badMessages,
        max_tokens: 32,
        stream: false,
      }),
    },
  );

  // 与网关日志一致：上一条 assistant 有 tool_calls，但 id 与 tool 的 call_0 不匹配
  const mismatchAt7 = [
    { role: "user", content: "u0" },
    { role: "assistant", content: "a0" },
    { role: "user", content: "u1" },
    { role: "assistant", content: "a1" },
    { role: "user", content: "u2" },
    { role: "assistant", content: "a2" },
    { role: "user", content: "u3" },
    {
      role: "assistant",
      content: null,
      tool_calls: [
        {
          id: "call_other",
          type: "function",
          function: { name: "x", arguments: "{}" },
        },
      ],
    },
    {
      role: "tool",
      tool_call_id: "call_0",
      content: "wrong id",
    },
  ];

  await req(
    "3b-openai-chat-tool_call_id-mismatch-call_0-vs-call_other",
    `${baseV1}/chat/completions`,
    {
      method: "POST",
      headers,
      body: JSON.stringify({
        model: MODEL,
        messages: mismatchAt7,
        tools: [
          {
            type: "function",
            function: {
              name: "x",
              parameters: { type: "object", properties: {} },
            },
          },
        ],
        max_tokens: 32,
        stream: false,
      }),
    },
  );

  const genUrl = `${baseV1Beta}/models/${MODEL}:generateContent`;
  await req(
    "4-gemini-generateContent-minimal",
    genUrl,
    {
      method: "POST",
      headers,
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: "Say hi in 3 chars" }] }],
        generationConfig: { maxOutputTokens: 32 },
      }),
    },
  );

  // 与 OpenClaw 一致：走 v1beta streamGenerateContent（若网关支持）
  const streamUrl = `${baseV1Beta}/models/${MODEL}:streamGenerateContent`;
  await req(
    "5-gemini-streamGenerateContent-minimal-NON-STREAM-BODY",
    streamUrl,
    {
      method: "POST",
      headers,
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: "Say OK" }] }],
        generationConfig: { maxOutputTokens: 16 },
      }),
    },
  );

  console.log("\n=== 总结 ===");
  console.log(
    "若 (1) 成功而 (3) 报 tool_call_id：上游校验与日志一致；坏历史会 400。",
  );
  console.log("若 (2) 成功：成对 tool_calls + tool 在该通道可用。");
  console.log(
    "若 (5) 与 (1) 差异大：说明 OpenClaw 用 v1beta 路径时行为与 /v1/chat 不同。",
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
