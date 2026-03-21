#!/usr/bin/env bash
# 为量产镜像种子化 /root/.openclaw：Gateway 绑定 LAN（18789）、Control UI 允许局域网通过
# Host 与 Origin 一致访问（192.168.x.x 等）；鉴权使用 Token（与 gateway.remote 同步）。
# 用法: sudo bash /mnt/disk/amyclaw/scripts/seed-amyclaw-openclaw-state.sh
set -euo pipefail
[[ $(id -u) -eq 0 ]] || { echo "请使用 sudo 运行"; exit 1; }

STATE_DIR="${OPENCLAW_STATE_DIR:-/root/.openclaw}"
CONFIG="$STATE_DIR/openclaw.json"
ENV_FILE="$STATE_DIR/.env"
PORT="${OPENCLAW_GATEWAY_PORT:-18789}"

mkdir -p "$STATE_DIR" "$STATE_DIR/workspace" "$STATE_DIR/canvas" 2>/dev/null || true
chmod 700 "$STATE_DIR" 2>/dev/null || true

gen_token() {
  if command -v openssl >/dev/null 2>&1; then
    openssl rand -hex 32
    return
  fi
  python3 - <<'PY'
import secrets
print(secrets.token_hex(32))
PY
}

if [[ -f "$ENV_FILE" ]] && grep -q '^OPENCLAW_GATEWAY_TOKEN=' "$ENV_FILE" 2>/dev/null; then
  TOKEN="$(grep '^OPENCLAW_GATEWAY_TOKEN=' "$ENV_FILE" | head -1 | cut -d= -f2- | tr -d '\r' | sed 's/^["'\'']//;s/["'\'']$//')"
fi
if [[ -z "${TOKEN:-}" ]]; then
  TOKEN="$(gen_token)"
  umask 077
  if [[ -f "$ENV_FILE" ]]; then
    if grep -q '^OPENCLAW_GATEWAY_TOKEN=' "$ENV_FILE"; then
      sed -i "s|^OPENCLAW_GATEWAY_TOKEN=.*|OPENCLAW_GATEWAY_TOKEN=$TOKEN|" "$ENV_FILE"
    else
      echo "OPENCLAW_GATEWAY_TOKEN=$TOKEN" >>"$ENV_FILE"
    fi
  else
    echo "OPENCLAW_GATEWAY_TOKEN=$TOKEN" >"$ENV_FILE"
    chmod 600 "$ENV_FILE"
  fi
fi

export OPENCLAW_GATEWAY_TOKEN="$TOKEN"

node << NODEJS
const fs = require("fs");
const path = "$CONFIG";
const port = ${PORT};
const token = process.env.OPENCLAW_GATEWAY_TOKEN;

let cfg = {};
if (fs.existsSync(path)) {
  try {
    cfg = JSON.parse(fs.readFileSync(path, "utf8"));
  } catch (e) {
    console.error("读取已有配置失败，将覆盖:", e.message);
  }
}

cfg.gateway = cfg.gateway || {};
cfg.gateway.mode = "local";
cfg.gateway.bind = "lan";
cfg.gateway.port = port;
cfg.gateway.auth = cfg.gateway.auth || {};
cfg.gateway.auth.mode = "token";
cfg.gateway.auth.token = token;
cfg.gateway.remote = cfg.gateway.remote || {};
cfg.gateway.remote.token = token;
cfg.gateway.controlUi = cfg.gateway.controlUi || {};
cfg.gateway.controlUi.enabled = cfg.gateway.controlUi.enabled !== false;
// 局域网内用 http://<本机IP>:18789 打开时，Origin 与 Host 一致；与显式列表共同满足校验
cfg.gateway.controlUi.allowedOrigins = [
  "http://127.0.0.1:" + port,
  "http://localhost:" + port,
  "http://[::1]:" + port,
];
cfg.gateway.controlUi.dangerouslyAllowHostHeaderOriginFallback = true;
// 明文 http://amyclaw.local:18789 等（非 HTTPS、非 127.0.0.1）无「安全上下文」，浏览器无法提供设备身份；
// 否则握手报错：control ui requires device identity。量产局域网仅信 Token 时开启（见 OpenClaw control-ui 文档）。
cfg.gateway.controlUi.dangerouslyDisableDeviceAuth = true;

fs.writeFileSync(path, JSON.stringify(cfg, null, 2) + "\n", "utf8");
console.log("已写入:", path);
NODEJS

chmod 600 "$CONFIG" 2>/dev/null || true
echo "OPENCLAW_GATEWAY_TOKEN 已写入 $ENV_FILE（若新建）且 gateway 已设为 bind=lan + Control UI 局域网访问。"
echo "说明: 192.168.0.0/16 等私网通过浏览器访问时使用「IP:端口」，与 Host 头一致即可；安全边界依赖 Token 与防火墙。"
