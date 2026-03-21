#!/usr/bin/env bash
# 将 eggs（dad）与 krill 配置为量产账号密码 amyclaw / amyclaw20260315
# 用法: sudo bash /mnt/disk/amyclaw/scripts/apply-oem-penguins-eggs-credentials.sh
set -euo pipefail
[[ $(id -u) -eq 0 ]] || { echo "请使用 sudo 运行"; exit 1; }

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
DAD_FILE="${REPO_ROOT}/docs/penguins-eggs/eggs-dad-example.yaml"
KRILL_SRC="${REPO_ROOT}/docs/penguins-eggs/krill-amyclaw.yaml"

if [[ ! -f "$KRILL_SRC" ]]; then echo "缺少 $KRILL_SRC"; exit 1; fi

if [[ -d /etc/penguins-eggs.d ]]; then
  echo "========== krill.yaml（无人值守安装 root/用户密码） =========="
  install -m 0644 "$KRILL_SRC" /etc/penguins-eggs.d/krill.yaml
  echo "已写入 /etc/penguins-eggs.d/krill.yaml"
else
  echo "警告: 无 /etc/penguins-eggs.d（可能未安装 penguins-eggs），跳过 krill 安装。"
fi

if command -v eggs >/dev/null 2>&1; then
  if [[ ! -f "$DAD_FILE" ]]; then echo "缺少 $DAD_FILE"; exit 1; fi
  echo "========== eggs dad（合并 snapshot_dir / root_passwd 等） =========="
  eggs dad --file "$DAD_FILE"
else
  echo "未找到 eggs 命令，跳过 eggs dad。安装 penguins-eggs 后请重新执行本脚本以合并 eggs.yaml。"
fi
