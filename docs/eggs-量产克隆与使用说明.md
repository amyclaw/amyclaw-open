# AmyClaw 系统量产克隆与使用说明

**当前镜像版本：v2.0.3**（ISO 文件名形如 `amyclaw_v2.0.3_amd64_<日期时间>.iso`，由 `AMYCLAW_IMAGE_VERSION` 控制。）

基于 **Penguins' Eggs** 将当前系统打包为可启动 ISO，刻录 U 盘后在新机器上**无人值守**完成克隆安装，重启即可使用；后续仅需在管理终端填写飞书号、大模型密钥等即可投入使用。

---

## 一、本次打包与备份结果

| 项目 | 说明 |
|------|------|
| **本次生成的 ISO** | eggs 默认名 **`amyclaw_amd64_<日期>_<时间>.iso`**；脚本会额外复制为 **`amyclaw_v2.0.3_amd64_<日期>_<时间>.iso`**（版本号由环境变量 `AMYCLAW_IMAGE_VERSION` 控制，默认 **v2.0.3**） |
| **备份位置** | `/mnt/backup/`（体积随系统变化，约数 GB） |
| **镜像版本标记** | 母机 **`/etc/amyclaw-release`**（`AMYCLAW_IMAGE_VERSION=v2.0.3`），打入 ISO 后克隆机可读 |
| **克隆后系统用户** | `amyclaw` / 密码见下方「默认账号」（母机打 ISO 前须执行 `set-oem-system-passwords.sh` 与 krill 模板，避免仍为 root/root） |
| **安装行为** | 从 U 盘启动后自动执行克隆安装，完成后自动关机，无需操作员干预 |
| **网络** | **DHCP** 取 IP；**DNS** 为 **DHCP + netplan 静态 nameservers 合并**，并配 **`resolved` 的 `DNS=`**；详见 `resolv-镜像说明.md`（若仅 ping IP 通、域名不通，亦可能是防火墙拦 UDP/53） |
| **Gateway 18789** | 量产种子为 **`gateway.bind=lan`**，局域网内可用 `http://<设备IP>:18789` 打开管理界面（需 Token；与 8080 管理页共用） |

### 默认账号（仅作克隆恢复用，建议首次登录后修改）

- **Live 环境**（仅 U 盘启动时）：用户 `live`，密码 `evolution`；root 密码 `evolution`。
- **克隆安装后的系统**：用户 **`amyclaw`**，密码 **`amyclaw20260315`**；**root** 密码同为 **`amyclaw20260315`**（与 `eggs-dad-example.yaml`、`krill-amyclaw.yaml` 及 `set-oem-system-passwords.sh` 一致；**不是** root/root）。
- **sudo**：标准用户 **`amyclaw` 须在 `sudo` 组**（打 ISO 前执行 `set-oem-system-passwords.sh` / `mother-image-prepare-for-amyclaw-iso.sh` 会自动 `usermod -aG sudo amyclaw`）。旧镜像若未包含该步骤，会出现「amyclaw is not in the sudoers file」。

### 现场被锁：无 sudo、改不了 root、sshd 配不了

| 现象 | 说明 |
|------|------|
| **`passwd` 改不了 root** | 普通用户执行 `passwd` **只改自己的密码**；改 root 须 **root 身份**（`sudo passwd root` 或控制台 root 登录）。 |
| **SSH 下 root 登不上** | 常见为 **`PermitRootLogin`** 禁止密码登录，属正常加固；应 **`amyclaw` 登录 + `sudo`**。若 amyclaw **无 sudo**，则陷入死锁，见下表恢复。 |
| **sshd 配置「不可编辑」** | 无 root 权限时无法写 `/etc/ssh/sshd_config`；若文件系统只读，先 **`mount -o remount,rw /`**（须 root）。 |

**恢复思路（任选其一，均需能接触机器或 U 盘）：**

1. **本机物理控制台用 root 登录**（TTY，非 SSH）：若 root 密码仍为 OEM 默认，登录后执行：  
   `usermod -aG sudo amyclaw` → `passwd`（按需）→ 编辑 `sshd` → `systemctl restart ssh`。
2. **GRUB 恢复模式 / 单用户**：启动菜单选 **Advanced → recovery mode** 或给内核加 **`init=/bin/bash`**，根分区 **`mount -o remount,rw /`** 后同样执行 `usermod -aG sudo amyclaw`、`passwd root` 等。
3. **Live U 盘**：用同架构 ISO 启动，挂载目标机根分区，`chroot` 后执行上述命令（或直接从 Live 里编辑目标盘上的 `/etc/shadow`、`/etc/group`、`/etc/ssh/sshd_config.d/`）。

**母机侧**：重新打 ISO 前务必执行已修复的 **`set-oem-system-passwords.sh`**（或整套 **`mother-image-prepare-for-amyclaw-iso.sh`**），避免再次下发无 sudo 的镜像。

---

## 二、母机再次打包（推荐流程）

在需要更新镜像、重新量产时，在**母机**上**按顺序**执行：

```bash
# 1) 主机名改为 amyclaw、检查 DHCP、种子化 OpenClaw（LAN + 18789 可访问）
sudo bash /mnt/disk/amyclaw/scripts/mother-image-prepare-for-amyclaw-iso.sh

# 2) 同步 OpenClaw / 管理端到 /opt 并写入 systemd（含网关环境变量）
#    要求：母机已安装 pnpm，且仓库 openclaw 可执行 pnpm ui:build（生成 dist/control-ui，否则脚本会失败退出）
sudo bash /mnt/disk/amyclaw/docs/penguins-eggs/deploy-to-opt.sh

# 3)（强烈建议）母机改为标准 DHCP、写入 /etc/netplan 并自检出网（再打入 ISO）
#    默认会 netplan apply + ping/curl 自检；若 SSH 用静态 IP 怕断线：先设 APPLY_NETPLAN=0，再在控制台 apply
sudo bash /mnt/disk/amyclaw/scripts/apply-netplan-dhcp-oem.sh
# 仅写入 DHCP 模板、不立即 apply：sudo APPLY_NETPLAN=0 bash /mnt/disk/amyclaw/scripts/apply-netplan-dhcp-oem.sh

# 4) 写入镜像版本号（可选，默认 v2.0.3）
echo "AMYCLAW_IMAGE_VERSION=v2.0.3" | sudo tee /etc/amyclaw-release
echo "BUILD_DATE=$(date -Iseconds)" | sudo tee -a /etc/amyclaw-release

# 5) 生成 ISO 并复制到 /mnt/backup（带版本文件名）
sudo AMYCLAW_IMAGE_VERSION=v2.0.3 /mnt/disk/amyclaw/scripts/eggs-produce-and-backup.sh

# 或一键：写入 /etc/amyclaw-release 为 v2.0.3 并打 ISO（内部仍调用 eggs-produce-and-backup.sh）
# sudo bash /mnt/disk/amyclaw/scripts/make-amyclaw-iso-v2.0.3.sh
```

- 会生成新 ISO（eggs 默认名 + **`amyclaw_v2.0.3_amd64_日期时间.iso`**），并复制到 `/mnt/backup`。
- **`deploy-to-opt.sh` 与量产可靠性**：克隆机**只有** `/opt/amyclaw`（`/mnt` 下开发仓库**不会**进 ISO）。母机打 ISO **前**必须成功执行 **`deploy-to-opt.sh`**；脚本会 **`pnpm ui:build`** 并把 **`dist/control-ui`** 一并 rsync 到 `/opt`，否则网关启动时会在目标机尝试自动构建 UI，常失败 → **18789 报 503**（与 8080 管理页、飞书通道是否配置**无直接关系**，但运维会误以为「镜像坏了」）。若故意跳过 UI，可设 **`AMYCLAW_SKIP_UI_BUILD=1`**（不推荐用于量产）。
- **管理端版本不一致**（例如一台 `1.0.6`、一台 `1.0.11`）：说明 **`/opt/amyclaw/openclaw-management` 不是同一次 deploy**，或某台未随镜像更新；应在母机统一 **`deploy-to-opt.sh`** 后再装系统或重打 ISO。
- **飞书「通道开但收不到消息」**：除开放平台与长连接外，须 **`plugins.entries.feishu.enabled`** 与 **`channels.feishu`** 一致；新版管理端在 **`PATCH /api/config`** 保存时会自动对齐。已写入旧配置的设备：升级管理端后**再保存一次飞书区块**，或手动改 JSON 后热加载/重启 Gateway。
- 打包时 **不会** 包含 `/mnt` 下任何内容（代码、备份、下载等均排除）。
- **打 ISO 前清理**：`eggs-produce-and-backup.sh` 默认会执行 **apt clean**、**journal 裁剪**、清理 **`/var/tmp/eggs/.../mnt` 内旧 ISO**；若需跳过，设 **`EGGS_CLEAN_BEFORE_ISO=0`**。
- **`eggs-produce-and-backup.sh`** 会在打 ISO 前自动：**resolv 软链**、**FallbackDNS**、**把仓库 `netplan-50-dhcp.yaml` 写入 `/etc/netplan/`**（不强制 `netplan apply`）、并检查 **`/` 空闲 ≥ 约 4GiB**；步骤 3 仍建议执行以便母机本机网络与自检。

---

## 三、刻录 U 盘启动盘

1. **获取 ISO**  
   从母机或备份处拷贝 **`amyclaw_v2.0.3_amd64_*.iso`**（或 eggs 默认生成的 `amyclaw_amd64_*.iso`）。

2. **刻录方式（任选其一）**
   - **Linux**：  
     ```bash
     sudo dd if=/path/to/amyclaw_amd64_YYYY-MM-DD_HHMM.iso of=/dev/sdX bs=4M status=progress oflag=sync
     ```  
     将 `/dev/sdX` 替换为 U 盘设备（如 `sdb`），**切勿**选错为系统盘。
   - **Windows**：使用 Rufus、Ventoy 等工具，选择该 ISO 写入 U 盘。
   - **macOS**：可使用 Etcher 或 `dd` 将 ISO 写入 U 盘。

3. **U 盘容量**  
   建议 ≥ 8GB（当前 ISO 约 **3.5GB** 量级，以实际文件为准）。

---

## 四、新机克隆流程（量产恢复）

1. **插入 U 盘**，开机并设置从 U 盘启动（BIOS/UEFI 中选择该 U 盘为第一启动项）。
2. **从 U 盘启动**后，系统会进入 Live 环境，并**自动**执行：
   - 无人值守克隆安装（`eggs install --unattended -n --halt`）
   - 安装完成后**自动关机**
3. **无需任何操作**：无需选择菜单、无需输入密码、无需确认分区，直到机器关机。
4. **关机后**：拔掉 U 盘，再次开机，从**硬盘**启动，即进入已克隆好的系统。

**说明：量产「正常路径」与「必须手工」**

| 问题 | 结论 |
|------|------|
| 进 Live 后是否**一定**要手工装？ | **否**。设计目标是 **systemd 无人值守** 自动执行 `eggs install --unattended -n --halt`，**不需要**先登录 root、也**不需要**进图形菜单点安装。 |
| 第一步是否要 root 登录才能自动化？ | **否**。自动安装由 **Live 下的服务**触发；只有在你需要**手动排查**或**改参数**时才要打开终端（可用 `live` 用户，见「默认账号」）。 |
| 菜单是否要手工选？ | **正常量产不需要**。若使用 **`sudo eggs krill`** 等**交互式**安装器，才会出现选盘/分区界面——这是**补救流程**，不是默认量产路径。 |
| 何时才「必须」手工？ | 见下方 **4.1**（服务未触发、多块盘要选目标盘、无人值守失败等）。 |

### 4.1 手工安装（无人值守未执行或失败时）

以下情况需要在 **Live（U 盘仍插入）** 下**自行执行一次安装**，把系统写入本地硬盘：

| 情况 | 说明 |
|------|------|
| 未自动关机 | 进入 Live 后长时间停留在桌面，机器**没有**在合理时间内自动关机 |
| 服务未触发 | 自动安装依赖 `eggs-unattended-install.service`，且通常要求存在 **`/run/live/medium`**（表示从可移动介质启动）；若未满足则可能不执行 |
| 安装中断 | 安装过程中断电、提前拔 U 盘、或终端有明确报错导致未完成 |
| 需要确认磁盘 | 多块硬盘时需**交互选择**目标盘，可用 **`sudo eggs krill`** |

**重要约定（必读）**

- **U 盘保持插入**，直到安装**正常结束并关机**（无人值守命令一般会 **`--halt` 自动关机**）。**中途拔 U 盘**容易导致安装未完成，表现为**重启后无法从本地硬盘启动**、或硬盘无有效系统/引导。
- 安装过程会按 Krill/eggs 配置**对目标磁盘分区并写入系统**，请确认目标盘**无重要数据**或已备份。
- **装成功后的日常使用**：应**从硬盘启动**，**不要**每次再用 U 盘进 Live 重复执行安装，以免误覆盖数据。

**推荐步骤**

1. **插入 U 盘**，BIOS/UEFI 中选择**从该 U 盘**为第一启动项，进入 Live。
2. 打开终端，确认当前是「U 盘 Live」环境（存在安装介质标识）：
   ```bash
   ls /run/live/medium
   ```
   若该目录不存在，请排查是否真从本 ISO 刻录的 U 盘启动，或是否被其它启动方式（如 PXE、硬盘上的多启动）误导。

   **务必先分清「U 盘」和「要装系统的硬盘」**（否则易报「空间不足」）：

   - 从 U 盘启动时，**`/dev/sda` 经常是 U 盘本身**（常见 **8～32GiB**，与「我买了 16G U 盘」一致），**不是**你给虚拟机/物理机分配的那块 **40GiB+** 硬盘。
   - 真实目标盘多为 **`/dev/nvme0n1`**、**`/dev/sdb`**、**`/dev/sdc`** 等（以现场为准）。
   - 在终端执行（推荐）：
     ```bash
     lsblk -o NAME,SIZE,TYPE,MOUNTPOINT,MODEL
     ```
     找到 **`MOUNTPOINT` 含 `/run/live` 或挂载了 Live 的那一行** —— 对应整块盘即为 **安装介质（勿作为克隆目标）**；另一块容量更大、**未挂载根系统**的磁盘才是**应安装到的硬盘**。
   - 使用 **`sudo eggs krill`** 时，在磁盘选择界面**不要默认选 sda**，请选**容量与虚拟机/物理硬盘一致**的那块；无人值守若固定写死 `sda` 而 `sda` 是 U 盘，也会失败或空间不够。

3. **任选其一**执行（以目标机 `eggs --help` 为准；子命令随 eggs 版本可能略有差异）：
   - **与自动量产一致（无人值守 + 关机）**  
     ```bash
     sudo eggs install --unattended -n --halt
     ```
     完成后机器应**自动关机**；然后执行下方第 4 步。
   - **交互式安装（可选磁盘/分区）**  
     ```bash
     sudo eggs krill
     ```
     按屏幕提示选择目标磁盘并完成安装；完成后**关机**（若未自动关机，请确认 Krill 提示后再断电）。
4. **关机后**再拔掉 U 盘；BIOS 中将**本地硬盘**设为第一启动项，保存并重启，应从硬盘进入已克隆系统。

**装完仍无法从硬盘启动时（简要排查）**

- BIOS 中 **UEFI / Legacy（CSM）** 是否与安装时一致；部分机器需关闭 **Secure Boot** 试一次（视镜像与硬件而定）。
- 确认启动顺序为**系统盘**，且无其它设备误设为第一启动。
- 若可再次进入 Live，可查看 **`journalctl -b`** 中与 `eggs`/`krill` 相关的报错；UEFI 环境可辅助查看 **`sudo efibootmgr -v`**、**`lsblk`** 是否已有 EFI 分区与挂载点。

**安装器（Krill）里「找不到磁盘」，或终端里只有 U 盘、没有第二块盘**

先在 **Live 终端**确认系统内核是否能看到硬盘（与安装器用的是同一套设备）：

```bash
lsblk -o NAME,SIZE,TYPE,MOUNTPOINT
sudo fdisk -l
```

- **若 `lsblk` / `fdisk` 里也只有一块盘（U 盘）**：说明 **Linux 根本没识别到本地硬盘**，不是 Krill 单独的问题。请按环境排查：
  - **虚拟机**：关机后在设置里确认已**添加虚拟硬盘**（容量 ≥ 建议值）、控制器类型为 **SATA / SCSI / NVMe**（避免仅用未挂盘的空壳）；添加后**重新开机**再进 Live。VMware 可试 **「添加硬盘」→ 独立虚拟磁盘**；KVM/QEMU 确认 XML/界面里 **disk** 已挂到虚拟机。
  - **物理机**：进 BIOS/UEFI 看硬盘是否被**识别**、是否被 **禁用**；**SATA 模式**若为 **RAID / Intel RST** 而硬盘未组阵列，部分机器在 **AHCI** 下才能被标准 Linux 直接识别（改前请了解厂商说明与数据风险）。服务器 **硬件 RAID** 可能需在内核里加载对应驱动或先建逻辑盘。
  - **NVMe**：确认 BIOS 里 **NVMe / M.2** 未关闭；终端可看 **`dmesg | grep -i nvme`** 是否有报错。
- **若终端里能两块盘，但 Krill 列表为空或很少**：用 **`sudo eggs krill`**（勿漏 **`sudo`**）；仍异常时看 **`eggs krill`** / **`eggs --verbose`** 的终端输出，或 **`journalctl -b -u eggs*`**（若有相关单元）。少数环境需先 **`sudo modprobe`** 加载存储驱动（以硬件为准）。
- **若能看到磁盘但名称不是 `sda`**：在 Krill 里按 **设备名/容量** 选盘，不要只认 `sda` 字样。

---

## 五、克隆完成后的首次使用

1. **从硬盘启动**  
   确认已拔掉 U 盘，从本地硬盘启动，使用用户 `amyclaw` 及对应密码登录（见上文「默认账号」）。

2. **联网**  
   系统已配置为 DHCP，插网线或连接 WiFi 后应能自动获取 IP。

3. **访问管理终端**  
   在浏览器或本机访问管理后台（具体地址以实际部署为准，一般为本机 IP + 管理端口或配置的域名）。

4. **填写后台必要信息**  
   在管理界面中填写：
   - 飞书（FEISHU）相关配置/号码  
   - 大模型 API 密钥等  
   以及其他部署文档中要求填写的项。

5. **建议**  
   - 首次登录后修改 `amyclaw` 与 root 密码。  
   - 若需更改主机名、静态 IP 等，按运维规范在系统中修改即可。

---

## 六、技术说明（给运维/二次定制）

| 项目 | 说明 |
|------|------|
| **排除内容** | `/mnt` 下全部不打包（`amyclaw-exclude.list` 中 `mnt/*`）。**开发仓库路径不会进镜像**；运行文件在 **`/opt/amyclaw`**（由 **`deploy-to-opt.sh`** 在母机打入）。 |
| **OEM 网络修复（无 /mnt）** | **`/opt/amyclaw/oem/`**（随 deploy 复制）；克隆机可 **`sudo bash /opt/amyclaw/oem/apply-network-oem.sh`** 修复 resolv/DNS/netplan。 |
| **自动安装** | Live 下由 systemd 服务 `eggs-unattended-install.service` 执行（通常要求存在 **`/run/live/medium`**）。失败或未触发时见上文 **「四、4.1 手工安装」**。 |
| **安装器** | Krill（CLI），配置在 `/etc/penguins-eggs.d/krill.yaml`，与 `eggs.yaml` 用户/密码一致。 |
| **时区/键盘** | 当前为 **Asia/Hong_Kong（东八区）**、美式键盘；可在 `krill.yaml` 中修改后重新打包。 |
| **主机名** | 母机应设为 **amyclaw**（`mother-image-prepare-for-amyclaw-iso.sh`），ISO 文件名通常含该主机名。 |
| **DHCP / DNS** | DHCP 取 IP；DNS 优先 DHCP，无则 **FallbackDNS**；见 `网络-DHCP-说明.md`、`resolv-镜像说明.md`。 |
| **Gateway 局域网** | `/root/.openclaw/openclaw.json` 由 `scripts/seed-amyclaw-openclaw-state.sh` 写入：`bind=lan`、`controlUi.dangerouslyAllowHostHeaderOriginFallback=true`，便于 **192.168.0.0/16** 等私网用浏览器访问 `http://<IP>:18789`（安全依赖 Token + 内网边界）。 |

### 6.1 Krill：地区/时区、默认项与为何以 root 安装

**地区与时区是怎么定的？**

- 量产模板在 **`docs/penguins-eggs/krill-amyclaw.yaml`**（安装到系统后为 **`/etc/penguins-eggs.d/krill.yaml`**）里写死：
  - **`region: 'Asia'`**、**`zone: 'Hong_Kong'`** → 安装到硬盘后对应 **IANA 时区 `Asia/Hong_Kong`（UTC+8，东八区）**（与上文「时区/键盘」一致）。
- **`eggs install --unattended ...`（无人值守）**：按该文件 **直接应用**，**不再交互**选择地区/时区（除非 Krill/eggs 版本另有强制步骤，以现场为准）。
- **`sudo eggs krill`（交互式）**：若 Krill 向导仍出现「地区/时区」等页面，**由你在界面里选择**；未改前可能以 **当前 `krill.yaml` 中的项** 作为默认或预填。改母机模板后 **重新打 ISO** 可改默认。

**其它选项是否都是默认？**

- 同一模板里已约定：**语言** `en_US.UTF-8`、**键盘** `us`、**分区** `standard` / **ext4** / **swap small**、**网络 DHCP**、**用户与 root 密码**、**主机名 `amyclaw`** 等；**无人值守**即按此执行，无需逐项点选。
- **交互式 krill** 时若某一步与向导不一致，**以你在界面中确认的为准**（例如换盘、改分区方案）。

**安装程序为何「直接是 root」？**

- 你在 Live 里执行的是 **`sudo eggs krill`**：**`sudo`** 把进程提权为 **root**（Live 默认用户多为 `live`，具备 sudo）。
-  **`eggs install --unattended`** 由 **systemd 服务**触发，服务本身以 **root** 运行。
- 分区、格式化、挂载目标系统、安装引导器等 **必须**有 root 权限，这是操作系统安装器的常规要求，**不是**克隆后日常登录必须用 root。

---

## 七、常见问题

- **U 盘启动后没有自动安装**  
  先确认 **`/run/live/medium` 存在**（表示从可移动介质 Live 启动）。若仍无自动关机安装，按 **「四、4.1 手工安装」** 在终端执行 **`sudo eggs install --unattended -n --halt`**，或 **`sudo eggs krill`** 交互安装。

- **拔掉 U 盘后还能进「像 Live 一样的界面」，但硬盘起不来**  
  真机通常**不能**在无 U 盘、且硬盘未写入完整系统时反复进入同一张 ISO 的 Live；请确认是否仍有第二启动介质、PXE、或硬盘上的 ISO/多启动。若硬盘**未装完**，在 **U 盘插入** 下按 **「四、4.1 手工安装」** 完成安装并**关机后再拔 U 盘**。

- **手工安装提示空间不足，`sda` 只有约 16GiB，但我给磁盘分配了 40GiB 或更大**  
  1. **先确认 `sda` 是不是 U 盘**：从 U 盘 Live 启动时，**第一块盘 `sda` 往往是 U 盘**（容量常接近 8/16/32G），克隆镜像约 **3.xGiB**，解压/分区后 **16G U 盘很容易不够** —— 这与「虚拟机硬盘 40G」不是同一块设备。请用 **`lsblk -o NAME,SIZE,TYPE,MOUNTPOINT`** 看哪块盘挂载了 `/run/live`，**安装目标应选另一块**（如 **`nvme0n1`、`sdb`**），或用 **`sudo eggs krill`** 明确选对磁盘。  
  2. **若确认目标盘就是虚拟机/物理硬盘，但容量仍显示偏小**：在 VMware/KVM/Hyper-V 等里把虚拟磁盘**扩容**后，需在客户机内确认内核已看到新容量（`lsblk` 顶层 `SIZE` 是否已是 40G+）；若仍显示旧容量，关机后在虚拟机设置里检查是否**挂的是新磁盘**、或需**扩展磁盘**而非仅新建未使用分区。物理机若更换大硬盘，亦需在分区工具里**扩展分区**后再装。

- **安装器里找不到磁盘 / 列表里没有目标硬盘**  
  先别纠结 Krill 界面，在 Live 终端执行 **`lsblk`** 与 **`sudo fdisk -l`**：若这里也**只有 U 盘**，说明硬盘未被系统识别，见上文 **「四、4.1」** 小节 **「安装器里找不到磁盘…」**（虚拟机加盘、BIOS AHCI/NVMe、物理连线等）。若终端里**能看到**目标盘，再用 **`sudo eggs krill`** 按**设备名与容量**选择。

- **克隆后无法上网 / 无 DNS**  
  确认网线/WiFi 和路由器 DHCP 正常；检查 `resolvectl`、`/etc/resolv.conf` 是否为指向 `systemd-resolved` 的软链（见 `docs/penguins-eggs/resolv-镜像说明.md`）。

- **忘记 amyclaw 密码**  
  用 root（密码同 amyclaw）登录后执行 `passwd amyclaw` 修改。

- **需要更新镜像**  
  在母机按 **「二、母机再次打包」** 全流程执行（至少 **`deploy-to-opt.sh`** + 写入 **`/etc/amyclaw-release`** + **`eggs-produce-and-backup.sh`**；默认 **`AMYCLAW_IMAGE_VERSION=v2.0.3`**）。勿只跑 `eggs produce` 而跳过 deploy，否则 `/opt/amyclaw` 可能不是最新。用生成于 **`/mnt/backup/`** 的新 ISO 重新刻录 U 盘即可。

- **打包时报 xorriso 空间不足 / Image size exceeds free space**  
  **`/` 根分区**在打 ISO 过程中会同时占 **临时目录 + 最终 ISO**，建议空闲 **≥6GiB**；可先删旧 ISO、`rm -rf /var/tmp/eggs/*`、`apt-get clean`、`journalctl --vacuum-time=3d` 等。脚本会在 **`eggs produce` 前**检查 **≥约 6GiB**。

---

## 八、文档与脚本位置（母机）

- **打包脚本**：`/mnt/disk/amyclaw/scripts/eggs-produce-and-backup.sh`  
- **OEM 密码（root/amyclaw）**：`/mnt/disk/amyclaw/scripts/set-oem-system-passwords.sh`（已由 `mother-image-prepare-for-amyclaw-iso.sh` 调用）  
- **DNS 兜底**：`/mnt/disk/amyclaw/scripts/install-amyclaw-dns-fallback.sh`（写入 `resolved.conf.d`，见 `resolv-镜像说明.md`）  
- **eggs + Krill 凭证**：`/mnt/disk/amyclaw/scripts/apply-oem-penguins-eggs-credentials.sh`；Krill 模板：`docs/penguins-eggs/krill-amyclaw.yaml`  
- **本文档**：`/mnt/disk/amyclaw/docs/eggs-量产克隆与使用说明.md`  
- **ISO 备份目录**：`/mnt/backup/`（如 eggs 默认名 `amyclaw_amd64_*.iso`，及带版本副本 **`amyclaw_v2.0.3_amd64_*.iso`**）

以上 **除 OEM 外** 的路径均在 `/mnt` 下，**不会**被打进 ISO，仅母机或备份环境可用。

**克隆机（量产镜像内，由 `deploy-to-opt.sh` 写入）**

- **`/opt/amyclaw/oem/`**：网络修复脚本、**网关/飞书自检脚本**等（见该目录下 `README.txt`）。  
- **飞书/网关自检**：`sudo bash /opt/amyclaw/oem/diagnose-openclaw-gateway-feishu.sh`（与仓库 `scripts/diagnose-openclaw-gateway-feishu.sh` 同源，打 ISO 前须已执行 `deploy-to-opt.sh`）。

**姊妹篇（与 v2.0.3 配套；不替代本文）**

- **`AmyClaw-量产与运维-v2.0.3.md`**：量产/运维一页总览（**`AmyClaw-量产与运维-v2.0-release.md` 已迁移至此**）。  
- **`AmyClaw-用户安装后使用说明-v2.0.3.md`**：仅面向安装后的用户（**`AmyClaw-用户安装后使用说明-v2.0-release.md` 为跳转**）。  
- **`飞书-开放平台注册应用与机器人指南.md`**：飞书账号与应用/机器人注册流程。
