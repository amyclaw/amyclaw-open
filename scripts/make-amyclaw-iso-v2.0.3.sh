#!/usr/bin/env bash
# 母机打 AmyClaw v2.0.3 ISO：写入版本号并调用 eggs-produce-and-backup.sh
# 打 ISO 前仍须完成：mother-image-prepare、deploy-to-opt、apply-netplan（见 docs/eggs-量产克隆与使用说明.md）
#
# 用法：sudo bash /mnt/disk/amyclaw/scripts/make-amyclaw-iso-v2.0.3.sh
set -euo pipefail
[[ $(id -u) -eq 0 ]] || { echo "请使用 sudo 运行"; exit 1; }

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
VER="${AMYCLAW_IMAGE_VERSION:-v2.0.3}"

echo "AMYCLAW_IMAGE_VERSION=${VER}" > /etc/amyclaw-release
echo "BUILD_DATE=$(date -Iseconds)" >> /etc/amyclaw-release
echo "已写入 /etc/amyclaw-release："
cat /etc/amyclaw-release

export AMYCLAW_IMAGE_VERSION="${VER}"
exec bash "${SCRIPT_DIR}/eggs-produce-and-backup.sh"
