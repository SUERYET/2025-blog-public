# SUERYETO's Blog

个人博客。文章、配置、图片全部存在这个 Git 仓库里，没有数据库、没有后端服务。
写作是在浏览器里完成的：打开站内编辑页 → 导入 GitHub App 的私钥 → 提交一次 commit → 等重新部署。

线上地址：<https://www.sueryeto.cn>

---

## 技术栈

| 层 | 选型 |
|---|---|
| 框架 | Next.js 16（App Router / Turbopack）、React 19、TypeScript |
| 样式 | Tailwind CSS v4（`@theme` + `@utility`，无 `tailwind.config`） |
| 状态 | Zustand（UI 状态）、SWR（数据拉取） |
| 动效 | motion |
| 正文渲染 | marked → shiki（代码高亮）→ katex（公式）→ mermaid（图表） |
| 写入 | jsrsasign 在浏览器签发 JWT → GitHub App → Git Data API |
| 部署 | Vercel（主）/ Cloudflare Workers + OpenNext（备） |

## 本地运行

```bash
pnpm install
pnpm dev          # http://localhost:2025
```

| 脚本 | 作用 |
|---|---|
| `pnpm dev` | 开发服务器，端口 **2025** |
| `pnpm build` | 生产构建 |
| `pnpm start` | 启动生产构建 |
| `pnpm svg` | 扫描 `src/svgs/` 重新生成图标索引，并监听变化 |
| `pnpm build:cf` / `preview` / `deploy` | Cloudflare Workers 构建 / 预览 / 部署 |

> `pnpm dev` 和 `pnpm build` 共用 `.next` 目录，**不能同时跑**。遇到奇怪的编译错误先确认没有第二个 dev 进程，再删 `.next` 重来。

## 内容结构

```
public/blogs/
├── index.json              ← 文章索引（列表页/首页/RSS/sitemap 都读它）
├── categories.json         ← 分类列表
└── <slug>/
    ├── index.md            ← 正文（Markdown）
    └── config.json         ← 标题、标签、日期、摘要、封面、分类、hidden
```

其它内容页的数据是各自目录下的 `list.json`：

```
src/app/projects/list.json    项目
src/app/share/list.json       推荐分享
src/app/bloggers/list.json    优秀博客
src/app/pictures/list.json    图集
src/app/snippets/list.json    一句话
src/app/about/list.json       关于我
```

站点外观、社交按钮、备案号等配置集中在 `src/config/site-content.json`，
首页卡片布局在 `src/config/card-styles.json`。

## 写作与编辑

站内大部分页面右上角有「编辑」按钮（也可以按 `Ctrl + ,`）。

1. 点「编辑」进入编辑态
2. 第一次保存时会要求导入 **Private Key**（GitHub App 的 `.pem`）
3. 提交后会在仓库产生一次 commit，等平台重新部署完刷新即可看到

私钥只在浏览器内存里；如果勾选了「缓存密钥」，会用 AES-GCM 加密后存进 `sessionStorage`。
**不要把这个 `.pem` 文件提交到仓库**（`.gitignore` 已忽略 `*.pem`）。

### 一次性准备：创建 GitHub App

1. GitHub → Settings → Developer settings → **New GitHub App**
2. 只需要给仓库 **Contents: Read & write** 权限，Webhook 关掉
3. 创建后下载 **Private Key**，记下 **App ID**
4. 把 App 安装到你自己的博客仓库（只授权这一个仓库）

### 正文支持的语法

除标准 Markdown 外，还支持：

- 代码块（shiki 高亮，深浅色双主题）
- 数学公式：`$inline$` 与 `$$block$$`（KaTeX）
- 图表：用 ```` ```mermaid ```` 代码块写 flowchart / sequenceDiagram 等，**只在出现时才加载 mermaid**

## 环境变量

在部署平台配置；本地可以放 `.env.local`。

| 变量 | 必填 | 默认值 | 作用 |
|---|---|---|---|
| `NEXT_PUBLIC_GITHUB_OWNER` | ✅ | `SUERYET` | 目标仓库所有者 |
| `NEXT_PUBLIC_GITHUB_APP_ID` | ✅ | — | GitHub App 的 App ID，签发 JWT 用 |
| `NEXT_PUBLIC_GITHUB_REPO` | | `2025-blog-public` | 目标仓库名 |
| `NEXT_PUBLIC_GITHUB_BRANCH` | | `main` | 提交分支 |
| `NEXT_PUBLIC_SITE_URL` | 建议 | `https://www.sueryeto.cn` | RSS 链接与文章 canonical |
| `NEXT_PUBLIC_LIKE_ENDPOINT` | | 自建 Worker 地址 | 点赞接口 |
| `NEXT_PUBLIC_GITHUB_ENCRYPT_KEY` | | 有内置值 | 缓存私钥时的加密口令，**建议覆盖** |
| `BLOG_SLUG_KEY` | | 空 | 服务端拼点赞 slug 的前缀 |

> `NEXT_PUBLIC_*` 是**构建期注入**的，改完必须重新构建/部署才生效。

### 点赞服务

点赞数存在自建的 Cloudflare Worker + KV 里（`blog-liker`），不依赖第三方。
接口约定：

```
GET  /api/like?slug=xxx   → { count }
POST /api/like?slug=xxx   → { count } | { reason: "rate_limited" }
```

换服务只需改 `NEXT_PUBLIC_LIKE_ENDPOINT`，前端代码不用动。

## 设计系统与文档

- 颜色、圆角、阴影、字体：`src/styles/tokens.css`（三层 token，深浅色靠 `html[data-theme]` 翻转）
- 通用组件：`src/components/ui/`（Button / IconButton / Segmented / Menu / Container）
- 页面外壳：`src/components/site-shell.tsx`（顶栏 / 页脚 / 移动端抽屉 / 音乐播放器）
- 编辑工具条：`src/components/edit-toolbar.tsx`（含完整的私钥导入流程）
- 统一提交管线：`src/lib/commit.ts`（**全站所有写仓库的操作都走它**）

重构的设计决策、踩过的坑、以及未做的事都记录在：
`docs/superpowers/specs/2026-10-31-blog-redesign-design.md`

## 部署

### Vercel（当前使用）

导入仓库即可，构建命令 `pnpm build`，无需额外配置。配好上面的环境变量后重新部署一次。

### Cloudflare Workers（备选）

```bash
pnpm build:cf
pnpm preview      # 本地预览
pnpm deploy
```

`wrangler.toml` 已经配好静态资源绑定（`ASSETS`）与 `nodejs_compat`。

## 说明

- 首页有**两种视图**：文章流（默认）和卡片桌面，右上角切换，选择会记住
- 文章索引有 `hidden` 字段：标记为隐身的文章不会出现在列表、首页、RSS 和 sitemap，
  但 `public/blogs/index.json` 本身是公开文件，**不能靠它做真正的私密**
- `public/` 里的音频与图片建议压缩后再提交（当前约 29 MB）
