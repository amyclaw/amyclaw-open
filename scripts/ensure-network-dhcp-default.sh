#!/usr/bin/env bash
# 检查本机网络是否为 DHCP（IPv4）；用于母机打镜像前确认「自动获取 IP/DNS」为默认行为。
# 不强制改写网络配置，避免 SSH 断连。若需强制改为 DHCP，请手工按 docs/penguins-eggs/网络-DHCP-说明.md 操作。
# 用法: sudo bash scripts/ensure-network-dhcp-default.sh
set -euo pipefail

echo "========== 网络 / DHCP 检查 =========="

if command -v nmcli >/dev/null 2>&1; then
  echo "--- NetworkManager 活动连接 ---"
  nmcli -t -f NAME,DEVICE,TYPE connection show --active 2>/dev/null || true
  echo ""
  for c in $(nmcli -t -f NAME connection show --active 2>/dev/null | cut -d: -f1); do
    echo "连接: $c"
    nmcli connection show "$c" 2>/dev/null | grep -E 'ipv4\.method|ipv4\.dns|DHCP' || true
  done
fi

if [[ -d /etc/netplan ]] && compgen -G '/etc/netplan/*.yaml' >/dev/null; then
  echo ""
  echo "--- /etc/netplan ---"
  for f in /etc/netplan/*.yaml; do
    echo "文件: $f"
    grep -E 'dhcp4|dhcp6|addresses|nameservers|renderer' "$f" 2>/dev/null || cat "$f"
  done
fi

if command -v resolvectl >/dev/null 2>&1; then
  echo ""
  echo "--- systemd-resolved（DNS 来源） ---"
  resolvectl status 2>/dev/null | head -40 || true
fi

echo ""
echo "若 ipv4.method 为 auto 或 netplan 中 dhcp4: true，即为 DHCP。"
echo "克隆安装目标机默认由 Krill/安装器使用 DHCP（见 eggs 文档与 /etc/penguins-eggs.d/krill.yaml）。"
