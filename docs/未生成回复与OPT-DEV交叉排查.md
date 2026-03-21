# 「未生成回复」与 OPT/DEV 交叉排查

当出现 **「未生成回复，请重试或检查模型/网络配置」** 时，除模型/网络问题外，常见原因是 **配置与状态目录不一致**（OPT 与 DEV 或不同进程读到的不是同一套配置/.env）。

---

## 一、是否 OPT 与 DEV 交叉？

### 1. 两套路径含义

| 路径 | 用途 | 配置/状态来源 |
|------|------|----------------|
| **Dev** | 开发、联调 | 代码来自 `/mnt/disk/amyclaw`，**状态目录** 由环境变量 `OPENCLAW_STATE_DIR` 或默认 `~/.openclaw` 决定 |
| **Opt** | 量产/打包 | 代码来自 `/opt/amyclaw`，状态目录同样由 **环境变量** 决定 |

**关键**：无论是 dev 还是 opt 的**代码**在跑，**配置和 API Key 都只来自「状态目录」**（`openclaw.json` + `.env`）。若 Gateway 与 管理页（或其它进程）使用的 **状态目录不一致**，就会一个读到正确 Key、一个读到空或错误 → 模型请求失败 → 未生成回复。

### 2. 如何确认「只认一套」、没有交叉

- **Gateway 与 管理页必须使用同一状态目录**  
  - 在 systemd 单元里都应显式设置 **同一** `OPENCLAW_STATE_DIR`（如 `/root/.openclaw`）。  
  - 若只在一个单元里设置、另一个用默认，当运行用户不同时（如 Gateway 用 root、Management 用 amyclaw），会变成两个目录 → 交叉。

- **当前推荐**  
  - `openclaw-gateway.service` 与 `openclaw-management.service` 都设置：  
    `Environment=OPENCLAW_STATE_DIR=/root/.openclaw`  
  - 修改后执行：  
    `sudo cp .../openclaw-gateway.service /etc/systemd/system/`（或重新运行 install-autostart.sh）  
    `sudo systemctl daemon-reload && sudo systemctl restart openclaw-gateway openclaw-management`

- **检查实际生效值**（在对应进程里看环境变量）：  
  - Gateway：  
    `sudo systemctl show openclaw-gateway.service -p Environment`  
  - 管理页：  
    `sudo systemctl show openclaw-management.service -p Environment`  
  两者中的 `OPENCLAW_STATE_DIR` 必须一致。

---

## 二、模型配置与 .env

「未生成回复」多数是 **模型请求失败**（无内容返回或抛错）。请确认：

1. **openclaw.json 里默认模型用的 API Key 来自 .env 的哪个变量**  
   - 例如：`agents.defaults.model.primary` 为 `idatabase/google/...` 时，会用到 `models.providers.idatabase.apiKey`，通常为 `IDATABASE_API_KEY`。

2. **该 Key 写在「状态目录」下的 .env 里**  
   - 路径：`$OPENCLAW_STATE_DIR/.env`（如 `/root/.openclaw/.env`）。  
   - 管理页「大模型」里保存的 Key 会写进这个 .env；若 Gateway 用的状态目录不是这一个，就读不到。

3. **热加载会重新读 .env**  
   - 保存配置后管理页会触发 Gateway `/reload-config`，会重新 loadDotEnv。若仍有问题，可重启 Gateway 再试。

4. **网络/权限**  
   - 若 Key 正确仍失败，执行 `openclaw logs --follow` 看模型请求是否 401/超时等。

---

## 三、快速检查清单

| 检查项 | 说明 |
|--------|------|
| Gateway 与 Management 的 `OPENCLAW_STATE_DIR` 是否一致 | 两个 unit 都显式设为同一目录（如 `/root/.openclaw`） |
| 是否只跑「一套」服务 | 不要同时跑指向不同状态目录的多个 Gateway/管理页，避免混用 OPT/DEV 两套 |
| 默认模型对应的 API Key 是否在 .env 中 | 如 idatabase → `IDATABASE_API_KEY`，在 `$OPENCLAW_STATE_DIR/.env` 中存在且有效 |
| 保存配置后是否触发热加载或重启 Gateway | 确保 Gateway 读到最新 .env |

按上述确认「单一路径、同一状态目录、.env 中有对应模型 Key」后，再重试回复；若仍出现未生成回复，再结合 `openclaw logs --follow` 排查模型/网络。

---

## 四、run 成功但 payloads 为空（根因定位）

现象：日志里出现 `run succeeded but produced no payloads` 或 `No reply from agent.`，说明 **agent 跑完了但返回的 payloads 为空**。payloads 来自模型本轮对话的助理回复内容（`assistantTexts`）；为空通常表示模型未返回有效文本（或全部被过滤）。

### 1. 看诊断日志

从 2026-03 起，当发生「无 payloads」时会在日志中打一行诊断，例如：

```text
runReplyAgent: no-payloads diagnostic meta.error=none stopReason=completed provider=idatabase model=...
```

- **meta.error**：若为 `context_overflow` / `retry_limit` 等，表示 run 虽未抛错但按错误分支返回了空。
- **stopReason**：若为 `completed` 且 error 为 none，多半是 **模型 API 返回了空内容**（或内容被过滤）。
- **provider/model**：确认本次 run 使用的模型，便于核对 .env 中对应 Key 与配额。

### 2. 建议操作

1. **先看上述诊断行**：确认是 error 导致空，还是 stopReason=completed 且 error=none（即模型空回复）。
2. **模型空回复时**：检查对应 provider 的 API Key、配额、网络；可开 `OPENCLAW_LOG_LEVEL=debug` 后复现，用 `openclaw logs --follow` 看是否有模型请求/响应或 401/超时。
3. **复现时抓一次完整日志**：用户再次发送同一条消息时，执行 `openclaw logs --follow`，便于对照该次 run 的 meta 与上游模型调用。

### 3. embedded 层诊断（assistantTexts 为何为空）

若 agent-runner 的 no-payloads 诊断显示 `stopReason=stop` 且 `error=none`，可进一步看 **embedded run** 的日志（关键词 `embedded run produced no payloads`），例如：

```text
[agent/embedded] embedded run produced no payloads: runId=... sessionId=... assistantTextsLen=0 lastAssistantStopReason=stop lastAssistantError=none lastAssistantRawTextLen=0
```

- **assistantTextsLen=0**：本轮没有任何内容被追加到 assistantTexts（流式或 message_end 均未写入）。
- **lastAssistantStopReason=stop**：模型 API 正常结束（非 error、非 tool_calls）。
- **lastAssistantRawTextLen**：从 lastAssistant 解析出的纯文本长度。若为 **0**，表示 **模型返回的 content 为空**（API 200 但无正文）；若 **>0** 但 assistantTextsLen 仍为 0，表示内容在订阅/过滤逻辑中被丢弃，需查 enforceFinalTag 或流式路径。

**结论**：`lastAssistantRawTextLen=0` → 优先检查模型 API（idatabase/其他）是否返回空 body、或被 content filter 清空；Key/配额/网络正常时，可换 fallback 模型或联系 API 提供方。

**idatabase 模型**：直连测试发现部分模型（如 gemini-3.1-flash-lite-preview）在部分请求下会返回 HTTP 200 但 `content` 为空（或间歇性空）。可用脚本单独验证：`OPENCLAW_STATE_DIR=/root/.openclaw ./scripts/test-idatabase-direct.sh <model_id>`。若直连正常而 Gateway/飞书仍无回复，问题在嵌入式调用路径（流式解析或请求体差异）；若直连即空，建议换主模型（如 gemini-3-pro-preview）并在 `openclaw.json` 的 `models.providers.idatabase.models` 中保留该模型 id。

---

## 五、主/次模型是否冲突？

**不冲突**。配置中的 primary（主）与 fallbacks（次）关系为：

- **主模型**：默认首选的 provider/model（如 `idatabase/gemini-3.1-flash-lite-preview`）。
- **次模型（fallback）**：仅当主模型 **抛错**（如 401、429、超时、context overflow）时才会被尝试；若主模型 **正常返回但内容为空**（HTTP 200、stopReason=stop、content 为空），**不会**自动切换 fallback，因此会得到「未生成回复」。

因此「主次」不会同时生效导致冲突；若希望空内容时也换模型，需在业务层或后续版本支持「空回复时尝试 fallback」策略。

---

## 六、config 无效导致热加载被跳过

**现象**：在管理页改了主模型并「保存全部配置」后，飞书仍无回复；日志出现 **config reload skipped (invalid config)**，热加载整次被跳过、主模型/API Key 等变更不生效，或网关重启失败。

**常见原因**：config 中存在 Gateway 不认识的通道或字段（例如历史 config 中残留的 `channels.wecom`，wecom 已从产品中移除）。Gateway 校验 config 时若发现未知 channel id，会拒绝整次 reload。

**处理**：从配置中删除无效的通道键，例如：  
`jq 'del(.channels.wecom)' /root/.openclaw/openclaw.json > /tmp/oc.json && mv /tmp/oc.json /root/.openclaw/openclaw.json`  
然后 `sudo systemctl restart openclaw-gateway`，再在管理页保存需要生效的区块。排查「未生成回复」时，若主模型与 API Key 正确，可检查日志是否有 **config reload skipped (invalid config)**，若有则清理对应无效键后重试。

---

## 七、秒回 fallback 与「未生成回复」

**现象**：发消息后系统几乎秒回，且出现 **fallback** 提示 + 「未生成回复，请重试或检查模型」。

**可能原因**：

1. **主模型被跳过（未真正调用）**  
   主模型所在 provider 处于 cooldown（如上次 401/429 后标记），本轮直接跳过主模型、只调用了备用模型；备用模型若返回空，就会秒回「fallback + 未生成回复」。  
   - **日志**：出现 `model-fallback: primary <provider>/<model> skipped (<reason>), trying next candidate` 表示主模型被跳过。  
   - **处理**：确认主模型 API Key、配额、网络正常；若为临时限流，等 cooldown 过期或重启 Gateway 后再试。

2. **主模型已调用但返回空，未触发 fallback**  
   主模型 HTTP 200 但 content 为空时，**不会**自动切 fallback，只会回复「未生成回复」。此时日志里 `selected` 与 `active` 相同、`fallbackAttempts=0`。按第四节查 `lastAssistantRawTextLen=0`。

3. **DEV / OPT 状态目录不一致**  
   Gateway 与管理页、以及同一台机上多进程必须使用**同一** `OPENCLAW_STATE_DIR`（如 `/root/.openclaw`）。否则会出现：一边读到新 config/主模型，另一边读到旧 config 或不同的 auth 状态（cooldown 只存在于其中一个进程），表现为主模型「有时被跳过」或配置像没生效。  
   - 确认：`sudo systemctl show openclaw-gateway.service -p Environment` 与 `openclaw-management.service` 的 `OPENCLAW_STATE_DIR` 一致，且与当前使用的 config 路径一致。

**排查步骤**：  
- 执行 `openclaw logs --follow` 后复现一次，看是否有 `primary ... skipped` 或 no-payloads 诊断行中的 `selected=... active=... fallbackAttempts=...`。  
- 若 `fallbackAttempts>=1` 且秒回：说明主模型被跳过或先失败，备用被调用且返回空；先解决主模型 cooldown/Key/网络，再试。  
- 若 `fallbackAttempts=0` 且 `selected=active`：说明只用了主模型且主模型返回空，按第四节查模型 API 与空 body。

---

## 八、日志对比分析 E2E 闭环（示例）

按时间线查 `journalctl -u openclaw-gateway.service -n 500` 或 `openclaw logs --limit 500`，重点看以下几类行并对比结论。

### 1. 启动时用的模型

```text
[gateway] agent model: idatabase/gemini-3.1-flash-lite-preview
```
或
```text
[gateway] agent model: idatabase/gemini-3-pro-preview
```
→ 表示**该进程**当前默认模型；若之后没有成功热加载 `agents.defaults.model.primary`，所有 run 都会用这个模型。

### 2. 热加载是否生效

- **成功**：`[reload] config hot reload applied (..., agents.defaults.model.primary)` 或 `(models.providers.idatabase.models, ...)`  
  → 主模型/模型列表已在该进程内更新。
- **被拦**：`[reload] config reload skipped (invalid config): ...`（例如未知 channel id）  
  → 本次及后续所有 reload 均不应用，直到 config 修正并再次触发 reload 或重启。

### 3. 某次飞书消息实际用的模型

```text
runReplyAgent: no-payloads diagnostic ... provider=idatabase model=gemini-3-pro-preview
```
→ 该次 run 使用的是 **idatabase/gemini-3-pro-preview**；若前面没有 `model-fallback: primary ... skipped`，说明没有走 fallback，是主模型返回空。

### 4. 闭环对照表（示例）

| 时间点 | 日志关键词 | 结论 |
|--------|------------|------|
| 15:29 / 15:30 | `agent model: idatabase/gemini-3.1-flash-lite-preview` | 进程启动时主模型为 flash-lite |
| 15:34:07 | `config hot reload applied (apiKey, ...)` | 仅 apiKey 等生效，**未**含 agents.defaults.model |
| 15:34:33 起 | `config reload skipped (invalid config)` | 之后所有 reload 被拦截 |
| 15:34:57 / 15:35:21 | `no-payloads ... model=gemini-3.1-flash-lite-preview` | 当时 run 仍用 flash-lite（与启动一致） |
| 15:39:55 | `config hot reload applied (models.providers.idatabase.models, agents.defaults.model.primary)` | **主模型与模型列表热加载成功** |
| 16:05:43 | `agent model: idatabase/gemini-3-pro-preview` | 新进程以 3-pro 启动 |
| 16:07 / 16:08 / 16:23 | `no-payloads ... model=gemini-3-pro-preview` | run 已用 3-pro，但 API 返回空（lastAssistantRawTextLen=0） |
| 16:25:16 起 | `config reload skipped (invalid config)` | config 含无效键，后续 reload 再次被拦 |

**根因小结**：未生成回复 = **模型 API 正常返回但 content 为空**（非 fallback、非主模型未切换）。无效 config 会导致热加载被跳过；修正 config 后热加载可成功。若已切到 3-pro 仍无回复，需排查 idatabase 为何返回空 body（Key、配额、请求格式或上游行为）；可先用 `scripts/test-idatabase-direct.sh <model_id>` 与 `scripts/test-llm-direct.sh` 做分层 E2E。

---

## 九、全链路 E2E 检查清单

1. **idatabase 直连（确认 Key + 模型返回非空）**  
   `OPENCLAW_STATE_DIR=/root/.openclaw ./scripts/test-idatabase-direct.sh gemini-3-pro-preview`  
   - 若 content 为空：换模型或检查 Key/配额；并在 `openclaw.json` 中设 `agents.defaults.model.primary` 与 `models.providers.idatabase.models` 含该模型。

2. **Gateway Chat Completions（确认 Agent 路径）**  
   `OPENCLAW_STATE_DIR=/root/.openclaw ./scripts/test-llm-direct.sh`  
   - 若返回「No response from OpenClaw」：agent 跑完但 payloads 为空，与飞书现象同因；查日志 `no-payloads diagnostic`、`embedded run produced no payloads`，确认 `provider/model` 与主模型一致。

3. **飞书全链路**  
   在飞书 @机器人 发一条消息，同时：  
   `sudo journalctl -u openclaw-gateway -f | grep -E 'feishu|dispatching|dispatch complete|no-payloads'`  
   - 应看到 `dispatching to agent` → `dispatch complete (queuedFinal=true, replies=1)`；若出现 `no-payloads`，按第四节与 idatabase 直连结论排查。
