# 飞书改用 Webhook 收消息（解决 1000040346 / 不回复）

当前长连接一直报 `1000040346, system busy` 和 `PingInterval`，收不到消息。**改用 Webhook 后**由飞书主动推事件到你机器，不再依赖长连接，即可正常回复。

---

## 第一步：在飞书开放平台拿到两个值

1. 打开 [飞书开放平台](https://open.feishu.cn/) → 你的应用 → **事件订阅**。
2. 若未配置过「请求地址」，先随便填一个 URL 保存，才能看到下面两项。
3. 复制并保存：
   - **请求 URL 校验** 里的 **Verification Token**（一串英文/数字）。
   - **加密 Key**（Encrypt Key）：若未开启加密，先在该页开启「Encrypt Key」并保存，再复制。

---

## 第二步：改 openclaw.json

在 **`channels.feishu`** 里增加下面几行（与 `domain`、`requireMention` 同级）：

```json
"connectionMode": "webhook",
"verificationToken": "这里填飞书里的 Verification Token",
"encryptKey": "这里填飞书里的 Encrypt Key",
"webhookPort": 3000,
"webhookPath": "/feishu/events"
```

注意：**verificationToken** 和 **encryptKey** 必须填真实值，不能为空或占位符，否则网关启动会报错。

改完后 `channels.feishu` 示例：

```json
"feishu": {
  "enabled": true,
  "domain": "feishu",
  "requireMention": false,
  "connectionMode": "webhook",
  "verificationToken": "你的 Verification Token",
  "encryptKey": "你的 Encrypt Key",
  "webhookPort": 3000,
  "webhookPath": "/feishu/events",
  "accounts": {
    "default": {
      "appId": "cli_a93290bdb4f8dcc9",
      "appSecret": "7HLDxYOW06bzlHoI1F0b4e0Sdtyy11Io"
    }
  }
}
```

---

## 第三步：把本机 Webhook 地址暴露给公网

飞书只能访问公网 URL，需要把本机的 `http://本机IP:3000/feishu/events` 暴露出去。

- **方式 A**：用 **ngrok**  
  ```bash
  ngrok http 3000
  ```
  记下生成的 HTTPS 地址，例如 `https://xxxx.ngrok.io`，则请求地址为：**`https://xxxx.ngrok.io/feishu/events`**。

- **方式 B**：用其他内网穿透或已有公网服务器做反向代理，最终飞书能访问到的 URL 为：`https://你的域名或IP/feishu/events`（飞书要求 HTTPS）。

---

## 第四步：在飞书里填请求地址

1. 飞书开放平台 → 你的应用 → **事件订阅**。
2. **请求地址** 填：上一步得到的 **完整 URL**（例如 `https://xxxx.ngrok.io/feishu/events`）。
3. 保存后若提示校验失败，请确认：
   - verificationToken、encryptKey 与 openclaw.json 里一致；
   - 网关已重启（见第五步）；
   - 暴露的 URL 能从外网访问且为 HTTPS。

---

## 第五步：重启网关

```bash
sudo systemctl restart openclaw-gateway.service
```

重启后飞书会走 Webhook 推送事件，不再使用长连接，日志里不应再出现 1000040346 / PingInterval。在群里发消息测试是否收到回复。

---

## 当前已为你做的修改

- 已将 **飞书插件重新启用**：`plugins.entries.feishu.enabled` 设为 `true`（之前为 false 会导致飞书不工作）。
- 未在配置里直接加 Webhook，避免用占位符导致启动报错；你按上面步骤填好 **verificationToken** 和 **encryptKey** 并保存后再重启即可。
