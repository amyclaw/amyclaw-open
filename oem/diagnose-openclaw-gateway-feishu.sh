#!/usr/bin/env bash
# 在运行 OpenClaw Gateway 的机器上执行（如量产机 root@设备IP）
# 用途：检查飞书/大模型配置落盘、热加载与网关状态，辅助「发消息无回复」排查
# 用法: sudo bash diagnose-openclaw-gateway-feishu.sh
# 克隆机（已 deploy 并打入镜像）: sudo bash /opt/amyclaw/oem/diagnose-openclaw-gateway-feishu.sh
# 母机若从 Git 检出到其它路径: sudo bash <仓库根>/oem/diagnose-openclaw-gateway-feishu.sh（与本 OEM 副本同源）

set -euo pipefail

STATE="${OPENCLAW_STATE_DIR:-/root/.openclaw}"
JSON="$STATE/openclaw.json"
ENVF="$STATE/.env"

echo "========== 1) systemd：网关与管理页 =========="
systemctl is-active openclaw-gateway.service 2>/dev/null || echo "openclaw-gateway: inactive或不存在"
systemctl is-active openclaw-management.service 2>/dev/null || echo "openclaw-management: inactive或不存在"
echo "--- openclaw-gateway 最近状态 ---"
systemctl status openclaw-gateway.service --no-pager -l 2>/dev/null | head -25 || true

echo ""
echo "========== 2) 状态目录与文件是否存在 =========="
echo "OPENCLAW_STATE_DIR=$STATE"
ls -la "$STATE" 2>/dev/null || { echo "目录不存在或无权限"; exit 1; }
if [[ -f "$JSON" ]]; then
  echo "openclaw.json 大小: $(wc -c <"$JSON") bytes, 修改时间: $(stat -c %y "$JSON" 2>/dev/null || stat -f %Sm "$JSON" 2>/dev/null)"
else
  echo "WARN: 缺少 $JSON"
fi
if [[ -f "$ENVF" ]]; then
  echo ".env 存在, 修改时间: $(stat -c %y "$ENVF" 2>/dev/null || stat -f %Sm "$ENVF" 2>/dev/null)"
else
  echo "WARN: 缺少 $ENVF（大模型 Key 等通常在此）"
fi

echo ""
echo "========== 3) openclaw.json 中飞书开关（不含密钥）=========="
if command -v jq >/dev/null 2>&1 && [[ -f "$JSON" ]]; then
  jq '{
    channels_feishu_enabled: (.channels.feishu.enabled // null),
    plugin_feishu_enabled: (.plugins.entries.feishu.enabled // null),
    feishu_defaultAccount: (.channels.feishu.defaultAccount // null),
    feishu_accounts_keys: (.channels.feishu.accounts | keys? // []),
    feishu_connectionMode: (.channels.feishu.connectionMode // null),
    feishu_requireMention: (.channels.feishu.requireMention // null),
    agents_default_model: (.agents.defaults.model // null)
  }' "$JSON" 2>/dev/null || echo "jq 解析失败（JSON 可能损坏）"
  fe_plugin="$(jq -r '.plugins.entries.feishu.enabled // "null"' "$JSON" 2>/dev/null)"
  if [[ "$fe_plugin" == "false" ]]; then
    echo ">>> 严重: plugins.entries.feishu.enabled=false 时飞书扩展不会加载，日志里不会有「starting feishu」。"
    echo ">>> 修复: jq '.plugins.entries.feishu.enabled = true' openclaw.json 并重启 openclaw-gateway。"
  fi
else
  echo "（未安装 jq 或无 JSON，以下为粗略 grep）"
  grep -E '"feishu"|enabled|requireMention|connectionMode|defaultAccount' "$JSON" 2>/dev/null | head -30 || true
fi

echo ""
echo "========== 4) .env 中是否「有」常见 Key 行（不打印值）=========="
if [[ -f "$ENVF" ]]; then
  while IFS= read -r line; do
    [[ -z "$line" || "$line" =~ ^# ]] && continue
    key="${line%%=*}"
    val="${line#*=}"
    if [[ -n "$key" ]]; then
      if [[ -n "$val" ]]; then echo "$key=***已设置(${#val}字符)***"; else echo "$key=(空)"; fi
    fi
  done < "$ENVF"
else
  echo "无 .env"
fi

echo ""
echo "========== 5) 本机监听 18789 / 8080 =========="
ss -lntp 2>/dev/null | grep -E ':18789|:8080' || netstat -lntp 2>/dev/null | grep -E ':18789|:8080' || echo "未检测到监听（或需 root 查看 ss）"

echo ""
echo "========== 6) Gateway 日志：热加载 / 飞书 / 错误（最近约 400 行内过滤）========="
journalctl -u openclaw-gateway.service -n 400 --no-pager 2>/dev/null | grep -iE 'reload-config|config change|restart-channel:feishu|feishu\[|did not mention|Feishu send failed|Feishu reply failed|401|99991|error|websocket|received message' | tail -80 || echo "无匹配或无 journal 权限"

echo ""
echo "========== 7) 建议人工核对 =========="
echo "- 群聊默认 requireMention=true：须 @ 机器人才回复；或改 false 后保存并触发热加载。"
echo "- 飞书长连接：开发者后台须「长连接接收事件」并订阅 im.message.receive_v1 等。"
echo "- 管理端与 Gateway 须同 OPENCLAW_STATE_DIR（默认 /root/.openclaw），保存后会 POST /reload-config。"
echo "- 完整链路见: docs/热加载与无回复排查.md"
echo "完成。"
