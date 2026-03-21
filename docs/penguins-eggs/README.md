# 使用 Penguins-eggs 打包本系统（含 OpenClaw + 管理前后端）

将当前系统打包为可安装的 Live ISO，**包含** OpenClaw 与管理前后端运行所需内容，**排除**未编译代码、个人账号、敏感文件，并将备份输出到 `/mnt/backup`。

## 一、安装 Penguins-eggs

```bash
git clone https://github.com/pieroproietti/fresh-eggs
cd fresh-eggs
sudo ./fresh-eggs.sh
```

安装完成后会安装 Node.js（如需要）、依赖和 `eggs` 命令。

## 二、配置

### 2.0 量产母机：主机名、DHCP、Gateway LAN（打 ISO 前）

若需 **主机名 amyclaw**、**18789 网关可被局域网访问**、**DHCP 检查**，请先执行：

```bash
sudo bash /mnt/disk/amyclaw/scripts/mother-image-prepare-for-amyclaw-iso.sh
sudo bash /mnt/disk/amyclaw/docs/penguins-eggs/deploy-to-opt.sh
```

详见 `docs/eggs-量产克隆与使用说明.md` 第二节与 `docs/penguins-eggs/网络-DHCP-说明.md`。

### 2.1 输出目录与密码（可选）

- 将 **ISO/备份输出目录** 设为 `/mnt/backup`。
- 可选：将 Live 系统 root 密码设为 `amyclaw20260315`，标准用户设为 `amyclaw`、密码相同；**也可以不包含系统账号与密码**（恢复后自行设置）。

先创建输出目录并配置 eggs：

```bash
sudo mkdir -p /mnt/backup
# 方式 A：使用本项目提供的示例配置（含输出目录与可选密码）
sudo eggs dad --file /mnt/disk/amyclaw/docs/penguins-eggs/eggs-dad-example.yaml
# 方式 B：生成默认配置后再手动改
# sudo eggs dad --default
```

若无 `eggs-dad-example.yaml`，可手动编辑 `/etc/penguins-eggs.d/eggs.yaml`，修改或确认：

```yaml
# 备份输出到此路径（ISO 与中间文件）
snapshot_dir: /mnt/backup

# 可选：固定 root 与 Live 用户密码（若不需要固定密码可删除或留空）
root_passwd: amyclaw20260315
user_opt: amyclaw
user_opt_passwd: amyclaw20260315
```

若不希望镜像内包含固定系统账号与密码，可注释或删除上述三行，恢复后在目标机上自行创建用户与密码。

**Krill（安装到硬盘时的账号）**：须与上表一致，否则无人值守安装可能仍使用上游默认（如 `evolution`）。请将仓库中的 **`docs/penguins-eggs/krill-amyclaw.yaml`** 安装为 `/etc/penguins-eggs.d/krill.yaml`，或执行：

```bash
sudo bash /mnt/disk/amyclaw/scripts/apply-oem-penguins-eggs-credentials.sh
```

**母机当前系统的密码**：打 ISO 前请执行 `sudo bash /mnt/disk/amyclaw/scripts/set-oem-system-passwords.sh`，使镜像内 `/etc/shadow` 已为正确哈希（`mother-image-prepare-for-amyclaw-iso.sh` 已包含此步）。

### 2.2 排除列表（必须）

eggs 使用 `/etc/penguins-eggs.d/exclude.list`，该文件由 `exclude.list.d/` 下模板合并生成。默认模板会排除 `mnt/*`，会连 `/mnt/disk/amyclaw` 一起排除，因此需要自定义排除逻辑，只排除备份路径与不需要的内容。

**步骤 1：添加本项目的排除模板**

将仓库中 `docs/penguins-eggs/amyclaw-exclude.list` 复制到 eggs 的模板目录：

```bash
sudo cp /mnt/disk/amyclaw/docs/penguins-eggs/amyclaw-exclude.list /etc/penguins-eggs.d/exclude.list.d/
```

**步骤 2：修改默认 master 模板，避免排除整个 /mnt**

编辑 `/etc/penguins-eggs.d/exclude.list.d/master.list`，将：

```
mnt/*
```

改为只排除备份路径（保留 `/mnt/disk/amyclaw`）：

```
mnt/backup
mnt/backup/*
```

保存后，以后执行 `eggs produce` 时会自动合并各模板生成 `exclude.list`。若希望使用完全静态的排除列表、不再自动合并，可在打包时加 `--static`（需自行维护完整 `exclude.list`）。

## 三、打包前检查

1. **OpenClaw**：已构建好（`openclaw/dist/` 存在），Gateway 以 `node openclaw.mjs gateway` 能正常启动。
2. **管理端**：`openclaw-management` 下 `server.js`、`public/` 就绪，`node server.js` 能正常启动。
3. **敏感与个人**：已通过 `amyclaw-exclude.list` 排除（见下一节）；确认未在镜像中保留个人账号、token、`.env`、`data/token.txt`、`/root/.openclaw` 等。
4. **备份路径**：`/mnt/backup` 已从快照内容中排除，仅作为输出目录使用。

## 四、执行打包

```bash
sudo eggs produce --verbose
```

如需使用当前已生成的排除列表、不再重新合并模板：

```bash
sudo eggs produce --verbose --static
```

完成后，ISO 与中间文件在 `/mnt/backup` 下，名称类似：

`egg-of_<发行版>_<版本>_<主机名>-<架构>_<日期>_<时间>.iso`

## 五、排除内容说明（amyclaw-exclude.list）

- **/mnt/backup**：备份输出目录，不打包进镜像。
- **OpenClaw 未编译与开发用**：`openclaw` 下的 `.git`、`src/`、`docs/`、`apps/`、`changelog/`、`.github/`、测试与开发配置等；保留 `dist/`、`openclaw.mjs`、`extensions/`、`skills/`、`production-template/` 等运行所需部分。
- **管理端敏感与临时**：`openclaw-management/data/`、`openclaw-management/.env`、`openclaw-management/.env.local`、日志等。
- **运行时依赖**：`openclaw/node_modules`、`openclaw-management/node_modules` 已排除，恢复后在目标机执行 `pnpm install` / `npm install` 以减小镜像并避免二进制兼容问题。
- **系统级敏感**：`/root/.openclaw`（Token、API Key 等）不打包，恢复后通过管理页或 production-template 重新配置。

其他系统运行与上述两个系统运行不需要的敏感文件、个人文件，也通过该列表排除；个人账号由默认 homes 模板与上述策略处理。

## 六、恢复至另一台机器

详见同目录下 **[另一台机器恢复说明.md](./另一台机器恢复说明.md)**。
