# 2026-10-31 博客重构 · 设计规格

> 状态：P1 已落地并验证（构建通过、深浅双主题实测）
> 范围：全站设计系统 + 阅读侧重构 + 双视图首页

## 1. 目标与取舍

把「单页风格作品集」升级成「可长期维护的博客站」，同时**不丢掉卡片桌面的识别度**。

三条硬约束：

1. **好维护**：颜色/圆角/阴影只有一处定义；页面之间靠原语组件复用，不靠复制粘贴。
2. **直观**：陌生访客首访看到的是能直接读的文章列表，不是需要学习的界面。
3. **美观**：编辑式排版（Swiss Modernism 2.0 取向）+ 克制的品牌色。

## 2. 双视图

| | 文章流（默认） | 桌面 |
|---|---|---|
| 首访 | ✅ 默认 | 需切换 |
| 记忆 | `localStorage['home-view']` | 同左 |
| 顶栏/页脚 | 有 | 无（全屏画布） |
| 背景 | 纯色画布 | 用户上传的背景图 + 气泡 |
| 数据源 | `useBlogIndex` | 同左 |

**不重复维护的关键**：两个视图共用数据层、`SiteShell`、全部原语组件和 token，差异只在布局组合。

首帧由 `layout.tsx` 内联脚本设置 `html[data-view]`，并用
`html[data-view='desktop'] [data-flow-home] { visibility: hidden }`
避免 SSR 出文章流再切换的闪烁。

### 出口约定（P1 修过的真实 bug）

桌面模式不渲染 `SiteShell`，等于把顶栏上的「视图切换」一起藏了 —— 切进去就出不来。

**规则：任何隐藏站内外壳的模式，必须自己带一条退路。**
桌面模式因此在 `desktop-toolbar.tsx` 里自带浮动工具条
（文章流 · 主题切换 · 站点设置），固定右上角、`z-70`、玻璃底。

以后再引入「沉浸模式」「全屏阅读」之类的形态，同样要在该形态内部提供退出入口。

## 3. Token 层（`src/styles/tokens.css`）

三层结构：

```
配置色 (--cfg-*, 由 head.tsx 注入)  →  语义变量 (--color-*)  →  Tailwind 工具类
```

**关键实现细节（踩过的坑，别改回去）：**

- `@theme` 必须**非 inline**：工具类生成 `var(--color-*)` 才能被 `.dark` 翻转。
  写成 inline 会把值烤进工具类，深色永远不生效。
- 站点配置色**不能**用 `<html style>` 内联注入 —— 内联样式优先级高于任何选择器，
  会锁死 `html[data-theme='dark']`。必须用 `<style>:root{...}</style>`，
  让深色规则靠 `(0,1,1) > (0,1,0)` 的选择器权重取胜。
- 深色下品牌色**由配置色自动推导**，不是写死的：
  `--color-brand: color-mix(in srgb, var(--cfg-brand) 70%, #fff)`。
  改站点主色，深浅两套一起变。

语义变量清单：

| 变量 | 用途 |
|---|---|
| `--color-canvas` / `--color-surface` / `--color-surface2` | 画布 / 卡片 / 次级面 |
| `--color-hair` / `--color-hair2` | 描边 / 强描边 |
| `--color-ink` / `--color-ink2` / `--color-muted` / `--color-faint` | 文字四级 |
| `--color-brand` / `--color-brand-ink` / `--color-brandsoft` | 品牌三态 |
| `--card-bg` | `.card` 的底色（深色下换成更实的玻璃） |
| `--glass` / `--shadow-*` / `--ease` | 玻璃层、阴影、缓动 |

**对比度基线**：`--faint` 是次要文字的下限，浅色 `#6B7E86`、深色 `#7C929B`，
对各自背景 ≥ 4.5:1。不要再往浅了调。

## 4. 原语组件（`src/components/ui/`）

| 组件 | 约定 |
|---|---|
| `Button` | `variant: primary/outline/ghost/subtle/danger`，`size: sm/md/lg` |
| `IconButton` | **`aria-label` 必填**（类型层面强制），杜绝无标签图标按钮 |
| `Segmented` | 主题/视图切换共用，`aria-pressed` 自动维护 |
| `Menu` | 点击外部关闭、ESC 关闭、打开聚焦首项、`aria-expanded` |
| `Container` / `ProseColumn` | 1120px 外壳 / 716px 阅读列 |

## 5. 信息架构

```
顶栏（5 + 更多）
├── 文章 /blog      项目 /projects    关于 /about
├── 分享 /share     博客 /bloggers
└── 更多 ▾  写文章 · 一句话 · 图集 · 图片工具箱 · 时钟 · 图标库 · Live2D · 鸣潮
页脚：版权 · RSS · GitHub · 邮箱
```

移动端（<768px）：隐藏主导航 → 汉堡 → 右侧抽屉（含更多 + 主题/视图切换）。

## 6. 排版基线

- 正文 17.5px / 行高 1.88 / 字距 0.011em / 最大 716px（约 68ch）
- 列表标题 17px / 1.5 / -0.012em；精选标题 22–25px
- 元信息一律 `font-mono` + 11.5px + 0.12em 字距（日期、标签、分节标题）
- 中文**不加载 webfont**（Noto Sans SC 子集体积不可接受），走系统栈

## 7. 阶段计划

| 阶段 | 内容 | 状态 |
|---|---|---|
| **P1** | token + 原语 + SiteShell + 主题/视图切换 + 文章流首页 + 构建验证 | ✅ 已完成 |
| **P1.5** | hidden 泄露修复 + 11 份 commit 管线收口成 `lib/commit.ts` | ✅ 已完成 |
| **P2** | 文章页重做（进度条 / TOC 滚动高亮 / 上下篇 / 阅读时长）、/blog 列表改版、/tags | ✅ 已完成 |
| **P3** | Dialog 无障碍、浅色字面量清理、`<EditToolbar>` 抽取 + `/about` `/share` `/bloggers` `/pictures` `/blog` 重做 | ✅ 已完成 |
| **P3.5** | ~~`/blog` 与配置面板、写作页迁移到 `<EditToolbar>`~~ — `/blog` 已迁移；配置面板与写作页**刻意不迁**，见 8.2 | ✅ 已完成 |
| **P4** | 文章页 metadata（按文章 title/description/OG/canonical） | ✅ 已完成 |
| **P4.1** | 文章页静态预渲染（`generateStaticParams` + 服务端渲染正文）、图片优化、`prefers-reduced-motion` | 待做 |

## 7.1 写入层（`src/lib/commit.ts`）

所有「往仓库写东西」的行为统一成一次声明式提交：

```ts
await commitFiles(
  [
    { kind: 'file',   path: 'public/images/xxx.png', file },   // 本地文件 → blob
    { kind: 'text',   path: 'src/app/share/list.json', content: json },
    { kind: 'delete', path: 'public/blogs/old/index.md' }
  ],
  '更新分享列表',
  { token }        // 可选：复用调用方已有的 token
)
```

- 底层 `getRef/createBlob/createTree/createCommit/updateRef` **只允许被 `commit.ts` 调用**，
  其余代码一律走 `commitFiles`。想改提交行为，只改一个文件。
- 冲突重试：`updateRef` 失败时重新取 ref、用新 `base_tree` 重建再试一次，
  不会再出现「操作太快了，请操作慢一点」这种错误文案。
- blob 是内容寻址的，重试时复用，不会重复上传同一张图。
- 迁移后净减约 550 行（23 个文件，+317 / −866）。

## 7.2 可见性（`src/lib/blog-visibility.ts`）

`isPublicPost` / `publicPosts` 是「一篇文章对外是否可见」的**唯一定义**。
首页、`/blog`、`/rss.xml`、`/sitemap.xml` 全部走它。

之前这条规则只实现在 `use-blog-index` 的客户端过滤里，导致 hidden 文章
会从 RSS 和 sitemap 两个出口泄露。**新增任何对外出口时，先套这两个函数。**

## 8. 已知限制（非缺陷，明确取舍）

1. **配置面板的 8 个颜色现在只作用于浅色的「面」**，品牌色仍深浅通用。
   深色的面走设计系统。若要「每个主题一套配色」，需要给 `theme` 加 `light/dark` 两组。
2. **老页面仍有 135 处 `bg-white/60`、`text-gray-500` 之类字面量**（42 个文件）。
   它们靠 token 翻转已能正常阅读，但暗色下会有轻微不一致，P3 统一清理。
3. 桌面模式的背景图是用户上传的彩色插画，深色下**不重绘背景**，
   只把卡片换成暗玻璃保证文字可读。
4. 没有搜索。11 篇文章的情况下搜索是过度设计，用分类筛选即可。
5. **`public/blogs/index.json` 本身仍是公开可读的**，所以 `hidden` 只能做到
   「不出现在任何聚合出口（首页/列表/RSS/sitemap）」，做不到「URL 无法猜中」。
   真要私密，需要把 hidden 文章移出 `public/` 或改成服务端鉴权渲染。
6. **文章页正文仍是客户端渲染**（`/blog/[id]` 是 `ƒ` 动态路由，进页面先出骨架屏再拉 markdown）。
   但 **metadata 已经在服务端**（`blog/[id]/layout.tsx` 的 `generateMetadata`），
   所以 `<title>` / `description` / OG / canonical 都在初始 HTML 里，爬虫不执行 JS 也能拿到。

   还差的是「正文 HTML 进首屏」和「静态预渲染」。要做需要：
   1. 把 `renderMarkdown` 搬到服务端，并把 `marked.use()` 换成 `new Marked()` 实例调用
      （现在每次渲染都往全局注册一次 renderer，构建期并行渲染多篇会互相污染）；
   2. `BlogPreview` 拆成服务端正文 + 客户端增强（TOC 高亮 / 进度条 / 代码复制）；
   3. `page.tsx` 换成服务端组件并加 `generateStaticParams`。

   **2026-11-01 线上实测**：首屏 HTML 约 4.6s（30KB），文章列表和正文都要等客户端
   fetch 回来才出现（首页约 5s、文章页约 3s）。**作者决定暂不做服务端渲染**，
   接受这个首屏代价。以后若要优化，按上面三步来；更轻量的中间方案是给首页和文章页
   加骨架屏（现在文章页已有，首页只有空区块）。

   收益是首屏更快 + 正文可被抓取；风险集中在上面的第 1 点，属于独立一轮。

## 8.1 阅读层（P2）

- `BlogPreview` 同时服务阅读页和写作预览，改一处两处都变。
- 排版：正文 17.5px / 1.88 / 0.011em / 716px；h2 前 28px 品牌短横。
- TOC 用**滚动位置**判定当前小节（不用 IntersectionObserver，长文里会跳变），
  左侧 2px 高亮条。
- 标题 id **必须去重**：同篇里两个「例题」slugify 后会撞车，既断锚点又导致
  React key 重复。`markdown-renderer` 里统一分配 `xxx / xxx-2 / xxx-3`。
- 代码块用 shiki **双主题**（`one-light` / `one-dark-pro`），渲染一次写两套 CSS 变量。
  深色规则必须带 `!important` —— shiki 把浅色 background/color 写在行内 style 上。
- 列表行（`components/post-row.tsx`）被首页、`/blog`、`/tags` 三处共用。
  行本身是 `<a>`，所以行内标签**不能**再渲染成链接（`link={false}`），否则是非法嵌套。

## 8.2 写入侧（P3）

**`<EditToolbar>`（`components/edit-toolbar.tsx`）** 收掉了「编辑 → 取消 / 保存」+
密钥导入这一整套。调用方只提供 `onSave`，其它全自动：

```tsx
<EditToolbar
  editing={isEditMode}
  saving={isSaving}
  hideEditButton={hideEditButton}
  onEdit={() => setIsEditMode(true)}
  onCancel={handleCancel}
  onSave={handleSave}
  extra={<Button size='sm' onClick={handleAdd}>添加</Button>}
/>
```

还没导入密钥时点「保存」会自动弹 `.pem` 选择器，选完**直接继续这次保存**，
不需要用户再点一次（旧实现有的页面要求点两次）。

**迁移进度**：`/projects`、`/snippets`、`/about`、`/share`、`/bloggers`、`/pictures`、`/blog`
**全部 7 个页面已完成**。每页只剩 `onSave` 一个回调，`.pem` 流程全在组件内。

**刻意没有迁移的两处**（不是遗漏）：

- `(home)/config-dialog` —— 它在**对话框内部**的底部操作区，语义是「保存这份表单」
  而不是「进入页面编辑态」，套 `<EditToolbar>` 会把「编辑/取消/保存」的三态
  硬塞进两态对话框，反而更绕。
- `write/components/actions` —— 写作页的按钮是「预览 / 导入 MD / 发布 / 删除」，
  没有「编辑态」，发布也不是「保存到某个已有数据源」。同样不适合。

判断标准：**只有"页面级 查看 ⇄ 编辑 两态切换"才用 `<EditToolbar>`**。


**Dialog 无障碍**（`components/dialog-modal.tsx`）：`role="dialog"` / `aria-modal` /
Tab 焦点陷阱 / 打开时聚焦首个可聚焦元素 / 关闭后焦点归还触发元素。

**字面量清理**：`bg-white*` / `text-gray-*` / `border-gray-*` / `bg-gray-*`
共 237 处、41 个文件，统一换成 `bg-surface` / `bg-surface2` / `text-ink` /
`text-muted` / `text-faint` / `border-hair` / `bg-hair2`。现在 src 下已无残留。

