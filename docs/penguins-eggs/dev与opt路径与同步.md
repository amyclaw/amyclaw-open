# Dev 路径与 Opt 路径（两套）及同步规则

## 两套路径

| 路径 | 用途 | 说明 |
|------|------|------|
| **Dev** | 开发、日常测试 | 仓库根目录，如 **/mnt/disk/amyclaw**。含源码、测试、文档。开发时 systemd 可指向此处（如 `WorkingDirectory=/mnt/disk/amyclaw/openclaw`）。 |
| **Opt** | 量产/恢复镜像 | **/opt/amyclaw**。仅编译后运行文件（dist、入口、extensions、node_modules 等），无源码。eggs 打包时把此目录打进 ISO；恢复机从该路径跑服务。 |

两套互独立：在 dev 改代码不会自动反映到 opt；在 opt 跑的服务不会读 dev 路径。

---

## 两套不能同时启动

**Gateway（18789）与管理页（8080）端口共用**：同一台机上只能跑「一套」服务（要么全从 dev 路径起，要么全从 opt 路径起）。两套**不能同时启动**，否则端口冲突或出现混用。

- 要测 **DEV**：停掉现有服务后，用 dev 的 systemd 单元启动（如 `restart-management-linked-services.sh` 或 install-autostart.sh），再跑 E2E。
- 要测 **OPT**：停掉服务后，用 opt 的单元启动（deploy-to-opt.sh 写出的单元），再跑 E2E。
- 切换时：`sudo systemctl stop openclaw-gateway openclaw-management`，再按上面选一套启动。

---

## DEV 与 OPT 的访问方式

| 项目 | DEV 套 | OPT 套 |
|------|--------|--------|
| **端口** | 同一台机上仍是 18789（Gateway）、8080（管理页） | 同左 |
| **访问地址** | 本机：`http://127.0.0.1:8080`；局域网：`http://<本机IP>:8080`（如 `http://10.8.52.123:8080`） | 相同；恢复机或打包机用 OPT 时也是 `<本机IP>:8080` |
| **差异** | 代码与静态文件来自 **/mnt/disk/amyclaw**；改前端/代码后刷新即生效（管理页） | 代码来自 **/opt/amyclaw**；改完需重新同步并重启服务 |

理论上 **DEV 的访问** 与 **OPT 的访问** 在「端口与 URL」上一致；区别只在于**谁在跑**（哪个 WorkingDirectory）和**代码从哪读**。同一时刻只有一套在跑，访问的即是当前这套。

---

## 测试可以在 dev 或 opt 上做

- **在 dev 上测试**：在 `/mnt/disk/amyclaw` 下开发、构建、跑单测/e2e；用指向 dev 的 systemd 或直接 `openclaw gateway` 做联调。
- **在 opt 上测试**：先执行一次「同步到 opt」（见下），再在 `/opt/amyclaw` 下启动服务做验收（与恢复机一致）。

两种方式均可；量产版本以 **opt** 为准。

---

## 测试通过后必须同步到 opt（覆盖量产版本）

**规则**：凡在 dev 上有过改动（代码、管理端前端、配置模板等），测试通过后，**必须**把当前 dev 内容同步到 opt，覆盖 opt 上的量产版本。否则打包/恢复出来的镜像仍是旧版。

**操作步骤**：

1. **在 dev 路径下确保已构建**  
   在 `/mnt/disk/amyclaw/openclaw` 下执行：
   ```bash
   pnpm build
   ```
   保证 `dist/`、入口等已生成。

2. **执行同步脚本（需 root）**  
   从仓库根执行：
   ```bash
   sudo bash docs/penguins-eggs/deploy-to-opt.sh
   ```
   脚本会从 **dev（默认 /mnt/disk/amyclaw）** rsync 到 **/opt/amyclaw**，并写入指向 `/opt/amyclaw` 的 systemd 单元。

3. **再打包或恢复**  
   之后执行 eggs 打包时，/opt/amyclaw 即为当前量产版本；恢复机安装后即使用该版本。

---

## 可选：自定义 dev 路径

若开发仓库不在 `/mnt/disk/amyclaw`，可设置环境变量后再执行同步脚本：

```bash
export AMYCLAW_DEV_PATH=/path/to/your/amyclaw
sudo -E bash docs/penguins-eggs/deploy-to-opt.sh
```

脚本会使用 `AMYCLAW_DEV_PATH` 作为源路径（SRC）同步到 /opt/amyclaw。

---

## 端到端测试（E2E）：确保 DEV 和 OPT 两套都工作

两套**不能同时启动**；要分别验证，只能**切换后各跑一次 E2E**。

### 1. 当前跑的是哪一套？

- 看 systemd 单元里 **WorkingDirectory**：  
  `sudo systemctl cat openclaw-gateway.service`  
  - 含 `/mnt/disk/amyclaw` → 当前是 **DEV**  
  - 含 `/opt/amyclaw` → 当前是 **OPT**

### 2. 对「当前这套」跑 E2E（回复链路 + 模型）

在仓库根执行（会读当前机的 `OPENCLAW_STATE_DIR` 与 Gateway 端口）：

```bash
export OPENCLAW_STATE_DIR="${OPENCLAW_STATE_DIR:-/root/.openclaw}"
./scripts/e2e-reply-and-env.sh
```

脚本会：检测当前是 DEV 还是 OPT、检查状态目录一致性、用大模型 chat 走一遍回复链路。通过即表示**当前这套**可正常生成回复。

### 3. 确保两套都工作

1. **先测 DEV**  
   - 停掉服务后启动 DEV 套（如 `sudo bash docs/penguins-eggs/restart-management-linked-services.sh`）。  
   - 运行：`OPENCLAW_STATE_DIR=/root/.openclaw ./scripts/e2e-reply-and-env.sh`。  
   - 通过后再切到 OPT。

2. **再测 OPT**  
   - `sudo systemctl stop openclaw-gateway openclaw-management`  
   - 用 OPT 单元启动（若尚未有：先 `sudo bash docs/penguins-eggs/deploy-to-opt.sh`，再 `sudo systemctl start openclaw-gateway openclaw-management`）。  
   - 运行：`OPENCLAW_STATE_DIR=/root/.openclaw ./scripts/e2e-reply-and-env.sh`。  
   - 通过即表示两套在「回复链路 + 模型」上均正常。

---

## 小结

| 问题 | 答案 |
|------|------|
| 是否两套路径？ | 是：dev（如 /mnt/disk/amyclaw）与 opt（/opt/amyclaw）。 |
| 能同时启动吗？ | 不能；端口共用，同一时刻只跑一套。 |
| DEV 与 OPT 访问有区别吗？ | 端口与 URL 相同（8080/18789）；区别只是代码从哪读、当前跑的是哪套。 |
| 测试可以在哪做？ | dev 或 opt 都可以，切换后分别跑 E2E。 |
| 测试通过后要做什么？ | 必须执行 `deploy-to-opt.sh`，把 dev 同步到 opt，覆盖量产版本。 |
| 同步前要构建吗？ | 要。在 openclaw 目录下先 `pnpm build`，再运行 deploy-to-opt.sh。 |
