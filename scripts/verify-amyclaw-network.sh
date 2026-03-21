#!/usr/bin/env bash
# 验证本机出网与 HTTPS（用于 DHCP / 打 ISO 前自检）
# 用法: bash scripts/verify-amyclaw-network.sh（无需 root，除非需读受限路径）
set -euo pipefail

echo "========== AmyClaw 网络自检 =========="
echo "--- 路由 ---"
ip route | head -6 || true
echo ""
echo "--- ping 8.8.8.8 ---"
if ping -c 2 -W 3 8.8.8.8; then
  echo "OK: ICMP 出网"
else
  echo "FAIL: 无法 ping 8.8.8.8"
  exit 1
fi
echo ""
echo "--- DNS api.idatabase.ai ---"
getent hosts api.idatabase.ai || true
echo ""
echo "--- HTTPS HEAD https://api.idatabase.ai ---"
if curl -sI --connect-timeout 10 --max-time 20 https://api.idatabase.ai | head -5; then
  echo "OK: HTTPS 到 idatabase 可达"
else
  echo "FAIL: curl https://api.idatabase.ai"
  exit 1
fi
echo ""
echo "========== 全部通过 =========="
