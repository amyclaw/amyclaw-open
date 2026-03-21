# AmyClaw 管理服务

通过本机 **8080 端口** 提供 Web 设置页：设置 AmyClaw Gateway Token、填写飞书/企业微信/模型/向量等配置、修改系统/用户密码，并预留升级与远程管理入口。

## 运行

```bash
cd /mnt/disk/amyclaw/openclaw-management
node server.js
```

- **端口**：量产/镜像默认 `8080`（`MANAGEMENT_PORT=8080`）；开发热加载调试可用 `8000`（`MANAGEMENT_PORT=8000`），与量产隔离。
- 默认监听 `0.0.0.0:8080`，可通过环境变量 **MANAGEMENT_PORT** 修改。
- 依赖 **OPENCLAW_STATE_DIR**（默认 `~/.openclaw`）定位 `openclaw.json` 与 `.env`；与 OpenClaw Gateway 使用同一状态目录。

## 首次访问与 Gateway Token

1. 浏览器打开 `http://<本机IP>:8080`。
2. **GET /api/status** 返回 **`gatewayTokenConfigured`**：本机 `openclaw.json` / `.env` 是否已有 Gateway Token。
3. **首次（尚未配置 Gateway Token）**：可「自动生成」或手动填写，点击「确认并保存」。Token 会同时写入 **`openclaw.json`**（`gateway.auth.token` / `gateway.remote.token`）、**`data/token.txt`**（管理端会话）与 **`.env` 的 `OPENCLAW_GATEWAY_TOKEN`**。
4. **已配置 Gateway Token 后**：下次访问须先输入**同一 Token**（或经「忘记 Token」验证）才能解锁全部配置与网关操作；**不允许在未清除的前提下再次「自动生成」新 Token**（**POST /api/set-token** 在 `generate: true` 且已存在 Gateway Token 时返回 400）。
5. **忘记管理页 Token**：**POST /api/unlock-with-secret**（无需 Bearer）提交与设备配置一致的 **`llmApiKey`**（当前主模型 idatabase/Google 所用 Key）或 **`feishuAppSecret`** 之一，校验通过后服务端写入 `data/token.txt` 并返回 **`token`**（即现有 Gateway Token），浏览器据此登录。
6. **安全重置 Gateway Token**：**GET /api/status** 含 **`canSafeResetGatewayToken`**：当本机已配置 Gateway Token，且**未**配置飞书 App Secret、也**未**配置任何大模型/记忆/备选模型相关 Key（与 `getResolvedSecrets` 一致）时为 `true`。此时可调用 **POST /api/safe-reset-gateway-token**（无需 Bearer）生成新 Gateway Token 并写回配置与 `.env`；若已存在任一类业务密钥则返回 400。用于尚未录入飞书/模型密钥、仅忘记 Gateway Token 的场景。
6. 进入设置页后，可修改 Gateway、飞书、idatabase.ai、向量等，点击「保存本块」或「**保存全部配置**」。**保存后 Gateway 会基于文件监听自动热加载**（仅修改 Gateway 端口/绑定等少数项需重启网关）。

## 升级与远程注册（对接未来升级服务器）

- **链接来源**：前端通过 **GET /api/urls**（无需鉴权）获取 `upgradeUrl`、`remoteRegisterUrl`，用于顶部「升级」「注册远程管理账号」按钮的 `href`。环境变量 `UPGRADE_SERVICE_URL`、`UPGRADE_PAGE_URL`、`REMOTE_REGISTER_URL` 可覆盖。
- **每日检测**：登录后前端每 24 小时调用 **POST /api/upgrade-check**（鉴权），请求升级服务 URL；若返回 JSON 含 `latestVersion` 且大于当前 **GET /api/version** 的版本，则显示「有可用更新」徽章，点击进入升级子页。
- **升级子页**：展示 **GET /api/version** 的当前版本；「检测本机环境」调用 **POST /api/upgrade-qualify**（鉴权），服务端将本机 `version` + `env`（Node 版本、平台、状态目录）POST 到升级服务的 **`<UPGRADE_SERVICE_URL>/qualify`**；升级服务器需实现该接口，返回 `{ qualify: boolean, message?, latestVersion? }`，仅当 `qualify === true` 时前端展示「同意升级」；同意后在新标签打开 `upgradeUrl`，由升级服务器提供实际下载/安装流程。
- **远程注册**：**POST /api/remote-upload**（鉴权）为预留接口，返回 `reserved: true`；远程管理网站与注册流程在后续实现。

## 系统与用户密码

- 登录后可在「系统与用户密码」区块修改 **Ubuntu 系统管理员（root）** 与 **标准用户** 的登录密码。
- 标准用户名由环境变量 **STANDARD_USER_NAME** 指定，默认 `amyclaw`；前端通过 **GET /api/system/users** 获取并展示。
- 密码规则：不少于 8 位，且须包含大写字母、小写字母与数字。服务端通过 **POST /api/system/change-password**（鉴权）调用 `chpasswd` 写回系统；管理进程需以 root 运行方能修改密码。

## 环境变量

| 变量 | 说明 |
|------|------|
| `OPENCLAW_STATE_DIR` | AmyClaw 状态目录，默认 `~/.openclaw` |
| `STANDARD_USER_NAME` | 标准用户（普通用户）用户名，用于密码修改展示，默认 `amyclaw` |
| `MANAGEMENT_PORT` | 管理服务端口；量产/镜像推荐 `8080`，开发热加载可用 `8000`，默认 `8080` |
| `OPENCLAW_GATEWAY_URL` | Gateway 地址，默认 `http://127.0.0.1:18789` |
| `UPGRADE_SERVICE_URL` | 升级服务地址，默认 `https://local.amyclaw.ai/upgrade` |
| `REMOTE_MANAGEMENT_URL` | 远程管理网站，默认 `https://local.amyclaw.ai` |

## 数据

- 管理端将「已设置的 Token」保存在项目下 `data/token.txt`（已加入 `.gitignore`），用于校验访问设置页的请求（Cookie 或 `Authorization: Bearer`）。不修改 AmyClaw 源码。

## 与 AmyClaw 同机部署

若 AmyClaw 使用自定义状态目录，启动管理服务时需指定相同目录：

```bash
export OPENCLAW_STATE_DIR=/var/lib/openclaw
node server.js
```

## 开发机调试管理页

在开发机上改 `public/index.html`（样式、文案等）后，要**让服务从仓库目录读文件**，刷新浏览器才能看到效果。

- **方式一：systemd 指向仓库（推荐）**  
  使用仓库自带的 systemd 单元（指向 `/mnt/disk/amyclaw`），不要用 `deploy-to-opt.sh` 写出的、指向 `/opt/amyclaw` 的单元：
  ```bash
  cd /mnt/disk/amyclaw
  sudo openclaw-management/scripts/systemd/install-autostart.sh
  sudo systemctl restart openclaw-management
  ```
  之后改 `openclaw-management/public/index.html`，保存后**直接刷新浏览器**即可，无需重启服务（每次请求都会从磁盘读 HTML）。

- **方式二：前台直接跑**  
  不依赖 systemd，在仓库里直接启动，便于看日志：
  ```bash
  cd /mnt/disk/amyclaw/openclaw-management
  export OPENCLAW_STATE_DIR=${OPENCLAW_STATE_DIR:-/root/.openclaw}
  node server.js
  ```
  访问 `http://本机IP:8080`。若 8080 已被 systemd 占用，可先 `sudo systemctl stop openclaw-management` 或设置 `MANAGEMENT_PORT=18080` 等其它端口。

若之前执行过 **scripts/deploy-to-opt.sh**，`/etc/systemd/system/openclaw-management.service` 会被写成 `WorkingDirectory=/opt/openclaw-management`，开发时需重新用 **install-autostart.sh** 装回仓库路径，或手动改 unit 的 `WorkingDirectory` 为仓库下的 `openclaw-management` 后 `systemctl daemon-reload && systemctl restart openclaw-management`。

## 量产部署到 /opt（磁盘镜像）

将管理页构建并部署到 **/opt/openclaw-management**，使用正确路径与端口（默认 8080），便于做磁盘镜像与量产：

```bash
cd /mnt/disk/amyclaw/openclaw-management
# 可选：OPENCLAW_STATE_DIR=/opt/amyclaw/state MANAGEMENT_PORT=8080
sudo ./scripts/deploy-to-opt.sh
sudo systemctl enable openclaw-management.service && sudo systemctl start openclaw-management.service
```

- 部署后访问 `http://<本机IP>:8080`。
- 开发调试时可在仓库内用 `MANAGEMENT_PORT=8000 node server.js` 或 `node --watch server.js`，与量产 8080 端口隔离。

## 开机自启

若希望 OpenClaw Gateway 与管理页在开机时自动启动，可使用 systemd 单元：

- Gateway 单元：`openclaw/scripts/systemd/openclaw-gateway.service`
- 管理页单元：`openclaw-management/scripts/systemd/openclaw-management.service`

安装与启用步骤见 **[scripts/systemd/README.md](scripts/systemd/README.md)**。
