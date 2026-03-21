#!/usr/bin/env bash
# 将 OpenClaw Gateway 与 管理页 的 systemd 单元安装到 /etc/systemd/system 并启用开机自启。
# 用法: sudo ./install-autostart.sh [仓库根路径]
# 默认仓库根路径为脚本所在目录的 ../../..（openclaw-management 的上级，即同时包含 openclaw 与 openclaw-management 的目录）。

set -e
REPO="${1:-$(cd "$(dirname "$0")/../../.." && pwd)}"
REPO="$(cd "$REPO" && pwd)"

if [[ ! -d "$REPO/openclaw" || ! -d "$REPO/openclaw-management" ]]; then
  echo "错误: 未在 $REPO 下找到 openclaw 与 openclaw-management 目录。" >&2
  exit 1
fi

echo "仓库路径: $REPO"
echo "安装 openclaw-gateway.service 与 openclaw-management.service ..."
cp "$REPO/openclaw/scripts/systemd/openclaw-gateway.service" /etc/systemd/system/
cp "$REPO/openclaw-management/scripts/systemd/openclaw-management.service" /etc/systemd/system/

# 若当前路径不是默认，则替换单元中的 WorkingDirectory
if [[ "$REPO" != "/mnt/disk/amyclaw" ]]; then
  sed -i "s|/mnt/disk/amyclaw|$REPO|g" /etc/systemd/system/openclaw-gateway.service /etc/systemd/system/openclaw-management.service
  echo "已把单元中的路径改为: $REPO"
fi

systemctl daemon-reload
systemctl enable openclaw-gateway.service openclaw-management.service
echo "已启用开机自启。"
echo "立即启动: sudo systemctl start openclaw-gateway.service openclaw-management.service"
echo "查看状态: sudo systemctl status openclaw-gateway.service openclaw-management.service"
