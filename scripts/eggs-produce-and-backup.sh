#!/usr/bin/env bash
# Penguins' Eggs：打包当前系统为 ISO，并复制到 /mnt/backup
#
# 已做配置：
# - exclude.list.d：mnt/* 不打包（/mnt 下任何内容均不进入镜像）
# - eggs-unattended-install.service：仅 Live 下生效，自动执行 eggs install --unattended -n --halt
# - krill.yaml：用户/密码与 eggs.yaml 一致，DHCP，安装后关机
#
# 打 ISO 前建议先执行（主机名 amyclaw、LAN 访问 18789、DHCP 检查、OpenClaw 种子）：
#   sudo bash /mnt/disk/amyclaw/scripts/mother-image-prepare-for-amyclaw-iso.sh
#   sudo bash /mnt/disk/amyclaw/docs/penguins-eggs/deploy-to-opt.sh
#
# 使用：sudo /mnt/disk/amyclaw/scripts/eggs-produce-and-backup.sh
# 可选：AMYCLAW_IMAGE_VERSION=v2.0-release（默认 v2.0-release），备份时会额外生成带版本号的 ISO 文件名
set -euo pipefail

# 必须以 root 运行
[[ $(id -u) -eq 0 ]] || { echo "请使用 sudo 运行"; exit 1; }

AMYCLAW_IMAGE_VERSION="${AMYCLAW_IMAGE_VERSION:-v2.0-release}"
BACKUP_DIR="/mnt/backup"
SNAPSHOT_DIR="${SNAPSHOT_DIR:-/var/tmp/eggs}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "========== 1. 安全清理（可选，已注释） =========="
# 取消下面注释可在打包前清理缓存与日志，减小镜像体积
# apt-get clean
# journalctl --vacuum-time=1d
# find /var/tmp -mindepth 1 -maxdepth 1 -type f -mtime +1 -delete 2>/dev/null || true

echo "========== 1b. /etc/resolv.conf（打 ISO 前确保标准软链） =========="
bash "$SCRIPT_DIR/ensure-resolv-conf-symlink.sh" || true

echo "========== 1c. systemd-resolved FallbackDNS（克隆机 DHCP 无 DNS 时可用） =========="
bash "$SCRIPT_DIR/install-amyclaw-dns-fallback.sh" || true

echo "========== 1c2. 开机 unit：保持 resolv.conf -> stub =========="
bash "$SCRIPT_DIR/install-amyclaw-resolv-boot-fix.sh" || true

REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
echo "========== 1d. 同步 netplan 模板到 /etc/netplan（打入 ISO；未自动 apply） =========="
NP="$REPO_ROOT/docs/penguins-eggs/netplan-50-dhcp.yaml"
if [[ -f "$NP" ]]; then
  cp -a "$NP" /etc/netplan/50-cloud-init.yaml
  chmod 600 /etc/netplan/50-cloud-init.yaml
  netplan generate 2>/dev/null || true
  echo "已写入 /etc/netplan/50-cloud-init.yaml（与仓库一致）。母机若需立即生效: sudo netplan apply"
else
  echo "警告: 未找到 $NP，跳过 netplan 同步"
fi

echo "========== 1e. 磁盘空间检查 =========="
avail_kb="$(LANG=C df --output=avail -B1 / 2>/dev/null | tail -1 | tr -d ' ')"
# -B1 单位为字节；打 ISO 时临时文件+输出约需 ≥6GiB（仅 4GiB 仍可能在 xorriso 阶段失败）
MIN_FREE=$((6 * 1024 * 1024 * 1024))
if [[ "${avail_kb:-0}" =~ ^[0-9]+$ ]] && [[ "$avail_kb" -lt "$MIN_FREE" ]]; then
  echo "错误: 根分区可用空间不足约 6GiB（当前约 $((avail_kb / 1024 / 1024))GiB），eggs/xorriso 生成 ~3.5G ISO 仍可能中途占满。"
  echo "请清理: /var/tmp/eggs、旧 ISO、apt 缓存等后再运行。"
  exit 1
fi

echo "========== 2. 生成 ISO（clone 模式，无人值守） =========="
# --clone: 非加密克隆
# -n: 非交互
# 不使用 --excludes static，以便使用 exclude.list.d 中 mnt/* 等排除
eggs produce --clone -n

echo "========== 3. 复制 ISO 到 ${BACKUP_DIR} =========="
mkdir -p "$BACKUP_DIR"
ISO_TS="$(date +%Y%m%d_%H%M)"
# ISO 实际文件在 snapshot_dir/mnt/*.iso
for iso in "$SNAPSHOT_DIR"/mnt/*.iso; do
  [[ -e "$iso" ]] || continue
  name=$(basename "$iso")
  cp -v "$iso" "$BACKUP_DIR/$name"
  echo "已复制: $BACKUP_DIR/$name"
  ver_name="amyclaw_${AMYCLAW_IMAGE_VERSION}_amd64_${ISO_TS}.iso"
  cp -v "$iso" "$BACKUP_DIR/$ver_name"
  echo "版本标记 ISO: $BACKUP_DIR/$ver_name (AMYCLAW_IMAGE_VERSION=${AMYCLAW_IMAGE_VERSION})"
done

echo "========== 完成 =========="
echo "ISO 已生成并复制到: ${BACKUP_DIR}"
echo "镜像版本: ${AMYCLAW_IMAGE_VERSION}（见 /etc/amyclaw-release）"
echo "刻录 U 盘后从 U 盘启动，将自动完成克隆安装并关机，无需操作员干预。"
echo "重启后从硬盘启动，联网后访问管理终端填写飞书号、大模型密钥等信息即可使用。"
