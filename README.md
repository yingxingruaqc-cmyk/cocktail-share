# Cocktails - 鸡尾酒配方分享App

鸡尾酒界的「下厨房」，调酒爱好者的配方分享社区。

## 功能特性

### 核心功能
- 📖 **配方浏览** - 首页展示所有鸡尾酒配方，卡片流展示
- ✍️ **配方发布** - 登录用户可以发布新配方
- 🔍 **配方搜索** - 支持按名称、风格、原料筛选
- ❤️ **配方收藏** - 收藏喜欢的配方，随时查看
- 💬 **用户评论** - 对配方进行评论互动
- 👥 **用户关注** - 关注其他作者，看他们的新配方
- 💬 **私信互动** - 支持用户之间发私信交流
- 👤 **个人中心** - 管理个人信息、发布的配方、收藏、关注等

### 用户认证
- 📧 邮箱注册登录
- 🐙 GitHub 第三方登录
- 🔒 未登录用户可以浏览搜索，不能发布收藏评论

## 技术栈

- **前端框架**: React 18 + TypeScript
- **构建工具**: Vite
- **样式方案**: Tailwind CSS v3
- **路由管理**: React Router v6
- **后端服务**: Supabase (Postgres + Auth)
- **Supabase SDK**: @supabase/supabase-js

## 设计风格

- **极简 Material Design** - 干净高级
- **配色方案**: 黑白灰为主，突出鸡尾酒彩色图片
- **玻璃拟态**: 导航栏和浮层使用半透明+背景模糊
- **响应式布局**: 完美支持桌面端、平板、手机
- **丝滑动画**: 页面切换、卡片交互有流畅动画

## 在线演示

[在此填入你的在线演示链接]

## 快速开始

详细的安装和配置说明请查看 [INSTALL.md](./INSTALL.md)。

### 快速启动

```bash
# 安装依赖
npm install

# 复制环境变量并配置
cp .env.example .env
# 编辑 .env 文件，填入你的 Supabase 配置

# 启动开发服务器
npm run dev
```

## 项目结构

```
cocktails-app/
├── src/
│   ├── components/       # 通用组件
│   │   ├── Layout.tsx
│   │   ├── Navbar.tsx
│   │   ├── RecipeCard.tsx
│   │   ├── Button.tsx
│   │   └── ...
│   ├── contexts/         # React Context
│   │   └── AuthContext.tsx
│   ├── hooks/            # 自定义 Hooks
│   │   ├── useRecipes.ts
│   │   ├── useFavorites.ts
│   │   ├── useFollows.ts
│   │   └── useComments.ts
│   ├── pages/            # 页面组件
│   │   ├── Home.tsx
│   │   ├── Login.tsx
│   │   ├── CreateRecipe.tsx
│   │   ├── RecipeDetail.tsx
│   │   ├── Profile.tsx
│   │   └── Messages.tsx
│   ├── types/            # TypeScript 类型定义
│   │   └── index.ts
│   ├── lib/              # 工具库
│   │   ├── supabase.ts
│   │   └── database.types.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── supabase/
│   ├── schema.sql        # 数据库表结构
│   └── seed-data.sql     # 示例数据
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
├── postcss.config.js
├── .env.example
├── .gitignore
├── README.md
└── INSTALL.md
```

## Supabase 数据表设计

- `profiles` - 用户资料表
- `recipes` - 鸡尾酒配方表
- `comments` - 评论表
- `favorites` - 收藏表
- `follows` - 关注表
- `messages` - 私信表

详细的表结构和关系请查看 [supabase/schema.sql](./supabase/schema.sql)。

## 预置示例配方

包含 10 个经典鸡尾酒配方：
1. 曼哈顿
2. 尼格罗尼
3. 干马天尼
4. 威士忌酸
5. 旧时尚
6. 莫斯科骡子
7. 边车
8. 吉姆雷特
9. 飞天海马
10. 长岛冰茶

## 部署推荐

- **Vercel** - 最简单的部署方式，自动构建
- **Netlify** - 同样支持自动部署
- **Cloudflare Pages** - 性能优秀，免费额度充足

详细的部署步骤请查看 [INSTALL.md](./INSTALL.md)。

## 许可证

MIT

## 贡献

欢迎提交 Issue 和 Pull Request！
