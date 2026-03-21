#!/usr/bin/env bash
# 关闭当前 Gateway + 管理页，改为启动「与管理系统链接的一套」用于测试：
#  - 管理页（8080）与 Gateway（18789）同机、同 OPENCLAW_STATE_DIR，管理页默认请求 http://127.0.0.1:18789
# 使用 dev 路径（/mnt/disk/amyclaw）的 systemd 单元并启动，便于与 8080 管理页联调。
# 用法：在仓库根执行 sudo bash docs/penguins-eggs/restart-management-linked-services.sh

set -e
REPO="${AMYCLAW_DEV_PATH:-/mnt/disk/amyclaw}"
REPO="$(cd "$REPO" && pwd)"

echo ">>> 停止现有 Gateway 与 管理页"
systemctl stop openclaw-gateway.service openclaw-management.service 2>/dev/null || true

echo ">>> 安装并启用 dev 路径的 systemd 单元（$REPO）"
if [[ -x "$REPO/openclaw-management/scripts/systemd/install-autostart.sh" ]]; then
  "$REPO/openclaw-management/scripts/systemd/install-autostart.sh" "$REPO"
else
  cp "$REPO/openclaw/scripts/systemd/openclaw-gateway.service" /etc/systemd/system/
  cp "$REPO/openclaw-management/scripts/systemd/openclaw-management.service" /etc/systemd/system/
  if [[ "$REPO" != "/mnt/disk/amyclaw" ]]; then
    sed -i "s|/mnt/disk/amyclaw|$REPO|g" /etc/systemd/system/openclaw-gateway.service /etc/systemd/system/openclaw-management.service
  fi
  systemctl daemon-reload
  systemctl enable openclaw-gateway.service openclaw-management.service
fi

echo ">>> 先启动 Gateway（18789），再启动管理页（8080）"
systemctl start openclaw-gateway.service
sleep 2
systemctl start openclaw-management.service

echo ">>> 状态"
systemctl status openclaw-gateway.service openclaw-management.service --no-pager || true
echo ""
echo "管理页: http://本机IP:8080 （如 http://10.8.52.123:8080/）"
echo "Gateway 默认被管理页请求: http://127.0.0.1:18789"
