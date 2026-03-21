#!/bin/bash
# 将编译后的 OpenClaw + 管理端部署到 /opt/amyclaw（无源码、无敏感数据）
# 供 eggs 打包前执行；需 root。
#
# 逻辑：dev 路径（开发仓库）与 opt 路径（量产）是两套；测试可在任一路径做，
# 测试通过后必须执行本脚本，将 dev 同步到 opt 覆盖量产版本。
# 同步前请在 dev 的 openclaw 目录下执行：pnpm build
# 本脚本会在 rsync 前自动执行 pnpm ui:build，生成 dist/control-ui（18789 Control UI 静态资源）；
# 若跳过则网关启动时会尝试自动构建，量产机常因无完整 dev 依赖而报「Control UI build failed」。
#
# 可选：AMYCLAW_DEV_PATH 指定开发仓库路径，默认 /mnt/disk/amyclaw

set -e
OPT_AMYCLAW=/opt/amyclaw
SRC="${AMYCLAW_DEV_PATH:-/mnt/disk/amyclaw}"

echo ">>> 清理并创建 $OPT_AMYCLAW"
# 注意：/mnt 下仓库不会进入 ISO；量产机仅存在 /opt/amyclaw。oem 供克隆机在无 /mnt 时修复网络/DNS。
rm -rf "$OPT_AMYCLAW"/openclaw "$OPT_AMYCLAW"/openclaw-management "$OPT_AMYCLAW"/oem
mkdir -p "$OPT_AMYCLAW"

echo ">>> OpenClaw：构建 Control UI（生成 dist/control-ui/index.html，避免网关启动时自动构建失败）"
if [[ "${AMYCLAW_SKIP_UI_BUILD:-}" == "1" ]]; then
  echo ">>> 跳过 ui:build（已设 AMYCLAW_SKIP_UI_BUILD=1；量产镜像将无 18789 网页，仅适合排障）"
elif [[ -d "$SRC/openclaw" ]] && command -v pnpm >/dev/null 2>&1; then
  (cd "$SRC/openclaw" && pnpm ui:build) || { echo ">>> 错误: pnpm ui:build 失败；请在本机 openclaw 目录修复后重试，或显式 AMYCLAW_SKIP_UI_BUILD=1 跳过（不推荐）"; exit 1; }
  if [[ ! -f "$SRC/openclaw/dist/control-ui/index.html" ]]; then
    echo ">>> 错误: 构建后仍缺少 $SRC/openclaw/dist/control-ui/index.html"; exit 1
  fi
  echo ">>> Control UI 静态资源已就绪: dist/control-ui/"
else
  echo ">>> 错误: 需要 pnpm 与 $SRC/openclaw 才能部署（或设 AMYCLAW_SKIP_UI_BUILD=1 跳过）"; exit 1
fi

echo ">>> 部署 OpenClaw（仅运行所需：dist、入口、extensions、skills、production-template、node_modules）"
rsync -a --delete \
  --exclude='.git' \
  --exclude='src' \
  --exclude='docs' \
  --exclude='apps' \
  --exclude='changelog' \
  --exclude='.github' \
  --exclude='.agent' \
  --exclude='.agents' \
  --exclude='*.test.*' \
  --exclude='vitest.*.mjs' \
  --exclude='.env.example' \
  --exclude='.detect-secrets.cfg' \
  --exclude='Dockerfile*' \
  --exclude='docker-compose.yml' \
  --exclude='docker-setup.sh' \
  --exclude='fly*.toml' \
  --exclude='knip.config.ts' \
  --exclude='.jscpd.json' \
  --exclude='.npmignore' \
  --exclude='.markdownlint-cli2.jsonc' \
  --exclude='.mailmap' \
  --exclude='AGENTS.md' \
  --exclude='CLAUDE.md' \
  --exclude='CONTRIBUTING.md' \
  --exclude='docs.acp.md' \
  --exclude='appcast.xml' \
  --exclude='git-hooks' \
  "$SRC/openclaw/" "$OPT_AMYCLAW/openclaw/"

# pnpm 的 node_modules 含大量软链，全树 rsync 偶发不完整（如 gaxios 缺文件导致 Gateway 崩溃），二次同步保证依赖完整
echo ">>> 二次同步 openclaw/node_modules"
rsync -a --delete "$SRC/openclaw/node_modules/" "$OPT_AMYCLAW/openclaw/node_modules/"

# workspace 需要 docs/reference/templates（如 AGENTS.md）
echo ">>> 复制 docs/reference/templates 到 OPT（chat completions 需用）"
mkdir -p "$OPT_AMYCLAW/openclaw/docs/reference/templates"
cp -r "$SRC/openclaw/docs/reference/templates/"* "$OPT_AMYCLAW/openclaw/docs/reference/templates/" 2>/dev/null || true

echo ">>> 部署管理端（server、public、wecom-bridge、package.json、node_modules；不含 data、.env）"
rsync -a --delete \
  --exclude='.git' \
  --exclude='data' \
  --exclude='.env' \
  --exclude='.env.local' \
  --exclude='*.log' \
  "$SRC/openclaw-management/" "$OPT_AMYCLAW/openclaw-management/"

# 确保管理端 data 目录存在但为空（运行时需可写）
mkdir -p "$OPT_AMYCLAW/openclaw-management/data"
chmod 755 "$OPT_AMYCLAW/openclaw-management/data"

echo ">>> 复制 OEM 网络/DNS 模板到 $OPT_AMYCLAW/oem（会打入镜像；克隆机无 /mnt 仓库时从这里执行 apply）"
mkdir -p "$OPT_AMYCLAW/oem/systemd/system" "$OPT_AMYCLAW/oem/systemd/resolved.conf.d"
cp -a "$SRC/docs/penguins-eggs/systemd/system/amyclaw-fix-resolv.service" "$OPT_AMYCLAW/oem/systemd/system/" 2>/dev/null || true
cp -a "$SRC/docs/penguins-eggs/systemd/resolved.conf.d/99-amyclaw-fallback-dns.conf" "$OPT_AMYCLAW/oem/systemd/resolved.conf.d/" 2>/dev/null || true
cp -a "$SRC/docs/penguins-eggs/netplan-50-dhcp.yaml" "$OPT_AMYCLAW/oem/" 2>/dev/null || true
cp -a "$SRC/docs/penguins-eggs/oem/apply-network-oem.sh" "$OPT_AMYCLAW/oem/" 2>/dev/null || true
chmod 755 "$OPT_AMYCLAW/oem/apply-network-oem.sh" 2>/dev/null || true

echo ">>> 复制网关/飞书自检脚本到 OEM（打入镜像；克隆机无 /mnt 时在此执行）"
if [[ -f "$SRC/scripts/diagnose-openclaw-gateway-feishu.sh" ]]; then
  cp -a "$SRC/scripts/diagnose-openclaw-gateway-feishu.sh" "$OPT_AMYCLAW/oem/"
  chmod 755 "$OPT_AMYCLAW/oem/diagnose-openclaw-gateway-feishu.sh"
else
  echo ">>> 警告: 未找到 $SRC/scripts/diagnose-openclaw-gateway-feishu.sh，跳过 OEM 自检脚本"
fi

cat > "$OPT_AMYCLAW/oem/README.txt" << 'OEMEOF'
AmyClaw OEM（量产镜像内路径）
- 本目录来自母机 deploy-to-opt.sh，不依赖 /mnt/disk/amyclaw（该路径不会进入 ISO）。
- 若 DNS/resolv 异常，在克隆机执行: sudo bash /opt/amyclaw/oem/apply-network-oem.sh
- 飞书/大模型/网关自检（systemd、openclaw.json、.env、journal 摘要）:
  sudo bash /opt/amyclaw/oem/diagnose-openclaw-gateway-feishu.sh
OEMEOF

echo ">>> 写入 systemd 单元（/opt/amyclaw 路径）"
cat > /etc/systemd/system/openclaw-gateway.service << 'SVCEOF'
[Unit]
Description=OpenClaw Gateway
Documentation=https://docs.openclaw.ai/gateway/configuration
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
WorkingDirectory=/opt/amyclaw/openclaw
# --bind lan：必须监听 0.0.0.0，否则仅 127.0.0.1，无法用 http://amyclaw.local:18789（解析到局域网 IP）访问
ExecStart=/usr/bin/env node openclaw.mjs gateway --port 18789 --bind lan --allow-unconfigured
Restart=on-failure
RestartSec=5
Environment=OPENCLAW_STATE_DIR=/root/.openclaw
Environment=NODE_COMPILE_CACHE=/tmp/openclaw-compile-cache
Environment=OPENCLAW_NO_RESPAWN=1
# 量产局域网：CLI/远程脚本使用 ws:// 私网地址时允许（与浏览器无关）
Environment=OPENCLAW_ALLOW_INSECURE_PRIVATE_WS=1

[Install]
WantedBy=multi-user.target
SVCEOF

cat > /etc/systemd/system/openclaw-management.service << 'SVCEOF'
[Unit]
Description=OpenClaw 管理设置页 (8080)
After=network-online.target openclaw-gateway.service
Wants=network-online.target

[Service]
Type=simple
WorkingDirectory=/opt/amyclaw/openclaw-management
ExecStart=/usr/bin/env node server.js
Restart=on-failure
RestartSec=5
Environment=OPENCLAW_STATE_DIR=/root/.openclaw

[Install]
WantedBy=multi-user.target
SVCEOF

systemctl daemon-reload

# 若存在种子脚本，写入 /root/.openclaw（gateway.bind=lan、Token、Control UI 局域网）
SEED="${SRC}/scripts/seed-amyclaw-openclaw-state.sh"
if [[ -f "$SEED" ]]; then
  echo ">>> 执行 OpenClaw 状态种子（LAN / 18789）"
  bash "$SEED" || echo ">>> 种子脚本失败，请手动运行: sudo bash $SEED"
else
  echo ">>> 未找到 $SEED，请手动运行 mother-image-prepare-for-amyclaw-iso.sh"
fi

echo ">>> 部署完成: $OPT_AMYCLAW"
ls -la "$OPT_AMYCLAW"
