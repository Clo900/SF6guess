# 部署指南 (Deployment Guide) - Netlify

本指南将帮助您将 SF6 竞猜项目部署到 **Netlify**。

## 项目结构确认
您的 GitHub 仓库 (`SF6guess`) 根目录就是项目目录（包含 `package.json`），因此 Netlify 的配置非常简单。

## 部署步骤

### 1. 登录 Netlify
访问 [Netlify](https://www.netlify.com/) 并使用您的 **GitHub 账号** 登录。

### 2. 导入项目 (Import from Git)
1.  在 Netlify 控制台概览页面，点击 **"Add new site"** -> **"Import an existing project"**。
2.  选择 **GitHub** 作为 Git 提供商。
3.  授权 Netlify 访问您的 GitHub 仓库。
4.  在仓库列表中搜索并选择您的仓库：`Clo900/SF6guess`。

### 3. 配置构建设置 (Build Settings)
Netlify 通常会自动检测这些设置。请确保如下配置（如果不是，请手动修改）：

*   **Base directory**: (保持为空，或者填 `/`)
*   **Build command**: `npm run build`
*   **Publish directory**: `dist`

### 4. 配置环境变量 (关键步骤！)
为了连接到 Supabase 数据库，您必须配置环境变量。

1.  在点击 "Deploy" 之前（或者在部署详情页的 "Site configuration" -> "Environment variables" 中）。
2.  点击 **"Add variable"**。
3.  添加以下两个变量（复制您之前获取的 Supabase 真实信息）：

| Key (键) | Value (值) |
| :--- | :--- |
| `VITE_SUPABASE_URL` | `https://oemgwfeujpznempmjvoh.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9lbWd3ZmV1anB6bmVtcG1qdm9oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0OTk2MDgsImV4cCI6MjA4OTA3NTYwOH0.EivSg9hwWlBp6__CvoDN1WeygGIZZjEBkqSu_VzoMRg` |

### 5. 部署 (Deploy)
点击 **"Deploy sf6-guess-cup"**。
等待几分钟，Netlify 会自动下载依赖并构建项目。

构建成功后，您会看到一个绿色的 "Published" 状态，点击上方的 URL (例如 `https://elaborate-pudding-123456.netlify.app`) 即可访问您的网站。

---

## 常见问题

### 页面刷新后 404？
我们已经为您在 `public/_redirects` 文件中配置了重定向规则，因此在 Netlify 上刷新页面应该也能正常工作。

### 数据不显示？
如果网站能打开但没有显示比赛数据：
1.  检查 **环境变量** 是否填写正确（Key 和 Value 是否有多余空格）。
2.  如果在部署后才添加的环境变量，需要去 **"Deploys"** 选项卡，点击最新的部署记录，然后选择 **"Trigger deploy"** -> **"Clear cache and deploy"** 来重新构建生效。
