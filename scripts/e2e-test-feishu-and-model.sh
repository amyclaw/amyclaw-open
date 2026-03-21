#!/usr/bin/env bash
# 端到端测试：1) 大模型 chat completions 2) 飞书配置与 mock 回复链路
# 使用方式：Gateway 需已启动（openclaw gateway），且 OPENCLAW_STATE_DIR 指向含 .env 和 openclaw.json 的目录。
# 若大模型返回「无效的令牌」：在 OPENCLAW_STATE_DIR/.env 中设置有效的 IDATABASE_API_KEY（或所用模型的 API Key）。
# 若飞书无回复：确认 openclaw.json 中 channels.feishu.requireMention 为 false，且 appId/appSecret 已在管理页保存。
set -e
STATE_DIR="${OPENCLAW_STATE_DIR:-$HOME/.openclaw}"
GATEWAY_URL="${OPENCLAW_GATEWAY_URL:-http://127.0.0.1:18789}"
TOKEN=""
if [ -f "$STATE_DIR/.env" ]; then
  export $(grep -v '^#' "$STATE_DIR/.env" | xargs)
fi
TOKEN="${OPENCLAW_GATEWAY_TOKEN:-}"

echo "=== 1) 大模型 Chat Completions 测试（多次）==="
for i in 1 2 3; do
  echo "--- 第 $i 次请求 ---"
  if [ -z "$TOKEN" ]; then
    echo "跳过: OPENCLAW_GATEWAY_TOKEN 未设置"
    break
  fi
  res=$(curl -s -w "\n%{http_code}" -X POST "$GATEWAY_URL/v1/chat/completions" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d '{"model":"openclaw","messages":[{"role":"user","content":"回复一个字：好"}],"stream":false}' 2>/dev/null) || true
  body=$(echo "$res" | head -n -1)
  code=$(echo "$res" | tail -n 1)
  if [ "$code" = "200" ]; then
    echo "HTTP 200 OK"
    echo "$body" | head -c 500
    echo ""
  else
    echo "HTTP $code"
    echo "$body" | head -c 300
  fi
  echo ""
done

echo "=== 2) 飞书配置检查（全链路第 1 环：通道是否可起）==="
node -e "
const fs = require('fs');
const p = process.env.OPENCLAW_STATE_DIR ? process.env.OPENCLAW_STATE_DIR + '/openclaw.json' : require('path').join(process.env.HOME || '', '.openclaw/openclaw.json');
let j = {};
try { j = JSON.parse(fs.readFileSync(p, 'utf8')); } catch (_) {}
const f = j.channels?.feishu;
const enabled = f?.enabled !== false;
const hasAppId = !!f?.accounts?.default?.appId;
const hasSecret = !!f?.accounts?.default?.appSecret;
const configured = enabled && hasAppId && hasSecret;
console.log('feishu.enabled:', enabled);
console.log('feishu.requireMention:', f?.requireMention);
console.log('feishu.appId 已配置:', hasAppId);
console.log('feishu.appSecret 已配置:', hasSecret);
console.log('结论: 飞书通道可启动?', configured ? '是' : '否（缺 appId/appSecret 或未启用）');
"

echo "=== 3) 飞书扩展单元测试（mock）==="
cd "$(dirname "$0")/../openclaw" && pnpm test --run extensions/feishu 2>&1 | tail -20

echo ""
echo "=== 4) 飞书无回复时：Gateway 日志关键词（端到端全链路）==="
echo "在运行 Gateway 的终端或日志文件中依次搜索以下关键词，可定位断在哪一环："
echo "  1) feishu: starting / starting feishu[default]  → 通道是否启动"
echo "  2) feishu[...]: received message from           → 是否收到消息"
echo "  3) did not mention bot                           → 群消息是否因未@被跳过"
echo "  4) dispatching to agent                          → 是否进入大模型"
echo "  5) dispatch complete (queuedFinal= true, replies=  → 是否有回复要下发"
echo "  6) Feishu send failed / Feishu reply failed      → 发消息 API 是否报错"
echo "详见: docs/热加载与无回复排查.md 第六节「飞书发消息端到端全链路检查」"
