# 镜像中 DNS / `/etc/resolv.conf` 说明

## 为何「必须手工 `ln` 软链」才通？根因

1. **镜像/首启时 `/etc/resolv.conf` 不是指向 stub 的软链**  
   例如：被打成**普通文件**、指向错误、或软链在打包时为**断链**未正确进入 squashfs。

2. **开机过程中被其它组件改回「普通文件」**（最常见）  
   - **cloud-init** 网络阶段可能写入 `resolv.conf`  
   - **NetworkManager**（若启用）的 `rc-manager` 可能替换为文件  
   - 旧版 **resolvconf**、某些 **netplan** 后处理  

   此时 **`systemd-resolved` 的 127.0.0.53 stub 仍可用**，但应用读的是**错误**的 `/etc/resolv.conf`，就会表现为「域名不通」。

3. **手工 `ln -sf …/stub-resolv.conf`** 只是把解析**指回** resolved，**立刻**生效；**若不处理覆盖源**，**下次重启**仍可能再坏。

**量产侧**：除打 ISO 前 `ensure-resolv-conf-symlink.sh` 外，已增加 **`amyclaw-fix-resolv.service`**（`install-amyclaw-resolv-boot-fix.sh`），在 **`network-online` 之后**再执行一次 `ln -sf`，减轻被 cloud-init/NM 覆盖的问题。**新打的镜像**需包含该 unit。

---

## 现象 A：能 `ping 8.8.8.8`，但 `ping` 域名不通

说明 **IP 层与路由正常**，问题在 **DNS 解析**（或 **UDP/53 被防火墙拦截**，见下文）。

### 原因（常见）

1. **DHCP 未下发 DNS**，仅 **FallbackDNS** 在部分 **systemd-resolved** 版本/状态下**仍不生效**。  
2. **netplan 仅 `dhcp4: true`** 且无 **静态 `nameservers`** 时，若 DHCP 无 DNS，**networkd** 可能长时间无可用上游。  
3. **`/etc/resolv.conf`** 未指向 **stub**（127.0.0.53），应用直接读不到解析器。

### 量产侧配置（当前策略）

| 项 | 说明 |
|----|------|
| **netplan** | `dhcp4: true` + **`nameservers.addresses`**（与 DHCP 下发的 DNS **合并**），保证总有公网 DNS 可用。 |
| **resolved.conf.d** | **`DNS=`** 全局列表（与 netplan 一致），不**仅**依赖 FallbackDNS。 |
| **ensure-resolv-conf-symlink.sh** | `/etc/resolv.conf` → `stub-resolv.conf`。 |
| **install-amyclaw-dns-fallback.sh** | 安装上述 drop-in 并重启 **systemd-resolved**。 |

打 ISO 前务必跑通 **`mother-image-prepare`** + **`eggs-produce`**（脚本内会同步 netplan / resolv / drop-in）。

### 现象 B：防火墙只放行 ICMP，拦截 UDP/53

此时 **`ping 8.8.8.8` 通**，但 **`dig @8.8.8.8 www.baidu.com`** 也可能失败。  
请在故障机执行：

```bash
dig +time=2 @223.5.5.5 www.baidu.com
nc -vzu 223.5.5.5 53
```

若 **53 不通**，需在路由器/防火墙上放行 **出站 DNS**，或改用内网 DNS，**不是**镜像模板能单独解决的。

## 克隆机仍异常时排查

```bash
resolvectl status
resolvectl dns
ls -la /etc/resolv.conf
ping -c1 223.5.5.5
dig +short @127.0.0.53 www.baidu.com
```

刷新缓存：`sudo resolvectl flush-caches`。

## 手动应急（已装机、未换新 ISO）

**克隆机上没有 `/mnt/disk/amyclaw`**（该路径不会进 ISO）。若母机已 **`deploy-to-opt.sh`** 并重新打 ISO，请用：

```bash
sudo bash /opt/amyclaw/oem/apply-network-oem.sh
```

（若母机未 deploy 或未含 `oem/`，旧镜像可能没有该目录，需换新 ISO 或从母机拷贝 `oem/`。）

若仍能从开发机访问仓库路径，也可：

```bash
sudo cp /mnt/disk/amyclaw/docs/penguins-eggs/netplan-50-dhcp.yaml /etc/netplan/50-cloud-init.yaml
sudo chmod 600 /etc/netplan/50-cloud-init.yaml
sudo netplan apply
sudo bash /mnt/disk/amyclaw/scripts/install-amyclaw-dns-fallback.sh
```

## 打包时不要排除

- 勿在 eggs **exclude.list** 中排除 `etc/resolv.conf`、`etc/netplan/*.yaml`、`etc/systemd/resolved.conf.d/`。
