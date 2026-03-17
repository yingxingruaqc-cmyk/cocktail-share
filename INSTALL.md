# 安装和配置指南

本指南将帮助你在本地运行 Cocktails App，并连接到你自己的 Supabase 项目。

## 1. 环境要求

- Node.js >= 18.0.0
- npm 或 yarn 或 pnpm
- 一个 Supabase 账户（免费）

## 2. 安装依赖

首先克隆或下载项目，然后在项目根目录运行：

```bash
npm install
```

或者使用 yarn：

```bash
yarn install
```

## 3. 配置 Supabase 项目

### 3.1 创建 Supabase 项目

1. 访问 [supabase.com](https://supabase.com) 并注册/登录
2. 点击 "New Project" 创建新项目
3. 填写项目信息：
   - Name: `Cocktails App`（或你喜欢的名字）
   - Database Password: 设置一个安全的密码（请保存好）
   - Region: 选择离你最近的区域
4. 点击 "Create new project"，等待项目创建完成（约2分钟）

### 3.2 获取 Supabase 配置

项目创建完成后：

1. 进入项目 Dashboard
2. 点击左侧菜单的 "Settings" -> "API"
3. 复制以下信息：
   - `Project URL` (类似 `https://xxxxx.supabase.co`)
   - `anon public` (以 `eyJhbGciOi...` 开头的长字符串)

### 3.3 配置环境变量

在项目根目录：

```bash
# 复制环境变量模板
cp .env.example .env
```

编辑 `.env` 文件，填入你的 Supabase 配置：

```env
VITE_SUPABASE_URL=https://你的-project-url.supabase.co
VITE_SUPABASE_ANON_KEY=你的anon-public-key
```

### 3.4 创建数据库表

1. 在 Supabase Dashboard 中，点击左侧菜单的 "SQL Editor"
2. 点击 "New Query"
3. 打开项目中的 `supabase/schema.sql` 文件
4. 复制全部内容并粘贴到 SQL Editor 中
5. 点击 "Run" 执行 SQL

这将创建所有需要的数据表、索引、行级安全策略和触发器。

### 3.5 配置 Supabase Storage（图片上传）

1. 在 Supabase Dashboard 中，点击左侧菜单的 "Storage"
2. 点击 "New bucket" 创建新存储桶
3. 填写存储桶信息：
   - Name: `recipe-images`
   - Public bucket: **开启**（允许公开访问图片）
4. 点击 "Create bucket"
5. 进入刚创建的 `recipe-images` 存储桶
6. 点击 "Policies" 标签页，配置访问策略：
   - 点击 "Add policy"
   - 选择 "For uploading" 模板
   - Policy name: `Allow authenticated users to upload`
   - 点击 "Review" -> "Save policy"
   - 再点击 "Add policy"
   - 选择 "For selecting" 模板
   - Policy name: `Allow public access to images`
   - 点击 "Review" -> "Save policy"

### 3.6 （可选）插入示例数据

1. 先在 App 中注册一个账户（通过邮箱或 GitHub）
2. 在 Supabase Dashboard 中，点击 "Table Editor" -> "profiles"
3. 复制你的用户 ID（第一列的 UUID）
4. 打开 `supabase/seed-data.sql` 文件
5. 将所有 `'00000000-0000-0000-0000-000000000000'` 替换为你的用户 ID
6. 在 SQL Editor 中运行修改后的 INSERT 语句

## 4. 启动开发服务器

```bash
npm run dev
```

开发服务器将在 `http://localhost:3000` 启动。

你现在可以：
- 访问首页浏览配方
- 注册/登录账户
- 发布新配方
- 收藏和评论配方

## 5. 构建生产版本

```bash
npm run build
```

构建产物将输出到 `dist` 目录。

## 6. 部署到 Vercel

### 6.1 准备部署

1. 将代码推送到 GitHub 仓库
2. 访问 [vercel.com](https://vercel.com) 并登录
3. 点击 "Add New Project"
4. 导入你的 GitHub 仓库

### 6.2 配置环境变量

在 Vercel 项目设置的 "Environment Variables" 中添加：

- `VITE_SUPABASE_URL`: 你的 Supabase URL
- `VITE_SUPABASE_ANON_KEY`: 你的 Supabase Anon Key

### 6.3 部署

点击 "Deploy"，等待部署完成。

## 7. 部署到 Netlify

1. 访问 [netlify.com](https://netlify.com) 并登录
2. 点击 "Add new site" -> "Import an existing project"
3. 连接 GitHub 并选择仓库
4. 在 "Site settings" -> "Environment variables" 中添加 Supabase 配置
5. 点击 "Deploy site"

## 8. 常见问题

### Q: 数据库权限错误？

确保你在 Supabase 中运行了完整的 `schema.sql`，包括 RLS 策略。

### Q: 图片无法加载？

确保使用的是可以公开访问的图片 URL，推荐使用 Unsplash 图片。

### Q: 如何获取完整的 TypeScript 类型定义？

可以使用 Supabase CLI 生成完整的数据库类型：

```bash
# 安装 Supabase CLI
npm install -g supabase

# 登录并关联项目
supabase login
supabase link --project-ref YOUR_PROJECT_ID

# 生成类型
supabase gen types typescript --project-id YOUR_PROJECT_ID > src/lib/database.types.ts
```

### Q: 本地开发需要 HTTPS 吗？

不需要，HTTP 就可以。但使用某些 OAuth 登录时可能需要配置回调 URL。

## 9. Supabase 回调 URL 配置

在 Supabase Dashboard 的 "Authentication" -> "URL Configuration" 中添加：

- Site URL: `http://localhost:3000`（开发）或你的生产域名
- Redirect URLs: 添加 `http://localhost:3000/**` 和你的生产域名 `https://your-domain.com/**`

## 10. 下一步

- 自定义主题配色（修改 `tailwind.config.js`）
- 添加更多鸡尾酒配方
- 实现更多功能（如标签系统、图片上传等）
- 配置自定义域名

祝调酒愉快！🍸
