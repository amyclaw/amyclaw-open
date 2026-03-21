# 使用 `http://amyclaw.local:18789` 访问网关

## 必要条件

1. **本机已安装并运行 Avahi**（`avahi-daemon`），主机名为 `amyclaw`，则局域网内可解析 **`amyclaw.local`** → 本机 IP。
2. **OpenClaw Gateway 必须监听局域网**，即 **`0.0.0.0:18789`**（或网卡 IP），**不能只监听 `127.0.0.1:18789`**。  
   - 若只监听回环，浏览器访问 `amyclaw.local:18789`（实际连的是局域网 IP）会 **连接被拒绝 / 无法访问**。
3. **配置**：`~/.openclaw/openclaw.json` 中 `gateway.bind` 为 **`lan`**，且 systemd **`ExecStart` 含 `--bind lan`**（与配置一致，避免旧进程未重载）。
4. **防火墙**：放行 **TCP 18789**（如 `ufw allow 18789/tcp`）。

## 自检命令（在网关所在机器上）

```bash
# 应看到 0.0.0.0:18789 或 *:18789，而不是仅 127.0.0.1:18789
ss -tlnp | grep 18789

# 用局域网 IP 应返回 200（把 IP 换成本机实际地址）
curl -s -o /dev/null -w "%{http_code}\n" http://$(hostname -I | awk '{print $1}'):18789/healthz

curl -s -o /dev/null -w "%{http_code}\n" http://amyclaw.local:18789/healthz
```

若第一条显示 **仅 127.0.0.1**，请：

```bash
sudo systemctl restart openclaw-gateway
```

并确认 `openclaw.json` 与 systemd 中 **`bind=lan`**。重新部署 systemd 单元：

```bash
sudo bash /mnt/disk/amyclaw/docs/penguins-eggs/deploy-to-opt.sh
sudo systemctl daemon-reload
sudo systemctl restart openclaw-gateway
```

## 客户端侧

- **同一局域网**（同网段 / 能互通）。
- **Windows**：若 `amyclaw.local` 无法解析，可安装 **Bonjour Print Services** 或 **iTunes**（带 mDNS），或改用 **IP + 端口** 访问。
- **手机**：需与设备同一 WiFi；部分浏览器对 `.local` 支持不一，可改用 IP。

## Token

网关需 **Token** 才能使用控制界面；在 **8080 管理页** 设置的 Token 与 `gateway.auth.token` 一致即可。

## 「control ui requires device identity」/ 无法连接

用 **`http://amyclaw.local:18789`** 或 **`http://<局域网IP>:18789`** 打开时，页面是 **HTTP** 且**不是** `localhost`，浏览器处于**非安全上下文**，无法生成设备身份；网关默认会拒绝 WebSocket，提示与 **HTTPS 或 localhost 安全上下文**有关。

**量产/内网推荐（已写入 `seed-amyclaw-openclaw-state.sh`）：** 在 `openclaw.json` 中设置：

```json
"gateway": {
  "controlUi": {
    "dangerouslyDisableDeviceAuth": true
  }
}
```

然后 **`sudo systemctl restart openclaw-gateway`**。安全依赖 **网关 Token** 与**内网边界**，不要用公网暴露。

**其他方式（任选）：**

- 在**网关本机**浏览器只用 **`http://127.0.0.1:18789`**，并配置 `gateway.controlUi.allowInsecureAuth: true`（仍仅对 localhost 明文 HTTP 放宽）。
- 使用 **HTTPS**（如 Tailscale Serve、反向代理证书），即可保留设备身份校验。

详见上游文档：`openclaw/docs/web/control-ui.md`（Insecure HTTP）。
