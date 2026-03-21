#!/usr/bin/env bash
# 将母机网络改为 DHCP + 固定 DNS 列表（写入 /etc/netplan/50-cloud-init.yaml），用于打入 ISO。
# 模板匹配任意 en* 以太网；dhcp4-overrides.use-dns: false，nameservers 见 netplan-50-dhcp.yaml。
#
# 用法:
#   sudo bash /mnt/disk/amyclaw/scripts/apply-netplan-dhcp-oem.sh
#
# 环境变量:
#   APPLY_NETPLAN=0  只写入文件，不执行 netplan apply（适合 SSH 静态 IP，稍后在控制台 apply）
#   APPLY_NETPLAN=1  写入后立即 netplan apply 并跑网络自检（默认）
#
# 若当前通过 SSH 静态 IP 连接，apply 可能断线，请在机房控制台操作或设 APPLY_NETPLAN=0。
set -euo pipefail
[[ $(id -u) -eq 0 ]] || { echo "请使用 sudo"; exit 1; }

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
SRC="${REPO_ROOT}/docs/penguins-eggs/netplan-50-dhcp.yaml"
TARGET="/etc/netplan/50-cloud-init.yaml"
APPLY_NETPLAN="${APPLY_NETPLAN:-1}"

if [[ ! -f "$SRC" ]]; then echo "缺少 $SRC"; exit 1; fi
cp -a "$TARGET" "${TARGET}.bak.before-dhcp.$(date +%Y%m%d_%H%M)" 2>/dev/null || true
cp -a "$SRC" "$TARGET"
chmod 600 "$TARGET" 2>/dev/null || true
echo "已写入 $TARGET（DHCP，match en*）。"

netplan generate
echo "netplan generate: OK"

if [[ "$APPLY_NETPLAN" == "1" ]]; then
  echo "执行 netplan apply …"
  netplan apply
  sleep 2
  echo ""
  bash "$SCRIPT_DIR/verify-amyclaw-network.sh"
else
  echo "已跳过 netplan apply（APPLY_NETPLAN=0）。需要生效时请在本机控制台执行: netplan apply"
  echo "然后执行: bash $SCRIPT_DIR/verify-amyclaw-network.sh"
fi
