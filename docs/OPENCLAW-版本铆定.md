# OpenClaw 版本铆定（AmyClaw 开发基线）

AmyClaw 量产与定制基于**固定**的 OpenClaw 源码与构建产物；本仓库将二者一并纳入 Git，便于与 Bitbucket **`amyclaw-u22-local`** 对齐、可复现部署。

---

## 1. 上游 OpenClaw 信息（铆定快照）

| 项 | 值 |
|----|-----|
| **npm / package 版本** | `openclaw/package.json` → **`version`**（当前文档生成时多为 **`2026.3.14`**，以仓库内文件为准） |
| **上游 Git 仓库** | `https://github.com/openclaw/openclaw.git` |
| **上游提交（本地曾克隆元数据）** | 见 `openclaw/.git.bak-openclaw-upstream` 中 **`HEAD`**（示例：`ec1b80809df2b717c321c4bc504ecfc4254e7a96` — *refactor: remove remaining extension core imports*） |

> 说明：首次将 OpenClaw 并入 monorepo 时，已将原 **`openclaw/.git`** 备份为 **`openclaw/.git.bak-openclaw-upstream`**，以便查阅上游 **commit**。合并/升级上游时请先对照本表与 `package.json`。

---

## 2. 仓库内包含内容

| 内容 | 说明 |
|------|------|
| **`openclaw/` 源码** | 已跟踪（不含 `node_modules`） |
| **`openclaw/dist/`** | **构建产物**；OpenClaw 默认在 `.gitignore` 中忽略，本仓库用 **`git add -f`** 纳入以铆定与 **`deploy-to-opt`** 一致 |

克隆本仓库后，**无需**在量产机上执行 `pnpm build` 亦可运行 **`node dist/...`**（与母机 `deploy-to-opt.sh` 同步 `dist` 的行为一致）。若你修改了 OpenClaw 源码，请在 `openclaw/` 下执行 **`pnpm build`** 后重新 **`git add -f openclaw/dist`** 并提交。

---

## 3. 升级 OpenClaw 时的建议流程

1. 在 `openclaw/` 内拉取/合并上游或替换版本。  
2. `pnpm install` → `pnpm build`。  
3. 更新本文件中的版本号与（若可获取）上游 **commit**。  
4. `git add -f openclaw/dist` + 源码变更，提交说明中写明 **OpenClaw 版本/commit**。  

---

## 4. 与 `docs/GIT-仓库说明.md` 的关系

- **`openclaw/.git.bak-openclaw-upstream`**：保留上游 **Git 历史引用**，与本「铆定」说明互补。  

---

*文档随 AmyClaw 仓库维护；版本号以 `openclaw/package.json` 为准。*
