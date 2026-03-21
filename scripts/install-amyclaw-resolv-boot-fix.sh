#!/usr/bin/env bash
# 安装开机 unit：防止 /etc/resolv.conf 被覆盖后需手工 ln
# 用法: sudo bash /mnt/disk/amyclaw/scripts/install-amyclaw-resolv-boot-fix.sh
set -euo pipefail
[[ $(id -u) -eq 0 ]] || { echo "请使用 sudo"; exit 1; }

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
SRC="${REPO_ROOT}/docs/penguins-eggs/systemd/system/amyclaw-fix-resolv.service"
DEST="/etc/systemd/system/amyclaw-fix-resolv.service"

if [[ ! -f "$SRC" ]]; then echo "缺少 $SRC"; exit 1; fi
cp -a "$SRC" "$DEST"
chmod 0644 "$DEST"
systemctl daemon-reload
systemctl enable amyclaw-fix-resolv.service
echo "已启用 $DEST（每次进入 multi-user 在 network-online 后执行一次 ln -sf）"
