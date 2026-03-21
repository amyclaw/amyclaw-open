#!/usr/bin/env bash
# 将本机 root 与标准用户密码设为 OEM 默认值（与 eggs/krill 文档一致），打 ISO 前执行，
# 使克隆镜像内的 /etc/shadow 即为正确哈希，避免出现 root/root 等与 Krill 不一致的情况。
#
# 用法: sudo bash /mnt/disk/amyclaw/scripts/set-oem-system-passwords.sh
# 环境变量 AMYCLAW_OEM_PASSWORD / STANDARD_USER_NAME 可覆盖默认值。
set -euo pipefail
[[ $(id -u) -eq 0 ]] || { echo "请使用 sudo 运行"; exit 1; }

PW="${AMYCLAW_OEM_PASSWORD:-amyclaw20260315}"
STANDARD_USER="${STANDARD_USER_NAME:-amyclaw}"

if ! id -u "$STANDARD_USER" &>/dev/null; then
  if command -v adduser >/dev/null 2>&1; then
    adduser --disabled-password --gecos "AmyClaw" "$STANDARD_USER" || true
  else
    useradd -m -s /bin/bash "$STANDARD_USER" || true
  fi
fi

echo "root:$PW" | chpasswd
echo "${STANDARD_USER}:$PW" | chpasswd

# Ubuntu/Debian：标准用户须加入 sudo 组，否则无法 sudo，也无法按文档用「amyclaw + sudo」管理 sshd/服务
if getent group sudo >/dev/null 2>&1; then
  usermod -aG sudo "$STANDARD_USER" 2>/dev/null || true
fi

echo "已设置 root 与 ${STANDARD_USER} 的密码为 OEM 默认值（${#PW} 字符）。"
if getent group sudo >/dev/null 2>&1 && id -nG "$STANDARD_USER" 2>/dev/null | grep -qw sudo; then
  echo "已将 ${STANDARD_USER} 加入 sudo 组。"
else
  echo "警告: 未检测到 sudo 组或未成功加入，请手动: usermod -aG sudo ${STANDARD_USER}"
fi
