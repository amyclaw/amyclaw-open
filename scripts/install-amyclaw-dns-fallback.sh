#!/usr/bin/env bash
# 安装 systemd-resolved 全局 DNS=（与 netplan nameservers 一致；不单依赖 FallbackDNS）
# 依赖：systemd-resolved；模板见 docs/penguins-eggs/systemd/resolved.conf.d/
# 用法: sudo bash /mnt/disk/amyclaw/scripts/install-amyclaw-dns-fallback.sh
set -euo pipefail
[[ $(id -u) -eq 0 ]] || { echo "请使用 sudo 运行"; exit 1; }

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
SRC="${REPO_ROOT}/docs/penguins-eggs/systemd/resolved.conf.d/99-amyclaw-fallback-dns.conf"
DEST_DIR="/etc/systemd/resolved.conf.d"
DEST="${DEST_DIR}/99-amyclaw-fallback-dns.conf"

if [[ ! -f "$SRC" ]]; then
  echo "缺少模板: $SRC"
  exit 1
fi

mkdir -p "$DEST_DIR"
cp -a "$SRC" "$DEST"
chmod 0644 "$DEST"
echo "已安装 $DEST"

systemctl enable systemd-resolved 2>/dev/null || true
if ! systemctl restart systemd-resolved 2>/dev/null; then
  echo "警告: systemctl restart systemd-resolved 失败（可能未安装或被 mask），drop-in 已写入，重启后通常仍会生效"
fi
sleep 1
resolvectl status 2>/dev/null | head -25 || true
echo "若需立即生效于应用：部分程序会缓存 DNS；可 resolvectl flush-caches"
