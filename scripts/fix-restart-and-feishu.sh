#!/usr/bin/env bash
# 修复「重启网关」按钮 Not found、飞书无回复：编译 openclaw、同步管理端（若为 opt）、重启服务。
# 在仓库根路径执行：bash scripts/fix-restart-and-feishu.sh

set -e
REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_ROOT"

echo "==> 编译 openclaw（含 idatabase 工具 schema 清理）..."
(cd openclaw && npm run build) || { echo "编译失败"; exit 1; }

echo "==> 打包 feishu 扩展为 index.js（供 /opt 加载）..."
(cd openclaw && node scripts/build-feishu-extension.mjs) || { echo "feishu 扩展打包失败"; exit 1; }

# 若存在 /opt/amyclaw（恢复机部署），同步 openclaw 构建与管理端，使「重启网关」与飞书回复（Google 工具 schema 清理）生效
# 注意：不覆盖 node_modules（pnpm 符号链接拷到 OPT 易失效），只同步代码与 dist；若 OPT 缺依赖需在 OPT 内执行 npm install
if [ -d /opt/amyclaw ]; then
  echo "==> 同步 openclaw 构建到 /opt/amyclaw（不含 node_modules，避免 pnpm 链接失效）..."
  sudo rsync -a --delete \
    --exclude='.git' --exclude='src' --exclude='docs' --exclude='apps' --exclude='*.test.*' \
    --exclude='node_modules' \
    "$REPO_ROOT/openclaw/" /opt/amyclaw/openclaw/ 2>/dev/null || true
  if [ ! -f /opt/amyclaw/openclaw/node_modules/.package-lock.json ] 2>/dev/null && [ -f /opt/amyclaw/openclaw/package.json ]; then
    echo "==> OPT openclaw 缺少 node_modules，正在 npm install..."
    (cd /opt/amyclaw/openclaw && sudo npm install --omit=dev) || true
  fi
  echo "==> 同步管理端到 /opt/amyclaw..."
  sudo cp -f "$REPO_ROOT/openclaw-management/server.js" /opt/amyclaw/openclaw-management/ 2>/dev/null || true
  sudo cp -f "$REPO_ROOT/openclaw-management/public/index.html" /opt/amyclaw/openclaw-management/public/ 2>/dev/null || true
fi

echo "==> 重启 openclaw-gateway..."
sudo systemctl restart openclaw-gateway.service
sleep 3
systemctl is-active openclaw-gateway.service --quiet || { echo "网关未启动"; exit 1; }

echo "==> 重启 openclaw-management（使「重启网关」接口与前端生效）..."
sudo systemctl restart openclaw-management.service
sleep 2
systemctl is-active openclaw-management.service --quiet || true

echo "==> 完成。请强制刷新管理页（Ctrl+Shift+R）后重试「重启网关」；飞书发一条消息测试回复。"
