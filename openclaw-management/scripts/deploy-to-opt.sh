#!/usr/bin/env bash
# 将 openclaw-management 构建并部署到 /opt，供磁盘镜像与量产使用。
# 量产环境：MANAGEMENT_PORT=8080，OPENCLAW_STATE_DIR 与 Gateway 一致（如 /root/.openclaw 或 /opt/amyclaw/state）。
# 用法: sudo ./scripts/deploy-to-opt.sh [源目录]
# 默认源目录为脚本所在目录的 ..（即 openclaw-management 根）。

set -e
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
SRC="${1:-$(cd "$SCRIPT_DIR/.." && pwd)}"
SRC="$(cd "$SRC" && pwd)"
DEST="/opt/openclaw-management"
STATE_DIR="${OPENCLAW_STATE_DIR:-/root/.openclaw}"
MANAGEMENT_PORT="${MANAGEMENT_PORT:-8080}"

if [[ ! -f "$SRC/server.js" || ! -f "$SRC/package.json" ]]; then
  echo "错误: 未在 $SRC 找到 server.js / package.json。" >&2
  exit 1
fi

echo "源目录: $SRC"
echo "目标目录: $DEST"
echo "OPENCLAW_STATE_DIR: $STATE_DIR"
echo "MANAGEMENT_PORT: $MANAGEMENT_PORT"

# 清理并创建目标
rm -rf "$DEST"
mkdir -p "$DEST"

# 复制运行所需文件（不含 .git、node_modules 可选，管理端无 npm 依赖）
rsync -a --exclude='.git' --exclude='node_modules' --exclude='data/token.txt' \
  "$SRC/" "$DEST/"

# 确保 data 目录存在
mkdir -p "$DEST/data"

# 写入 systemd 单元（/opt 量产用）
UNIT="/etc/systemd/system/openclaw-management.service"
cat > "$UNIT" << EOF
[Unit]
Description=OpenClaw 管理设置页 (量产 /opt, 端口 ${MANAGEMENT_PORT})
Documentation=file://${DEST}/README.md
After=network-online.target openclaw-gateway.service
Wants=network-online.target

[Service]
Type=simple
WorkingDirectory=${DEST}
ExecStart=/usr/bin/env node server.js
Restart=on-failure
RestartSec=5
Environment=OPENCLAW_STATE_DIR=${STATE_DIR}
Environment=MANAGEMENT_PORT=${MANAGEMENT_PORT}

[Install]
WantedBy=multi-user.target
EOF

echo "已写入 $UNIT"
systemctl daemon-reload
echo "部署完成。启用并启动: sudo systemctl enable openclaw-management.service && sudo systemctl start openclaw-management.service"
echo "访问: http://<本机IP>:${MANAGEMENT_PORT}"
echo "开发调试可用不同端口（如 MANAGEMENT_PORT=8000）在仓库内直接 node server.js 或 node --watch server.js"