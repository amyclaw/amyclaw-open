#!/bin/bash
# 在 10.8.52.30 服务器上执行：把 hk123 备份里的 ISO 复制一份到 james/download
# 因 download 共享对客户端只读，需在服务器本地执行本脚本。

ISO_NAME="amyclaw_v1.01_20260316_0601.iso"
SRC="/mnt/disk/amyclaw/hk123/${ISO_NAME}"
DEST_DIR="/mnt/hdd12t/james/download/amyclaw"

if [ ! -f "$SRC" ]; then
  echo "源文件不存在: $SRC"
  exit 1
fi
mkdir -p "$DEST_DIR"
cp -v "$SRC" "$DEST_DIR/"
echo "已复制到: $DEST_DIR/${ISO_NAME}"
