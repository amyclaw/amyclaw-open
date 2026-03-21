#!/usr/bin/env bash
# 将 gateway.remote.token 设为与网关鉴权一致，修复 openclaw CLI 连网关报 token_mismatch / Gateway not reachable。
# 在状态目录所在机器执行，例如：OPENCLAW_STATE_DIR=/root/.openclaw bash scripts/sync-gateway-remote-token.sh

set -e
STATE_DIR="${OPENCLAW_STATE_DIR:-$HOME/.openclaw}"
CONFIG="$STATE_DIR/openclaw.json"
ENV_FILE="$STATE_DIR/.env"

if [[ ! -f "$CONFIG" ]]; then
  echo "错误: 未找到配置 $CONFIG"
  exit 1
fi

# 1) 从 openclaw.json 取 gateway.auth.token（若为字符串则直接用）
# 2) 若为 env 引用或未取到，从 .env 取 OPENCLAW_GATEWAY_TOKEN
TOKEN=""
if command -v node &>/dev/null; then
  TOKEN=$(node -e "
    const fs = require('fs');
    const cfg = JSON.parse(fs.readFileSync('$CONFIG', 'utf8'));
    const t = cfg?.gateway?.auth?.token;
    if (typeof t === 'string' && t.trim()) {
      console.log(t.trim());
      process.exit(0);
    }
    try {
      const env = fs.readFileSync('$ENV_FILE', 'utf8');
      const line = env.split('\n').find(l => l.startsWith('OPENCLAW_GATEWAY_TOKEN='));
      if (line) {
        const v = line.replace(/^OPENCLAW_GATEWAY_TOKEN=/, '').replace(/^["']|["']$/g, '').trim();
        if (v) { console.log(v); process.exit(0); }
      }
    } catch (_) {}
    process.exit(1);
  " 2>/dev/null) || true
fi

if [[ -z "$TOKEN" ]] && [[ -f "$ENV_FILE" ]]; then
  TOKEN=$(grep -E '^OPENCLAW_GATEWAY_TOKEN=' "$ENV_FILE" | head -1 | sed 's/^OPENCLAW_GATEWAY_TOKEN=//' | sed 's/^["'\'']//;s/["'\'']$//' | tr -d '\r')
fi

if [[ -z "$TOKEN" ]]; then
  echo "未找到 Gateway Token。请先在管理页生成/保存 Token，或确保 $ENV_FILE 中有 OPENCLAW_GATEWAY_TOKEN。"
  exit 1
fi

# 用 node 写回 gateway.remote.token，避免破坏 JSON 结构（token 经环境变量传入，避免特殊字符问题）
export OPENCLAW_SYNC_TOKEN="$TOKEN"
node -e "
  const fs = require('fs');
  const path = process.env.CONFIG_PATH || '$CONFIG';
  const token = process.env.OPENCLAW_SYNC_TOKEN || '';
  if (!token) { console.error('OPENCLAW_SYNC_TOKEN 为空'); process.exit(1); }
  const cfg = JSON.parse(fs.readFileSync(path, 'utf8'));
  if (!cfg.gateway) cfg.gateway = {};
  if (!cfg.gateway.remote) cfg.gateway.remote = {};
  cfg.gateway.remote.token = token;
  fs.writeFileSync(path, JSON.stringify(cfg, null, 2) + '\n', 'utf8');
  console.log('已设置 gateway.remote.token，与网关鉴权一致。可重试: openclaw logs --follow 或 openclaw doctor');
"
