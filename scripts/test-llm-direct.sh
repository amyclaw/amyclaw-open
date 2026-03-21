#!/usr/bin/env bash
# 单独测试大模型返回是否正常（不经过飞书，直连 Gateway chat completions）。
# 用于区分：是模型/agent 无返回，还是飞书通道问题。
# 用法：OPENCLAW_STATE_DIR=/root/.openclaw ./scripts/test-llm-direct.sh

set -e
STATE_DIR="${OPENCLAW_STATE_DIR:-$HOME/.openclaw}"
GATEWAY_URL="${OPENCLAW_GATEWAY_URL:-http://127.0.0.1:18789}"
TOKEN=""
if [ -f "$STATE_DIR/.env" ]; then
  export $(grep -v '^#' "$STATE_DIR/.env" | xargs)
fi
TOKEN="${OPENCLAW_GATEWAY_TOKEN:-}"

echo "=== 大模型直连测试（Chat Completions）==="
echo "Gateway: $GATEWAY_URL"
echo ""

if [ -z "$TOKEN" ]; then
  echo "错误: OPENCLAW_GATEWAY_TOKEN 未设置（请设置 OPENCLAW_STATE_DIR 并确保 .env 中有 OPENCLAW_GATEWAY_TOKEN）"
  exit 1
fi

RES=$(curl -s -w "\n%{http_code}" -X POST "$GATEWAY_URL/v1/chat/completions" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"model":"openclaw","messages":[{"role":"user","content":"今天香港天气如何？只回复一句话。"}],"stream":false}' 2>/dev/null) || true
RES_BODY=$(echo "$RES" | head -n -1)
RES_CODE=$(echo "$RES" | tail -n 1)

echo "HTTP 状态: $RES_CODE"
echo ""

if [ "$RES_CODE" != "200" ]; then
  echo "响应体（前 500 字符）:"
  echo "$RES_BODY" | head -c 500
  echo ""
  echo "结论: 请求失败，请检查 Token、Gateway 是否运行、或模型/网络。"
  exit 1
fi

# 解析 content
CONTENT=$(echo "$RES_BODY" | jq -r '.choices[0].message.content // empty' 2>/dev/null || echo "")

if [ -z "$CONTENT" ]; then
  echo "响应体: $RES_BODY"
  echo ""
  echo "结论: HTTP 200 但 content 为空，大模型/agent 未返回有效内容（与飞书「未生成回复」同因）。"
  exit 1
fi

if [ "$CONTENT" = "No response from OpenClaw." ]; then
  echo "content: $CONTENT"
  echo ""
  echo "结论: agent 跑完但 payloads 为空（与飞书「未生成回复」同因）。请查日志：openclaw logs --follow，或 journalctl -u openclaw-gateway -f，搜 no-payloads 或 embedded run produced no payloads。"
  exit 1
fi

echo "content: $CONTENT"
echo ""
echo "结论: 大模型返回正常。若飞书仍无回复，问题在飞书通道或会话路由。"
