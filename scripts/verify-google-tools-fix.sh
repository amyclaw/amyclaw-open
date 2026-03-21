#!/usr/bin/env bash
# 校验当前运行所用的 openclaw 构建是否包含「Google 工具 schema 清理」修复（避免 400 patternProperties/const）。
# 用法：bash scripts/verify-google-tools-fix.sh

set -e
GW_DIR=""
if systemctl show openclaw-gateway --property=WorkingDirectory -v 2>/dev/null | grep -q "WorkingDirectory="; then
  GW_DIR=$(systemctl show openclaw-gateway --property=WorkingDirectory 2>/dev/null | sed 's/WorkingDirectory=//')
fi
if [ -z "$GW_DIR" ]; then
  GW_DIR="/opt/amyclaw/openclaw"
fi

echo "网关 WorkingDirectory: $GW_DIR"
if [ ! -d "$GW_DIR/dist" ]; then
  echo "错误: $GW_DIR/dist 不存在"
  exit 1
fi

# 修复特征：reply-*.js 或相关 chunk 中包含对 provider "google" 的清理判断
if grep -rq 'params\.provider === "google"' "$GW_DIR/dist"/*.js 2>/dev/null; then
  echo "结果: 已包含 Google 工具 schema 清理修复（provider === \"google\"）"
  exit 0
fi
echo "结果: 未检测到修复，请在本仓库执行: bash scripts/fix-restart-and-feishu.sh 或 deploy-to-opt.sh 后重启网关"
exit 1
