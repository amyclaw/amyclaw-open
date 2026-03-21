# OpenClaw 与管理页开机自启

本目录提供 systemd 单元，用于在开机时自动启动 **OpenClaw Gateway** 与 **OpenClaw 管理设置页**。

## 单元文件

| 文件 | 说明 |
|------|------|
| `openclaw-gateway.service` | 位于 `openclaw/scripts/systemd/`，启动 Gateway（端口 18789） |
| `openclaw-management.service` | 本目录，启动管理页（端口 8080） |

## 安装步骤

1. **修改路径（若需要）**  
   单元内 `WorkingDirectory` 默认为 `/mnt/disk/amyclaw/...`。若你的仓库不在该路径，请先修改两个单元中的路径，或安装后用 override 覆盖：

   ```bash
   # 编辑单元中的 WorkingDirectory，或安装后：
   sudo systemctl edit openclaw-gateway.service
   # 在 [Service] 下添加：
   # WorkingDirectory=/你的路径/openclaw
   ```

2. **复制单元到 systemd 目录**

   ```bash
   REPO=/mnt/disk/amyclaw   # 改为你的仓库根路径

   sudo cp "$REPO/openclaw/scripts/systemd/openclaw-gateway.service" /etc/systemd/system/
   sudo cp "$REPO/openclaw-management/scripts/systemd/openclaw-management.service" /etc/systemd/system/
   ```

3. **若以非 root 用户运行**（推荐）  
   在单元中指定用户，使状态目录使用该用户的 `~/.openclaw`：

   ```bash
   sudo systemctl edit openclaw-gateway.service
   # 添加：
   # [Service]
   # User=你的用户名
   # Group=你的用户名

   sudo systemctl edit openclaw-management.service
   # 同上
   ```

4. **重载并启用开机自启**

   ```bash
   sudo systemctl daemon-reload
   sudo systemctl enable openclaw-gateway.service openclaw-management.service
   sudo systemctl start openclaw-gateway.service openclaw-management.service
   ```

5. **查看状态**

   ```bash
   sudo systemctl status openclaw-gateway.service openclaw-management.service
   ```

## 常用命令

```bash
# 查看日志
sudo journalctl -u openclaw-gateway.service -f
sudo journalctl -u openclaw-management.service -f

# 停止 / 启动 / 重启
sudo systemctl stop openclaw-gateway.service openclaw-management.service
sudo systemctl start openclaw-gateway.service openclaw-management.service
sudo systemctl restart openclaw-gateway.service openclaw-management.service

# 取消开机自启
sudo systemctl disable openclaw-gateway.service openclaw-management.service
```

## 使用统一状态目录（可选）

若希望 Gateway 与管理页使用同一目录（如 `/var/lib/openclaw`），在两个单元中设置：

```ini
[Service]
Environment=OPENCLAW_STATE_DIR=/var/lib/openclaw
```

并确保该目录存在且运行用户有读写权限。
