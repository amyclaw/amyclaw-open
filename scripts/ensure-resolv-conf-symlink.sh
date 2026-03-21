#!/usr/bin/env bash
# 确保 /etc/resolv.conf 为 systemd-resolved 标准软链（打 ISO 前执行）
#
# 为何镜像里会「没有」resolv.conf：
# - Ubuntu 使用 systemd-resolved 时，/etc/resolv.conf 通常指向
#   ../run/systemd/resolve/stub-resolv.conf（或 resolv.conf）
# - eggs/mksquashfs 若误排除该路径，或母机上该文件曾被改成普通文件/删除，
#   克隆机首启可能出现解析异常。
# - 本脚本在母机打包前恢复与 Ubuntu 一致的软链，便于写入 squashfs。
#
# 用法: sudo bash /mnt/disk/amyclaw/scripts/ensure-resolv-conf-symlink.sh
set -euo pipefail
[[ $(id -u) -eq 0 ]] || { echo "请使用 sudo"; exit 1; }

TARGET="/etc/resolv.conf"

if [[ -L "$TARGET" ]]; then
  r="$(readlink "$TARGET")"
  if [[ "$r" == *"systemd/resolve"* ]]; then
    echo "OK: $TARGET 已是 systemd-resolved 软链 ($r)"
    exit 0
  fi
  rm -f "$TARGET"
elif [[ -f "$TARGET" ]]; then
  bak="/etc/resolv.conf.bak.$(date +%Y%m%d_%H%M%S)"
  cp -a "$TARGET" "$bak"
  echo "已备份原文件到 $bak"
  rm -f "$TARGET"
fi

# 与 Ubuntu 默认一致：相对路径 -> stub（由 resolved 在 /run 下提供内容）
ln -sf ../run/systemd/resolve/stub-resolv.conf "$TARGET"
echo "已设置 $TARGET -> ../run/systemd/resolve/stub-resolv.conf"
systemctl is-enabled systemd-resolved >/dev/null 2>&1 && systemctl restart systemd-resolved || true
