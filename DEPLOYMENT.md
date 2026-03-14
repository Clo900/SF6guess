# 亚历克斯杯 (SF6 竞猜) 部署指南

本项目包含前端（React + Vite）和后端数据库（Supabase）。要将项目上线供玩家使用，你需要分别部署这两个部分。

## 第一部分：后端数据库部署 (Supabase)

当前项目已经连接到了一个由系统自动配置的 Supabase 项目，但为了生产环境的安全和管理，建议你将其部署到你自己的 Supabase 账号下。

### 1. 注册并创建 Supabase 项目
1. 前往 [Supabase 官网](https://supabase.com/) 注册并登录。
2. 点击 "New Project" 创建一个新项目。
3. 填写项目名称（如 `sf6-guess`），设置数据库密码，选择一个离你目标用户较近的服务器区域（如 `Singapore` 或 `Tokyo`）。
4. 等待几分钟，直到项目创建完成。

### 2. 获取 API 密钥
1. 在你的 Supabase 项目面板中，点击左侧菜单底部的齿轮图标 (Project Settings)。
2. 选择 "API"。
3. 复制 **Project URL**。
4. 复制 **Project API keys** 下的 **anon** `public` 密钥。

### 3. 配置本地环境变量
1. 在项目根目录下找到 `.env` 文件。
2. 将刚才复制的值替换到文件中：
   ```env
   VITE_SUPABASE_URL=你的_Project_URL
   VITE_SUPABASE_ANON_KEY=你的_anon_public_key
   ```

### 4. 迁移数据库表结构和初始数据
由于本项目包含了 SQL 迁移文件和种子数据，你可以直接在 Supabase 控制台执行它们：

1. 打开你的 Supabase 项目控制台，点击左侧的 "SQL Editor"。
2. 点击 "New query"。
3. 打开本地项目中的 `supabase/migrations` 文件夹。
4. **按文件名的时间顺序**（从旧到新），依次将每个 `.sql` 文件的内容复制到 SQL Editor 中并点击 "Run" 运行。
   - 例如：先运行 `20240315000000_initial_schema.sql`，再运行后续的修改脚本如 `20240315000004_add_nickname.sql`。
5. 运行完所有 migration 后，打开 `supabase/seed.sql`，复制其内容到 SQL Editor 中并运行，以填充初始的选手和对阵数据。

---

## 第二部分：前端部署

你可以选择 **Vercel** 或 **Netlify** 进行部署。如果 Vercel 注册失败，推荐使用 **Netlify**。

### 选项 A：使用 Netlify 部署 (推荐替代方案)

Netlify 同样提供免费且强大的前端托管服务，注册相对容易。

**1. 准备代码仓库**
确保你的代码已经推送到 GitHub、GitLab 或 Bitbucket。
如果你还没有初始化 Git：
```bash
git init
git add .
git commit -m "Initial commit"
# 然后关联并推送到你的 GitHub 仓库
```
*注意：为了适配 Netlify 的路由，我已经在 `public` 目录下为你创建了 `_redirects` 文件。*

**2. 在 Netlify 上部署**
1. 前往 [Netlify 官网](https://www.netlify.com/) 注册并登录（可以直接使用 GitHub 账号）。
2. 在 Dashboard 页面，点击 **"Add new site"** -> **"Import an existing project"**。
3. 选择 **GitHub** 并授权 Netlify 访问你的仓库。
4. 选择你的 `sf6-guess` 仓库。
5. 在 **"Build settings"** 中：
   - **Base directory**: 留空
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
6. 点击 **"Show advanced"** -> **"New variable"** 添加环境变量（最关键的一步）：
   - Key: `VITE_SUPABASE_URL` | Value: `你的_Project_URL`
   - Key: `VITE_SUPABASE_ANON_KEY` | Value: `你的_anon_public_key`
7. 点击 **"Deploy sf6-guess"**。

**3. 等待部署完成**
Netlify 会自动构建项目。构建完成后，你会获得一个 `xxx.netlify.app` 的域名。点击即可访问。

---

### 选项 B：使用 Vercel 部署

Vercel 是部署 Vite/React 前端应用最简单、免费且速度最快的平台。

**1. 在 Vercel 上部署**
1. 前往 [Vercel 官网](https://vercel.com/) 注册并登录（建议使用 GitHub 账号登录）。
2. 点击 "Add New..." -> "Project"。
3. 找到你刚才推送的 GitHub 仓库，点击 "Import"。
4. 在 "Configure Project" 页面：
   - **Framework Preset**: Vercel 通常会自动识别为 `Vite`，如果没识别，请手动选择 `Vite`。
   - **Environment Variables**: 这是**最重要**的一步！展开环境变量设置，添加你在上面获取的两个 Supabase 变量：
     - Name: `VITE_SUPABASE_URL` | Value: `你的_Project_URL`
     - Name: `VITE_SUPABASE_ANON_KEY` | Value: `你的_anon_public_key`
5. 点击 "Deploy"。

**2. 等待部署完成**
Vercel 会自动构建你的应用（运行 `npm run build`）。大约 1-2 分钟后，部署完成，Vercel 会为你提供一个免费的域名（类似 `xxx.vercel.app`）。
你可以直接点击该链接访问你的在线竞猜网站。

---

## 后期数据管理与维护

网站上线后，比赛会实际进行，你需要更新后台数据以反映真实的比赛结果：

### 如何更新比赛胜负和比分？
1. 登录你的 Supabase 控制台。
2. 点击左侧的 "Table Editor"（表格编辑器）。
3. 选择 `matches` 表。
4. 找到正在进行的比赛行（你可以通过 `team1_id` 和 `team2_id` 确认是哪一场）。
5. 双击 `score` 列，填入实际比分（例如：`2:1`）。
6. 双击 `winner_id` 列，填入获胜队伍的 ID（你需要先去 `teams` 表里复制获胜选手的 ID）。
7. **注意**：由于前端设置了严格的晋级逻辑，当你填写了某个比赛的 `winner_id` 时，如果有后续阶段的比赛，你需要手动将这个胜者的 ID 填入下一轮对应比赛的 `team1_id` 或 `team2_id` 中。

### 如何查看用户预测情况？
在 Table Editor 中查看 `predictions` 表，这里记录了所有用户的预测数据。排行榜会自动根据 `matches` 表中的实际结果和 `predictions` 表中的用户预测进行积分计算。