# CLAUDE.md — Chipsea Zephyr EC Manual

Fumadocs (Next.js 16) 构建的 EC 固件开发手册。源文件：55+ `.mdx` 在 `content/docs/`。

## 命令

```bash
npm install          # 首次
npm run dev          # 开发 → localhost:3000/ec-firmware-manual/
npm run build        # 验证（CI 同此命令）→ out/
npm run build:static # 静态导出含 NEXT_STATIC_EXPORT=1
```

推送 = 自动部署到 GitHub Pages（`.github/workflows/deploy.yml`）。

## 技术栈

- **框架**: Fumadocs v16 + Next.js 16.2 (Turbopack) + Tailwind CSS v4
- **MDX**: `fumadocs-mdx` → `source.config.ts` → `.source/` → `lib/source.ts`
- **高亮**: Shiki (github-light / github-dark), 支持 bash/c/python/yaml/cmake/powershell
- **搜索**: Orama（Fumadocs 内置）
- **主题**: Purple preset + 自定义 cyber 暗色（deep purple `#673AB7` + cyan `#00E5FF`）

## 关键文件（按改动频率）

```
修改文档 → content/docs/**/*.mdx + meta.json
修改首页 → app/(home)/page.tsx
修改样式 → app/global.css          (~490 行，.dark/:root 双模式)
修改导航 → app/layout.config.ts
构建配置 → next.config.ts            (basePath + trailingSlash + conditional export)
MDX 配置 → source.config.ts          (Shiki themes/langs)
路由页面 → app/docs/[[...slug]]/page.tsx
预构建   → scripts/generate-params.mjs → lib/static-slugs.ts
```

## 文档约定

- **Frontmatter 必须**: `title: 文档标题`
- **内部链接**: 绝对路径 `/docs/...`（不用相对路径）
- **代码块语言别名**: `kconfig`→`ini`, `dts`/`devicetree`→`c`, `make`→`makefile`
- **标题层级**: 页面模板已渲染 h1，内容标题从 `##` 起步
- **CSS 类**: `.cyber-hero`, `.hero-title`, `.cyber-card`, `.grid-cards`, `.page-footer`, `.reading-progress`
- **图标**: `import { Rocket } from 'lucide-react'` → `<Rocket />`

## 导航结构

```
content/docs/meta.json        → root: [quickstart, dev, ch7, ch8, ref]
  每个子目录有 meta.json       → pages: ["index", "01_xxx", ...]
  Fumadocs 文件系统路由        → /docs/{section}/{page}
  index.mdx                   → /docs/{section}（章节入口，卡片网格）
```

## 边界

- **禁止**: 在 MDX 中使用 `class=`（React 用 `className=`）
- **禁止**: 相对链接（必须 `/docs/...` 绝对路径）
- **禁止**: 内容中使用 `# ` 标题（h1 由模板提供，内容从 `## ` 起步）
- **修改样式时**: 同时处理 `.dark` 和 `:root` 两套配色
- **修改 `next.config.ts` 后**: 验证 `npm run dev` + `npm run build` 均正常
- **Legacy**: `docs/` 和 `mkdocs.yml` 仅参考，勿修改

## EC 固件参考

`EC-Zephyr/`（独立仓库，已在 `.gitignore`）— 文档中代码示例来源：
- `ecfw-zephyr/app/` — 13 功能模块
- `ecfw-zephyr/drivers/` — 18 设备驱动
- `ecfw-zephyr/boards/` — 板级支持包

`IT557x_ADL_N_MRD-ec-v0.21-220914/` — ITE IT557x 参考实现（ch7 迁移指南用）。
