#!/usr/bin/env bash
# 端到端测试：回复链路（大模型 chat）+ 状态目录一致性 + 当前运行的是 DEV 还是 OPT。
# 两套不能同时启动；本脚本只检测「当前这套」并对其做 E2E。要两套都验证请切换后各跑一次。
# 用法：OPENCLAW_STATE_DIR=/root/.openclaw ./scripts/e2e-reply-and-env.sh

set -e
STATE_DIR="${OPENCLAW_STATE_DIR:-$HOME/.openclaw}"
GATEWAY_URL="${OPENCLAW_GATEWAY_URL:-http://127.0.0.1:18789}"
TOKEN=""
if [ -f "$STATE_DIR/.env" ]; then
  export $(grep -v '^#' "$STATE_DIR/.env" | xargs)
fi
TOKEN="${OPENCLAW_GATEWAY_TOKEN:-}"

echo "=== 0) 当前运行的是 DEV 还是 OPT？==="
CURRENT_SET="unknown"
if command -v systemctl >/dev/null 2>&1 && systemctl is-active openclaw-gateway.service >/dev/null 2>&1; then
  UNIT_CONTENT=$(systemctl cat openclaw-gateway.service 2>/dev/null || true)
  if echo "$UNIT_CONTENT" | grep -q 'WorkingDirectory=.*/opt/amyclaw'; then
    CURRENT_SET="OPT"
  elif echo "$UNIT_CONTENT" | grep -q 'WorkingDirectory=.*/mnt/disk/amyclaw'; then
    CURRENT_SET="DEV"
  fi
else
  echo "（未检测到 systemd openclaw-gateway 在运行，无法判断 DEV/OPT）"
fi
echo "当前运行: $CURRENT_SET （依据 systemd openclaw-gateway.service WorkingDirectory）"
echo ""

echo "=== 1) 状态目录一致性（避免 OPT/DEV 交叉导致未生成回复）==="
GW_STATE=""
MGMT_STATE=""
if command -v systemctl >/dev/null 2>&1; then
  GW_STATE=$(systemctl show openclaw-gateway.service -p Environment --value 2>/dev/null | tr ' ' '\n' | grep '^OPENCLAW_STATE_DIR=' | cut -d= -f2-)
  MGMT_STATE=$(systemctl show openclaw-management.service -p Environment --value 2>/dev/null | tr ' ' '\n' | grep '^OPENCLAW_STATE_DIR=' | cut -d= -f2-)
fi
if [ -n "$GW_STATE" ] && [ -n "$MGMT_STATE" ]; then
  if [ "$GW_STATE" = "$MGMT_STATE" ]; then
    echo "OK: Gateway 与 Management 使用同一状态目录: $GW_STATE"
  else
    echo "WARN: 不一致 - Gateway=$GW_STATE, Management=$MGMT_STATE （可能导致未生成回复）"
  fi
else
  echo "跳过: 无法读取 systemd 环境（或未用 systemd）"
fi
echo ""

echo "=== 2) 回复链路：大模型 Chat Completions（防「未生成回复」）==="
RES_CODE=""
RES_BODY=""
if [ -n "$TOKEN" ]; then
  RES=$(curl -s -w "\n%{http_code}" -X POST "$GATEWAY_URL/v1/chat/completions" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d '{"model":"openclaw","messages":[{"role":"user","content":"今天香港天气如何？只回复一句话。"}],"stream":false}' 2>/dev/null) || true
  RES_BODY=$(echo "$RES" | head -n -1)
  RES_CODE=$(echo "$RES" | tail -n 1)
fi
if [ -z "$TOKEN" ]; then
  echo "跳过: OPENCLAW_GATEWAY_TOKEN 未设置（请设置 OPENCLAW_STATE_DIR 并确保 .env 中有 OPENCLAW_GATEWAY_TOKEN）"
elif [ "$RES_CODE" = "200" ]; then
  echo "HTTP 200 OK - 模型有正常返回，回复链路通"
  echo "$RES_BODY" | head -c 400
  echo ""
else
  echo "HTTP $RES_CODE - 若为 401 请检查 Token 与当前 Gateway 一致；若为 5xx 请检查模型/网络"
  echo "$RES_BODY" | head -c 300
  echo ""
fi
echo ""

echo "=== 3) 配置与 .env 简要检查 ==="
CONFIG_PATH="$STATE_DIR/openclaw.json"
if [ -f "$CONFIG_PATH" ]; then
  echo "openclaw.json: 存在"
  if command -v jq >/dev/null 2>&1; then
    PRIMARY=$(jq -r '.agents.defaults.model.primary // empty' "$CONFIG_PATH")
    echo "默认模型: ${PRIMARY:-未设置}"
  fi
else
  echo "openclaw.json: 不存在于 $STATE_DIR"
fi
if [ -f "$STATE_DIR/.env" ]; then
  echo ".env: 存在"
  for key in OPENCLAW_GATEWAY_TOKEN IDATABASE_API_KEY MOONSHOT_API_KEY; do
    if grep -q "^${key}=" "$STATE_DIR/.env" 2>/dev/null; then
      echo "  $key: 已配置"
    else
      echo "  $key: 未配置"
    fi
  done
else
  echo ".env: 不存在于 $STATE_DIR"
fi
echo ""

echo "=== E2E 小结 ==="
echo "当前套: $CURRENT_SET | 状态目录: $STATE_DIR"
if [ "$RES_CODE" = "200" ]; then
  echo "回复链路: 通过"
else
  echo "回复链路: 未通过（请检查 Token/模型/网络，参见 docs/未生成回复与OPT-DEV交叉排查.md）"
fi
echo "两套都测: 先跑当前套 E2E，再 systemctl stop → 换另一套启动 → 再跑本脚本。"
