#!/usr/bin/env bash
# 母机打 ISO 前一次性准备：
# 1) 主机名改为 amyclaw（原 x1）
# 1b) root 与 amyclaw 密码设为 OEM 默认值（与 Krill/eggs 一致，避免克隆后为 root/root）
# 1c) 若已安装 eggs：合并 eggs dad + 写入 krill-amyclaw.yaml
# 2) 打印网络 DHCP 状态；2c/2d：resolv 软链 + resolved FallbackDNS（DHCP 无 DNS 时可解析）
# 3) 种子化 /root/.openclaw（Gateway LAN + 18789 管理界面可局域网访问）
#
# 之后请执行：
#   sudo bash /mnt/disk/amyclaw/docs/penguins-eggs/deploy-to-opt.sh
#   sudo /mnt/disk/amyclaw/scripts/eggs-produce-and-backup.sh
#
set -euo pipefail
[[ $(id -u) -eq 0 ]] || { echo "请使用 sudo 运行"; exit 1; }

NEW_HOST="${AMYCLAW_HOSTNAME:-amyclaw}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "========== 1. 主机名 -> ${NEW_HOST} =========="
if [[ "$(hostname)" != "$NEW_HOST" ]]; then
  hostnamectl set-hostname "$NEW_HOST"
  echo "已设置 hostname: $NEW_HOST"
else
  echo "主机名已是 $NEW_HOST"
fi

if [[ -f /etc/hosts ]]; then
  if grep -qE '127\.0\.1\.1\s+x1(\s|$)' /etc/hosts; then
    sed -i "s/127\.0\.1\.1\s\+x1/127.0.1.1\t${NEW_HOST}/" /etc/hosts
    echo "已更新 /etc/hosts 中 127.0.1.1 对应主机名为 ${NEW_HOST}"
  elif ! grep -qE "127\.0\.1\.1[[:space:]]+${NEW_HOST}" /etc/hosts; then
    if grep -q '127.0.1.1' /etc/hosts; then
      sed -i "s/^\(127\.0\.1\.1[[:space:]]\+\).*/\1${NEW_HOST}/" /etc/hosts
    else
      echo "127.0.1.1	${NEW_HOST}" >>/etc/hosts
    fi
    echo "已写入 /etc/hosts 127.0.1.1 -> ${NEW_HOST}"
  fi
fi

echo ""
echo "========== 1b. OEM 系统密码（root / amyclaw） =========="
bash "$SCRIPT_DIR/set-oem-system-passwords.sh"

echo ""
echo "========== 1c. eggs dad + krill 量产凭证 =========="
bash "$SCRIPT_DIR/apply-oem-penguins-eggs-credentials.sh"

echo ""
echo "========== 2. 网络 DHCP 检查（只读） =========="
bash "$SCRIPT_DIR/ensure-network-dhcp-default.sh" || true

echo ""
echo "========== 2b. 标准 DHCP（可选） =========="
echo "若需将 /etc/netplan 改为 DHCP 并自检后再打 ISO，请单独执行（SSH 静态 IP 可能断线）："
echo "  sudo bash $SCRIPT_DIR/apply-netplan-dhcp-oem.sh"
echo "或仅写入文件、不打断 SSH:  sudo APPLY_NETPLAN=0 bash $SCRIPT_DIR/apply-netplan-dhcp-oem.sh"

echo ""
echo "========== 2c. /etc/resolv.conf（systemd-resolved 软链，防镜像缺省） =========="
bash "$SCRIPT_DIR/ensure-resolv-conf-symlink.sh" || true

echo ""
echo "========== 2d. systemd-resolved 备用 DNS（DHCP 未下发 DNS 时仍可解析） =========="
bash "$SCRIPT_DIR/install-amyclaw-dns-fallback.sh" || true

echo ""
echo "========== 2e. 开机强制 resolv.conf 软链（防 cloud-init/NM 覆盖） =========="
bash "$SCRIPT_DIR/install-amyclaw-resolv-boot-fix.sh" || true

echo ""
echo "========== 3. OpenClaw 状态目录种子（LAN / 18789） =========="
bash "$SCRIPT_DIR/seed-amyclaw-openclaw-state.sh"

echo ""
echo "========== 完成 =========="
echo "下一步："
echo "  1) sudo bash /mnt/disk/amyclaw/docs/penguins-eggs/deploy-to-opt.sh"
echo "  2) sudo /mnt/disk/amyclaw/scripts/eggs-produce-and-backup.sh"
echo "ISO 名称将含主机名（如 ${NEW_HOST}_amd64_日期时间.iso）。"
