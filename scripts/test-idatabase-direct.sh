#!/usr/bin/env bash
# 直连 idatabase API 测试（不经过 Gateway），用于确认 Key、模型 ID、API 是否返回非空。
# 用法：OPENCLAW_STATE_DIR=/root/.openclaw ./scripts/test-idatabase-direct.sh [model_id]

set -e
STATE_DIR="${OPENCLAW_STATE_DIR:-$HOME/.openclaw}"
MODEL="${1:-gemini-3-pro-preview}"
if [ -f "$STATE_DIR/.env" ]; then
  export $(grep -v '^#' "$STATE_DIR/.env" | xargs)
fi
KEY="${IDATABASE_API_KEY:-}"

echo "=== idatabase 直连测试 ==="
echo "模型: $MODEL"
echo ""

if [ -z "$KEY" ]; then
  echo "错误: IDATABASE_API_KEY 未设置（请在 $STATE_DIR/.env 中配置）"
  exit 1
fi

RES=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X POST "https://api.idatabase.ai/v1/chat/completions" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $KEY" \
  -d "{\"model\":\"$MODEL\",\"messages\":[{\"role\":\"user\",\"content\":\"Reply with one word: OK\"}],\"max_tokens\":10}" 2>/dev/null)
BODY=$(echo "$RES" | sed '/^HTTP_CODE:/d')
CODE=$(echo "$RES" | grep '^HTTP_CODE:' | sed 's/HTTP_CODE://')

echo "HTTP 状态: $CODE"
CONTENT=$(echo "$BODY" | jq -r '.choices[0].message.content // .error.message // empty' 2>/dev/null || echo "")
if [ -z "$CONTENT" ]; then
  echo "响应 content 为空。原始 choices[0].message:"
  echo "$BODY" | jq '.choices[0].message // .' 2>/dev/null || echo "$BODY"
  echo ""
  echo "结论: 该模型在简单请求下返回空 content，可能导致 Gateway/飞书「未生成回复」。建议改用其他模型（如 gemini-3-pro-preview）或在管理页切换主模型。"
  exit 1
fi
echo "content: $CONTENT"
echo ""
echo "结论: idatabase 直连正常。若 Gateway 仍无回复，请查嵌入式调用路径（日志 openclaw logs --follow）。"
