# 部署手册：GitHub + Vercel + Neon

这是一份可以直接照着操作的部署手册，记录把一个 Next.js + Postgres 项目部署到生产环境的完整步骤。这套组合（GitHub 管代码、Vercel 管运行、Neon 管数据库）对个人项目几乎是零运维、免费额度内能跑起来的标准搭配，以后做类似项目可以直接复用这份手册。

## 适用前提

- 项目是 Next.js（或其他 Vercel 原生支持的框架）
- 需要一个 Postgres 数据库
- 需要登录鉴权（本手册以 GitHub OAuth 为例）
- 代码已经在本地、用 git 管理

---

## 第一步：把代码推到 GitHub

### 1.1 在 GitHub 上创建一个新仓库

打开 https://github.com/new，填仓库名，**不要**勾选"Add a README"（本地已经有代码，勾了反而会冲突），创建后会得到一个仓库地址，形如：
```
https://github.com/<你的用户名>/<仓库名>.git
```

### 1.2 检查 `.gitignore`，确保不会把不该传的东西传上去

至少要排除：

```gitignore
/node_modules
/.next/
.env*
!.env.example
.vercel
```

**特别注意**：如果你用的是 AI 编程工具（比如 Claude Code），它本地的会话记录目录（如 `.omc/`）也要加进 `.gitignore`——这些记录可能包含你在对话里贴过的密钥，一旦提交进仓库就永久留在 git 历史里了。

### 1.3 关联远程仓库并推送

```bash
git remote add origin https://github.com/<你的用户名>/<仓库名>.git
git add -A
git commit -m "Initial commit"
git push origin main
```

### 1.4 关于推送时的身份验证

GitHub 早就不支持用账号密码做 git 操作认证了，push 时需要用 **Personal Access Token (PAT)** 代替密码：

1. 打开 https://github.com/settings/tokens → "Generate new token" → "Generate new token (classic)"
2. 勾选 `repo` 权限范围
3. 生成后立刻复制保存（只显示一次）
4. `git push` 询问用户名密码时：用户名填你的 GitHub 用户名，密码填这个 token

> ⚠️ **安全提醒**：这个 token 拥有你账号的仓库读写权限，不要分享给任何人或粘贴到不信任的地方。如果不小心在聊天工具、日志里暴露过，操作完成后应该去 https://github.com/settings/tokens 重新生成一个换掉。

---

## 第二步：用 Neon 创建生产数据库

### 2.1 注册并创建项目

打开 https://neon.tech 注册（可以用 GitHub 账号直接登录），创建一个新项目，选择一个就近的区域。

### 2.2 获取连接字符串

项目首页或 "Connect" 按钮里能看到连接字符串，格式类似：

```
postgresql://<user>:<password>@<host>.neon.tech/<dbname>?sslmode=require
```

把这串完整复制下来，后面要用。

### 2.3 跑数据库迁移，把表结构同步到 Neon

如果项目用 Drizzle ORM（本项目用的就是这个），步骤是：

```bash
# 临时把本地 .env 里的 DATABASE_URL 改成 Neon 的连接字符串
# 跑完迁移后再改回本地开发用的数据库地址
npx drizzle-kit migrate
```

跑完之后可以验证一下表有没有建好：

```bash
node --env-file=.env node_modules/.bin/tsx -e "
import('./src/db/index.ts').then(async ({db}) => {
  const r = await db.execute('select table_name from information_schema.tables where table_schema = \\'public\\'');
  console.log(r.map(x => x.table_name));
  process.exit(0);
});"
```

> 💡 用其他 ORM（Prisma、TypeORM 等）思路一样：把 `DATABASE_URL` 临时指向 Neon，跑一次该 ORM 的迁移命令即可。

---

## 第三步：注册 GitHub OAuth App（如果项目需要 GitHub 登录）

### 3.1 找对入口——容易走错的一步

GitHub 有两种"App"，长得像但用途完全不同：

| | OAuth App ✅ 我们要这个 | GitHub App ❌ 不是这个 |
|---|---|---|
| 创建地址 | `https://github.com/settings/applications/new` | `https://github.com/settings/apps/new` |
| 配置字段 | 只有 Homepage URL + Callback URL | 还有 Webhook URL、权限范围等一堆配置 |
| 用途 | 给用户登录用（Auth.js / NextAuth 用的就是这个） | 给机器人/集成工具用 |

去 https://github.com/settings/developers，点顶部的 **"OAuth Apps"** 标签（不是 "GitHub Apps"），再点 **"New OAuth App"**。

### 3.2 填写信息

| 字段 | 填什么 |
|---|---|
| Application name | 随便取，比如项目名 |
| Homepage URL | 你的网站域名（部署后 Vercel 会给一个，比如 `https://your-project.vercel.app`） |
| Authorization callback URL | 域名 + `/api/auth/callback/github`，比如 `https://your-project.vercel.app/api/auth/callback/github` |

> 💡 如果还没部署、不知道域名，可以先随便填一个占位（比如临时填 `http://localhost:3000` 的两个字段），等 Vercel 部署后拿到真实域名再回来编辑修改。

### 3.3 拿到凭证

点 "Register application" 后，页面上会显示 **Client ID**；再点 **"Generate a new client secret"** 拿到 **Client Secret**（只显示一次，立刻复制）。

> ⚠️ **安全提醒**：Client Secret 是敏感凭证。如果需要用某个工具帮你配置环境变量，优先选择"自己在终端里输入"而不是把明文贴给工具/聊天框——很多 AI 编程工具会因为安全策略主动拒绝处理明文贴出来的密钥，这是合理的保护机制，不要尝试绕过。

---

## 第四步：部署到 Vercel

### 4.1 导入项目

打开 https://vercel.com/dashboard → **"Add New" → "Project"**，选择从 GitHub 导入，找到刚才推送的仓库。

### 4.2 ⚠️ 关键检查项：Framework Preset 必须正确识别

导入页面会显示自动识别出的框架类型。**这一步极其重要**——如果识别错了（比如把 Next.js 项目识别成 "Other"），Vercel 会把项目当成纯静态站点处理，只发布 `public/` 静态资源目录，导致整个网站的所有页面都返回 `404: NOT_FOUND`，而构建日志却显示"成功"，非常容易误判成代码问题。

确认（或手动选择）：
```
Framework Preset: Next.js
```

如果是部署后才发现这个问题，去 **项目 → Settings → General → Framework Preset** 手动改成 Next.js，改完需要重新部署一次才生效。

### 4.3 配置环境变量——先填好，再点 Deploy

在导入页面的 "Environment Variables" 区域（或部署后去 **Settings → Environment Variables**）填好所有必需的变量。以本项目为例：

| Key | 值来源 |
|---|---|
| `DATABASE_URL` | 第二步拿到的 Neon 连接字符串 |
| `AUTH_GITHUB_ID` | 第三步拿到的 Client ID |
| `AUTH_GITHUB_SECRET` | 第三步拿到的 Client Secret |
| `AUTH_SECRET` | 生产环境专用的随机字符串，用 `openssl rand -base64 33` 生成，**不要跟本地开发用同一个** |
| `OWNER_GITHUB_USERNAME` | 你自己的 GitHub 用户名（用于识别管理员角色，按项目实际需求设置） |

> 💡 **每个项目需要的环境变量不同**，去项目的 `.env.example` 文件里看完整清单，照着填。

### 4.4 点击 Deploy

等构建完成，Vercel 会给一个默认域名，形如：
```
https://<项目名>.vercel.app
```

### 4.5 如果是部署后才补充环境变量

**Vercel 的环境变量改动不会自动应用到已经部署的版本**——这是最容易被忽略的一点。保存新变量后，必须手动重新部署一次：

进入 **Deployments** 标签 → 找最新一次部署 → 点右边 `...` 菜单 → **Redeploy**。

或者用命令行（需要先 `npm install -g vercel` 并 `vercel login`，登录走浏览器授权，不需要输入密码给任何工具）：

```bash
vercel link --yes --project <项目名>
vercel deploy --prod
```

---

## 第五步：把 GitHub OAuth App 的回调地址改成正式域名

回到第三步注册的 OAuth App 设置页，把 Homepage URL 和 Authorization callback URL 从占位地址改成 Vercel 给的真实域名：

```
Homepage URL: https://<项目名>.vercel.app
Authorization callback URL: https://<项目名>.vercel.app/api/auth/callback/github
```

回调地址必须跟实际访问的域名**完全一致**，否则登录会报 `redirect_uri_mismatch` 错误。

---

## 第六步：验证 GitHub → Vercel 的自动部署链路

正常情况下，Vercel 导入项目时会自动建立和 GitHub 仓库的 Git 集成——以后每次 `git push` 到主分支，都会自动触发一次新的部署，不需要再手动跑 `vercel deploy`。

验证方法：随便改一个文件（比如加一行注释），commit + push，然后去 Vercel 的 **Deployments** 标签看是否在几十秒内出现一条新的、状态为 "Building" 的部署记录。

---

## 第七步：上线验收清单

部署完成后，逐项确认（不要只看"页面能打开"就算完成）：

- [ ] 首页能正常访问（不是 404）
- [ ] 如果有登录功能：登录流程能走完，不报 `redirect_uri_mismatch` 之类的错
- [ ] 登录后角色/权限识别正确（比如管理员能看到管理入口，普通用户看不到）
- [ ] 未登录状态下，应该公开的内容能看到，应该私密的内容看不到
- [ ] 改了环境变量之后有没有重新部署生效
- [ ] 检查 `.gitignore`/`.vercelignore`，确认本地的 `.env` 文件没有被打包进任何部署或提交记录里

---

## 常见坑位速查表

| 现象 | 原因 | 解决 |
|---|---|---|
| 首页 404，但构建日志显示成功 | Framework Preset 识别错误，被当成静态站点 | Settings → General → Framework Preset 改成对应框架，重新部署 |
| 改了环境变量但行为没变 | Vercel 环境变量不会自动应用到已部署版本 | 手动 Redeploy 一次 |
| 登录报 `redirect_uri_mismatch` | OAuth App 的回调地址跟实际域名不一致 | 去 OAuth App 设置里改成跟 Vercel 域名完全匹配的地址（含协议、不含末尾斜杠差异） |
| GitHub OAuth App 注册页面有一堆 Webhook 配置，跟预期不一样 | 进错了页面，创建的是 GitHub App 不是 OAuth App | 检查地址栏是不是 `/settings/applications/new`，不是 `/settings/apps/new` |
| `git push` 提示 "could not read Username"，没法输入密码 | 在没有真实终端（TTY）的环境里执行，比如某些 AI 工具的命令执行通道 | 打开真正的终端 App（Terminal/iTerm），在里面手动执行 push |
| 担心免费额度不够用 | 个人/低流量项目通常不用担心 | Vercel Hobby、Neon 免费档、GitHub 免费账号对个人博客级别流量都绰绰有余，但具体额度以官网最新政策为准 |

---

## 凭证安全的几条铁律（贯穿整个部署过程）

1. **密钥不要直接写进会被保存下来的地方**：命令行参数（会进历史记录）、`/tmp` 等任何人可读目录、AI 工具的会话日志。
2. **涉及密钥输入的操作，优先自己在终端里手动完成**，而不是交给工具去处理明文密钥——这不是工具能力不够，而是降低密钥被意外记录/泄露的环节数量。
3. **一旦密钥在聊天记录、截图、日志里出现过明文，事后重新生成换掉**，不要心存"反正没被滥用就没事"的想法。
4. **AI 编程工具的会话记录目录要进 `.gitignore`**（比如 `.omc/`、`.claude/` 下的某些状态文件），避免聊天中出现的密钥被连带提交进仓库历史。
