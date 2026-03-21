# 飞书没回复 + 大模型端到端修复说明

## 已完成的修复与测试

### 1. 飞书群消息不回复

- **原因**：群聊默认必须 @ 机器人才会回复；且飞书事件里 `mentions` 可能未被正确识别（例如仅含 user_id 或为空），导致即使用户 @ 了也被判为「未 @」。
- **已做修改**：
  - 在 **`openclaw.json`** 中为飞书通道增加 **`requireMention: false`**：群内任意消息都会触发回复，不再依赖 @ 识别。
  - **飞书通道已启用**（`enabled: true`），并写入你提供的 **App ID**（`cli_a93b2fa663789bcc`）。
  - 在 **`openclaw/extensions/feishu/src/bot.ts`** 中，当判定为「未 @ 机器人」时增加**调试日志**（`message_type`、`mentions`、`postMentionedIds`、`botOpenId`），便于日后排查 @ 识别问题。
- **你需要**：在**管理页（http://本机IP:8080）** 的飞书块中确认并**保存一次「应用密钥」**，确保 `appSecret` 正确写入配置（当前配置里若为占位请改为真实密钥后保存）。

### 2. 大模型「无效的令牌」

- **现象**：Gateway 的 `/v1/chat/completions` 返回 200，但内容为 `LLM error new_api_error: 无效的令牌`。
- **原因**：调用 idatabase（或当前配置的模型服务）时使用的 **API Key 无效或过期**。
- **你需要**：在 **`OPENCLAW_STATE_DIR/.env`**（默认 `~/.openclaw/.env`）中设置**有效的**：
  - **`IDATABASE_API_KEY`**（若使用 idatabase 的 Gemini 模型）
  - 或你实际使用的模型服务对应的 API Key。
- **配置**：已在 `openclaw.json` 的 idatabase 中增加 **`"api": "openai-completions"`**，保证网关能正确调用该提供商。

### 3. 已跑的测试（全部通过）

- **飞书扩展**：`pnpm test --run extensions/feishu` → **37 个文件、386 个用例通过**（含 @、回复、会话、去重等 mock）。
- **飞书 bot**：`vitest run extensions/feishu/src/bot.test.ts` → **55 个用例通过**（含 requireMention、广播、话题回复等）。
- **Gateway Chat Completions**：`vitest run src/gateway/openai-http.test.ts` → **4 个用例通过**（mock，不依赖真实 API）。

### 4. 端到端测试脚本

- 脚本路径：**`scripts/e2e-test-feishu-and-model.sh`**。
- 作用：在 **Gateway 已启动** 的前提下：
  1. 连续 3 次请求 **`/v1/chat/completions`**，验证大模型是否返回正常内容（若仍为「无效的令牌」需检查上述 API Key）。
  2. 检查 **飞书配置**（enabled、requireMention、appId/appSecret 是否已配置）。
  3. 运行 **飞书扩展单元测试**（mock）。
- 使用示例：
  ```bash
  export OPENCLAW_STATE_DIR=/root/.openclaw   # 或你的状态目录
  ./scripts/e2e-test-feishu-and-model.sh
  ```

## 配置变更汇总（openclaw.json）

- `channels.feishu.enabled`: `true`
- `channels.feishu.requireMention`: `false`
- `channels.feishu.accounts.default.appId`: `cli_a93b2fa663789bcc`
- `models.providers.idatabase.api`: `"openai-completions"`

应用密钥（appSecret）请仅在**管理页**填写并保存，不要写进文档或代码仓库。

## 若仍无回复

1. **先确认域名 (domain)**：应用是**国内飞书**创建的用 **`feishu`**，**国际版 Lark** 创建的用 **`lark`**。`openclaw.json` 里 `channels.feishu.domain` 必须与创建应用时一致，否则长连接会连错环境，容易出现 1000040346 / 连不上。
2. 重启 Gateway，使最新配置生效（或等待热重载）。
3. 在飞书群发一条**普通消息**（可不 @），看是否收到回复。
4. 查看网关日志：`grep feishu /tmp/openclaw/openclaw-$(date +%Y-%m-%d).log | tail -50`，或 `openclaw logs --follow`。
5. 若日志中仍出现「did not mention bot」且带有 `message_type=... mentions=...`，说明当前逻辑仍未识别到 @；此时因已设 `requireMention: false`，应仍会进入回复流程，若没有回复则重点看后续是否有 agent/模型报错或发送失败。

### 日志里出现 1000040346 / PingInterval 时

多为**长连接连错环境**（domain 填成 lark 却用飞书应用，或反过来）或飞书侧限流。先检查并改对 **`channels.feishu.domain`**（国内飞书用 `feishu`，国际 Lark 用 `lark`），保存后重启网关再试。

**若 domain 已正确仍反复 1000040346，按下面步骤改用 Webhook（仅改配置，无需改代码）：**

1. **飞书开放平台** → 你的应用 → **事件订阅**：复制 **请求 URL 校验** 用的 `verification_token`、**加密 Key**（encrypt_key；Webhook 模式下两者必填）。
2. 在 **openclaw.json** 的 `channels.feishu` 下增加或修改：
   - `"connectionMode": "webhook"`
   - `"verificationToken": "飞书事件订阅里的 verification_token"`
   - `"encryptKey": "飞书事件订阅里的 encrypt_key"`
   - 可选：`"webhookPort": 3000`、`"webhookPath": "/feishu/events"`（默认即此）
3. **暴露本机端口给飞书**：用 ngrok 或内网穿透，把 `http://本机:webhookPort/webhookPath` 暴露为公网 HTTPS 地址（例如 `https://xxx.ngrok.io/feishu/events`）。
4. 在飞书开放平台 **事件订阅** 里，将 **请求地址** 填为上述公网 URL，保存并**重新发布**应用。
5. 保存 openclaw.json 后执行：`sudo systemctl restart openclaw-gateway.service`。之后事件通过 HTTP 回调接收，不再依赖长连接，即可正常收消息并回复。
