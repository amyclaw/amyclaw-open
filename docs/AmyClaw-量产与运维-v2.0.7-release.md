# AmyClaw 量产与运维说明 v2.0.7-release

> **定位**：面向**运维/集成人员**的精简版总览。详细参数、排错与历史说明仍以现有文档为准（见文末「相关文档」），**本文不替代** `eggs-量产克隆与使用说明.md`。

---

## 1. 产物与版本

| 项目 | 说明 |
|------|------|
| **ISO** | 母机执行 `eggs-produce-and-backup.sh` 后，在 **`/mnt/backup/`** 可得到 eggs 默认名 + **`amyclaw_<版本>_amd64_<时间戳>.iso`**（内容相同，后者便于版本管理）。 |
| **版本号** | 环境变量 **`AMYCLAW_IMAGE_VERSION`**（当前量产默认 **`v2.0.7-release`**），写入 **`/etc/amyclaw-release`** 后打入镜像。 |
| **克隆后系统用户** | 默认 **`amyclaw`** / **`amyclaw20260315`**；**root** 同密码（以母机当时 Krill/OEM 为准）。**`amyclaw` 须在 `sudo` 组**（`set-oem-system-passwords.sh` 已自动处理）；旧镜像若无 sudo，见 **`eggs-量产克隆与使用说明.md`**「现场被锁」小节。 |

---

## 2. 制作 U 盘（简要）

1. 从 **`/mnt/backup/`** 拷贝 ISO 到运维机。  
2. **Linux**：`dd` 写入整块 U 盘设备（勿选系统盘）；**Windows**：Rufus / Ventoy 等；**macOS**：Etcher 或 `dd`。  
3. U 盘建议 **≥ 8GB**。  

（命令级示例与注意事项见 **`eggs-量产克隆与使用说明.md`** 第三节。）

---

## 3. 量产流程（目标机）

1. **插 U 盘** → BIOS 从 U 盘启动 → 进入 Live。  
2. **设计目标**：**无人值守**自动执行 **`eggs install --unattended -n --halt`**，装完**自动关机**。  
3. **关机后拔 U 盘** → 再从**硬盘**启动 → 进入克隆系统。  
4. **若无法自动安装**：在 Live 下用 **`sudo eggs krill`** 或 **`sudo eggs install --unattended -n --halt`** 补救；多盘时注意区分 U 盘与目标盘（勿把系统装到 U 盘）。  

（详细条件、磁盘识别、排错见 **`eggs-量产克隆与使用说明.md`** 第四节与 4.1。）

---

## 4. 母机打镜像前推荐步骤（与现有文档一致）

按顺序（路径以仓库为准）：

1. **`mother-image-prepare-for-amyclaw-iso.sh`** — 主机名、DHCP、Krill/eggs 凭证等。  
2. **`openclaw` 内 `pnpm build`** → **`deploy-to-opt.sh`** — 运行时代码与 **`/opt/amyclaw/oem/`**（含自检脚本等）。  
3. **`apply-netplan-dhcp-oem.sh`**（按需）。  
4. 写入 **`/etc/amyclaw-release`**（可选，建议 **`AMYCLAW_IMAGE_VERSION=v2.0.7-release`**）。  
5. **`eggs-produce-and-backup.sh`** — 生成 ISO（默认会执行 **apt clean / journal 裁剪 / 清理 eggs 快照目录内旧 ISO**，可用 **`EGGS_CLEAN_BEFORE_ISO=0`** 跳过）。  

（完整命令块见 **`eggs-量产克隆与使用说明.md`** 第二节。）

**一键打 ISO（推荐）**：`sudo bash /mnt/disk/amyclaw/scripts/make-amyclaw-iso-v2.0.7-release.sh`（内部写入 `/etc/amyclaw-release` 并调用 `eggs-produce-and-backup.sh`）。

---

## 5. 设置与使用（运维侧：Gateway / Control UI / 管理页）

### 5.1 两个入口

| 入口 | 地址（示例） | 用途 |
|------|----------------|------|
| **管理设置页** | `http://<设备IP>:8080` | 填写飞书、大模型、**管理 Token**、**系统用户密码**等（面向用户的主要配置界面）。 |
| **Gateway 管理 / Control UI** | `http://<设备IP>:18789` | OpenClaw 网关自带界面与 API（需 **Gateway Token**；量产种子一般为 **LAN 绑定**）。 |

### 5.2 Token（密钥）关系（简要）

- **管理页 Token** 与 **Gateway** 使用同一状态目录时，应 **`OPENCLAW_GATEWAY_TOKEN`** / **`gateway.auth.token`** 与 **`gateway.remote.token`** 一致；保存后网关会尝试 **reload**。  
- **详细排查与热加载**见 **`热加载与无回复排查.md`**、**`18789-网关管理后台无法访问-排查.md`**。  

### 5.3 量产镜像内 OEM（无 `/mnt` 仓库时）

- **`/opt/amyclaw/oem/`**：网络修复脚本、**`diagnose-openclaw-gateway-feishu.sh`** 等。  
- 飞书/大模型无回复：在设备上执行 **`sudo bash /opt/amyclaw/oem/diagnose-openclaw-gateway-feishu.sh`** 做快速自检。  

### 5.4 飞书帐号与多实例（运维必读）

> **重要**：**任何时候**都**不要**用**同一套飞书自建应用 / 同一 App ID + App Secret** 在**多台 AmyClaw 设备**或**多套独立 OpenClaw 环境**上**并行调试**。

| 原因 | 说明 |
|------|------|
| **事件与长连接** | 飞书开放平台侧，同一应用的事件订阅、长连接与租户/机器人状态是**应用维度**绑定的；多 Gateway 同时连同一应用易出现**事件路由混乱**、**重复/漏收**、日志与现象**不可复现**。 |
| **调试结论失真** | 在 A 上改的权限、在 B 上看到的「无回复」可能互相干扰，**不是**单机问题。 |

**建议做法**：

- **每台量产机 / 每个独立环境**使用**独立飞书应用**（至少独立 **测试应用**），与生产应用分离。  
- 若仅有一台设备，**换环境前**在开放平台侧**禁用旧连接**或**先停掉另一台网关**，避免双活抢同一应用事件。  

（用户侧简要说明见 **`AmyClaw-用户安装后使用说明-v2.0.7-release.md`**；飞书端注册与权限见 **`飞书-开放平台注册应用与机器人指南.md`**。）

### 5.5 Ubuntu 下查询本机 IP（现场）

在**目标机本机**终端（或 SSH 登录后）执行：

| 方式 | 命令 / 操作 |
|------|-------------|
| **一行 IPv4** | `hostname -I`（多个地址时取第一个或按网卡区分） |
| **详细** | `ip -4 addr show scope global` 或简写 `ip -br a` |
| **默认出口 IP** | `ip route get 1.1.1.1`（输出里 `src` 后一般为当前用于对外通信的源地址） |
| **NetworkManager** | `nmcli -p device show` 或 `nmcli device show <网卡名>` |
| **图形界面** | **设置 → 网络 → 有线 / Wi‑Fi → 齿轮 / 详情**，查看 IPv4 地址。 |

**说明**：

- 多网卡时以**实际接管理终端的网段**为准（`192.168.x.x`、`10.x.x.x` 等）；  
- 若用 **`.local` 主机名**访问管理页，**务必以 `ip` 或 `ping` 确认解析到目标机**，避免多台同名主机名导致连错设备（见 **`eggs-量产克隆与使用说明.md`** 与现场排错）。  

---

## 6. v2.0.7-release 相对 v2.0.6-release 的变更摘要（运维与管理页相关）

| 项 | 说明 |
|------|------|
| **版本号与文档** | 默认 **`AMYCLAW_IMAGE_VERSION=v2.0.7-release`**；管理端 **`package.json`** 为 **`2.0.7`**；姊妹篇以 **`v2.0.7-release`** 文件名为准。 |
| **OEM 密码** | **root** 与 **`amyclaw`** 默认密码仍为 **`amyclaw20260315`**（`set-oem-system-passwords.sh`、`eggs-dad-example.yaml`、`krill-amyclaw.yaml` 一致）；打 ISO 前执行 OEM 脚本可确保 **`/etc/shadow`** 与镜像一致。 |

---

## 7. v2.0.6-release 相对 v2.0.3 的变更摘要（运维与管理页相关）

| 项 | 说明 |
|------|------|
| **idatabase 模型列表** | 主模型与向量（记忆）模型**分流**拉取；服务端按模型 id 启发式区分 chat / embedding；**记忆区未填 Key 时**与主模型同 Key 拉取列表，避免列表为空或与主模型不一致。 |
| **保存与刷新** | 保存配置后**不**再用「仅配置一条」覆盖用户已拉取的**完整下拉**；**刷新浏览器**后仅展示**已保存的选中项**，完整列表需用户手动点击「获取模型列表 / 获取可用模型」。 |
| **版本号与文档** | 默认 **`AMYCLAW_IMAGE_VERSION=v2.0.6-release`**；管理页展示 **`v2.0.6-release`**；姊妹篇以 **`v2.0.6-release`** 文件名为准。 |

---

## 8. v2.0.3 相对 v2.0.2 的变更摘要（历史）

| 项 | 说明 |
|------|------|
| **OEM / sudo** | `set-oem-system-passwords.sh` 将 **`amyclaw` 加入 `sudo` 组**（v2.0.2 及更早若未执行该更新，克隆机可能无 sudo）；现场恢复见 **`eggs-量产克隆与使用说明.md`**「现场被锁」。 |
| **版本号与文档** | 默认 **`AMYCLAW_IMAGE_VERSION=v2.0.3`**；姊妹篇文件名曾为 **v2.0.3**（详见 **`AmyClaw-量产与运维-v2.0.3.md`**）。 |

---

## 9. 相关文档（不覆盖、互为补充）

| 文档 | 内容 |
|------|------|
| `eggs-量产克隆与使用说明.md` | 打包、刻录、克隆、手工安装、技术表、脚本路径。 |
| `热加载与无回复排查.md` | 热加载、飞书链路、插件条目、大模型 Key。 |
| `penguins-eggs/全新机器恢复完整指南.md` | 恢复机与网关/管理端联调。 |
| `AmyClaw-用户安装后使用说明-v2.0.7-release.md` | **终端用户**：仅安装后设置与使用。 |
| `飞书-开放平台注册应用与机器人指南.md` | **飞书端**：注册应用与机器人。 |

---

*文档版本：v2.0.7-release · 与镜像 `AMYCLAW_IMAGE_VERSION` 及仓库内其它文档并列维护*
