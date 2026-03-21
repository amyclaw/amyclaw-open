#!/usr/bin/env bash
# 在 x1（或状态目录在 /root/.openclaw 的机器）上修复：
# 1) gateway.mode 未设置导致网关无法启动
# 2) gateway.remote.token 未设置导致 CLI 连不上
# 用法: sudo bash fix-gateway-config-on-x1.sh  或  OPENCLAW_STATE_DIR=/root/.openclaw bash fix-gateway-config-on-x1.sh

set -e
STATE_DIR="${OPENCLAW_STATE_DIR:-/root/.openclaw}"
CONFIG="$STATE_DIR/openclaw.json"
ENV_FILE="$STATE_DIR/.env"

if [[ ! -f "$CONFIG" ]]; then
  echo "错误: 未找到 $CONFIG"
  exit 1
fi

# 使用 Node 一次性修复：补全 gateway.mode、从 .env 取 token 写入 gateway.remote.token
# 注意：脚本内避免使用 ! 以免在 bash 下被历史展开
node << NODEEOF
const fs = require('fs');
const cfgPath = '$CONFIG';
const envPath = '$ENV_FILE';
let cfg;
try {
  cfg = JSON.parse(fs.readFileSync(cfgPath, 'utf8'));
} catch (e) {
  console.error('读取配置失败:', e.message);
  process.exit(1);
}

cfg.gateway = cfg.gateway || {};
cfg.gateway.auth = cfg.gateway.auth || {};
cfg.gateway.remote = cfg.gateway.remote || {};

if (cfg.gateway.mode !== 'local' && cfg.gateway.mode !== 'remote') {
  cfg.gateway.mode = 'local';
  console.log('已设置 gateway.mode = local');
}

let token = '';
const at = cfg.gateway.auth && cfg.gateway.auth.token;
if (typeof at === 'string' && at.trim()) token = at.trim();
if (!token && envPath) {
  try {
    const env = fs.readFileSync(envPath, 'utf8');
    const m = env.match(/^OPENCLAW_GATEWAY_TOKEN=(.*)$/m);
    if (m) token = m[1].replace(/^["']|["']$/g, '').trim();
  } catch (_) {}
}
if (token) {
  cfg.gateway.remote.token = token;
  console.log('已设置 gateway.remote.token');
} else {
  console.warn('未找到 Token，请确保 .env 中有 OPENCLAW_GATEWAY_TOKEN 或 openclaw.json 中 gateway.auth.token 为字符串');
}

fs.writeFileSync(cfgPath, JSON.stringify(cfg, null, 2) + '\n', 'utf8');
console.log('配置已写入:', cfgPath);
NODEEOF
