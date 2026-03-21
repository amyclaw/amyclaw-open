#!/usr/bin/env bash
# 克隆机无 /mnt 仓库时使用：从 /opt/amyclaw/oem 安装网络/DNS 相关配置（需 root）
# 母机打 ISO 前 deploy-to-opt.sh 会把 oem 文件同步到本路径。
set -euo pipefail
[[ $(id -u) -eq 0 ]] || { echo "请使用 sudo"; exit 1; }

OEM="/opt/amyclaw/oem"
if [[ ! -d "$OEM" ]]; then
  echo "缺少 $OEM（母机是否执行过 deploy-to-opt.sh 并重新打 ISO？）"
  exit 1
fi

echo ">>> resolv.conf 软链"
ln -sf ../run/systemd/resolve/stub-resolv.conf /etc/resolv.conf

echo ">>> systemd-resolved drop-in"
mkdir -p /etc/systemd/resolved.conf.d
[[ -f "$OEM/systemd/resolved.conf.d/99-amyclaw-fallback-dns.conf" ]] && \
  cp -a "$OEM/systemd/resolved.conf.d/99-amyclaw-fallback-dns.conf" /etc/systemd/resolved.conf.d/

echo ">>> amyclaw-fix-resolv.service"
[[ -f "$OEM/systemd/system/amyclaw-fix-resolv.service" ]] && \
  cp -a "$OEM/systemd/system/amyclaw-fix-resolv.service" /etc/systemd/system/ && \
  systemctl daemon-reload && \
  systemctl enable amyclaw-fix-resolv.service

echo ">>> netplan（可选 netplan apply，SSH 静态 IP 请谨慎）"
if [[ -f "$OEM/netplan-50-dhcp.yaml" ]]; then
  cp -a "$OEM/netplan-50-dhcp.yaml" /etc/netplan/50-cloud-init.yaml
  chmod 600 /etc/netplan/50-cloud-init.yaml
  netplan generate
  echo "已写入 /etc/netplan/50-cloud-init.yaml；需要立即生效请: netplan apply"
fi

systemctl restart systemd-resolved 2>/dev/null || true
echo ">>> 完成。可执行: resolvectl status"
