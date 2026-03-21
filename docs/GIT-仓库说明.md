# Git 仓库说明（amyclaw-u22-local）

## 首次推送时 `openclaw/.git` 的处理

为把 **`openclaw/`** 源码一并纳入**顶层单仓库**（monorepo），首次 `git init` 前已将原 OpenClaw 上游仓库元数据备份为：

- `openclaw/.git.bak-openclaw-upstream`

若需恢复为**独立 OpenClaw 仓库**（保留原 `git log` / 远程）：

```bash
cd /path/to/amyclaw/openclaw
rm -rf .git 2>/dev/null
mv .git.bak-openclaw-upstream .git
```

若长期以 monorepo 维护，可删除备份目录（确认不再需要上游历史后再删）。

## 远程

- **Bitbucket**：`https://bitbucket.org/amygo-agents/amyclaw-u22-local.git`
- 默认分支：**`main`**

## 后续 push

请使用 **App 密码 / 令牌** 或 **SSH 密钥**，勿将令牌写入远程 URL；可配置：

```bash
git config credential.helper store
# 或 Bitbucket 推荐的 SSH
```

---

*文档随仓库维护。*
