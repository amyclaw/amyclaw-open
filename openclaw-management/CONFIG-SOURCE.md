# 管理端配置数据源说明

## 同源约定

管理端与 Gateway **必须使用相同的 `OPENCLAW_STATE_DIR`**（默认 `~/.openclaw`），否则会出现「管理页保存成功但 Gateway 读不到」或反之。

- **配置**：唯一文件 `OPENCLAW_STATE_DIR/openclaw.json`
  - 读：`GET /api/config` 使用 `readConfig()` 读该文件
  - 写：`PATCH /api/config` 使用 `writeConfig()` 仅写该文件（原子写入：先写 `.tmp` 再 `rename`）
- **密钥**：唯一文件 `OPENCLAW_STATE_DIR/.env`
  - 读：所有需要密钥的接口均通过 `readEnv()` 读该文件，并与 `process.env` 合并后解析
  - 写：大模型/向量等 API Key 通过 `appendOrSetEnvLine` / `removeEnvKey` 仅写该文件（原子写入）

## 读写一致性

- 飞书账号（appId / appSecret）：只存在于 `openclaw.json` 的 `channels.feishu.accounts.default`，不写入 `.env`
- 大模型等 API Key：明文写入 `.env`，`openclaw.json` 中只保留 `{ source: "env", id: "KEY名" }` 引用
- 保存后前端会再次调用 `loadConfig()`，从同一数据源拉取并刷新表单，便于确认「写入后读出」一致

## 启动时确认

管理端启动日志会打印：

```
AmyClaw 管理服务: http://0.0.0.0:8080  (OPENCLAW_STATE_DIR=/root/.openclaw)
```

Gateway 启动时也需保证使用同一目录（环境变量或默认 `~/.openclaw`）。`GET /api/status` 会返回 `stateDir`、`configPath`、`envPath`，可用于核对本机路径是否一致。
