# 网络：DHCP 自动获取 IP 与 DNS（量产镜像）

## 目标

- **母机**与**克隆后的设备**均以 **DHCP** 自动获取 IPv4 地址；**DNS** 为 **DHCP 与 netplan 静态列表合并**（`netplan-50-dhcp.yaml` 中 `nameservers.addresses`），并由 **`resolved.conf.d` 的 `DNS=`** 加强，避免仅有 FallbackDNS 仍无法解析。详见 **`resolv-镜像说明.md`**。
- 镜像中不包含固定静态 IP（除非运维另行覆盖）。
- **`/etc/resolv.conf`**：打 ISO 前执行 `ensure-resolv-conf-symlink.sh`；**DNS 兜底**执行 `install-amyclaw-dns-fallback.sh`。

## 母机（打 ISO 前）

1. 在图形界面或 NetworkManager 中将有线/无线连接设为 **自动 (DHCP)**。
2. 或在使用 **netplan** 的系统上，使用仓库模板 **`docs/penguins-eggs/netplan-50-dhcp.yaml`**（`match: en*` + `dhcp4: true`，DNS 随 DHCP；勿提交含静态 IPv4 `addresses:` 的镜像，除非有意固定 IP）。
3. 运行检查脚本（只读、不断网）：
   ```bash
   sudo bash /mnt/disk/amyclaw/scripts/ensure-network-dhcp-default.sh
   ```
   确认输出中 **ipv4.method** 为 **auto**，或 netplan 中为 **dhcp4: true**。
4. 强制写入 DHCP 并自检（打 ISO 前推荐）：
   ```bash
   sudo bash /mnt/disk/amyclaw/scripts/apply-netplan-dhcp-oem.sh
   bash /mnt/disk/amyclaw/scripts/verify-amyclaw-network.sh
   ```
   若 SSH 使用静态 IP，可 `APPLY_NETPLAN=0` 仅写文件，再在控制台 `netplan apply`。

## 克隆安装（Krill / eggs）

- Penguins' Eggs 的 **Krill** 无人值守安装通常将目标机配置为 **DHCP**（与当前 eggs 版本默认一致）。
- 请在母机查看实际文件确认：
  ```bash
  sudo grep -E 'dhcp|network|ip' /etc/penguins-eggs.d/krill.yaml 2>/dev/null || true
  ```
  若本机构建版本使用不同键名，以官方文档为准；原则是**安装后首启以 DHCP 获取地址**。

## 克隆后首次开机

- 插网线或连接 WiFi 后，设备应从路由器获得 **192.168.x.x** 等地址（常见即用户所述 **192.168.0.0/16** 网段）。
- DNS 由 **DHCP 下发**，经 **systemd-resolved** 使用（见 `resolv-镜像说明.md`）。

## 与 Gateway 18789 的关系

- 设备获得局域网 IP 后，浏览器访问 `http://<该IP>:18789` 即可打开网关管理界面（需 Token；见量产种子脚本说明）。
- 私网访问依赖 **gateway.bind=lan** 与 **controlUi** 相关配置（已由 `seed-amyclaw-openclaw-state.sh` 写入）。
