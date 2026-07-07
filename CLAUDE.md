# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

本文件为 Claude Code (claude.ai/code) 在本仓库中工作时提供指引。

## 项目概述

**Chipsea Zephyr EC Manual** — 基于 MkDocs Material 的 EC 固件开发手册。

- 源文件：`docs/` 下 10 个 `.md` 文件（9 章 + 首页）
- 构建工具：MkDocs + Material 主题
- 部署：GitHub Actions 自动部署到 GitHub Pages
- EC 固件源码：`EC-Zephyr/` + `IT557x_ADL_N_MRD-ec-v0.21-220914/`（已在 `.gitignore` 中排除，本地参考，不入 git）

> **注意**：仓库根目录的 `AGENTS.md` 描述的是历史 Doxygen 构建流程（`Doxyfile`、`pages/` 等已不存在），当前唯一活跃的文档构建系统是 MkDocs。

## 本地预览

```bash
# 安装依赖
pip install mkdocs-material

# 启动开发服务器（热更新）
mkdocs serve
# 打开 http://127.0.0.1:8000
```

**推送前必须验证**：

```bash
mkdocs build --clean   # 输出到 site/，无警告即为通过
```

CI 执行的也是同一命令，本地通过 ≈ CI 通过。

## 部署到 GitHub Pages

**自动化**：推送 `main` 分支即可，GitHub Actions 自动构建并部署。

```bash
git add docs/
git commit -m "更新文档"
git push origin main
```

工作流文件：`.github/workflows/deploy.yml`

**部署原理**：
1. `push` 到 `main` 触发 GitHub Actions
2. `pip install mkdocs-material` → `mkdocs build`
3. `upload-pages-artifact` 上传 `site/`
4. `deploy-pages` 部署到 `ddddjaak.github.io/ec-firmware-manual/`

**注意**：仓库需设为 Public，Settings → Pages → Source 选 "GitHub Actions"。

## 项目结构

```
docs/                              ← MkDocs 源文件
  index.md                         ← 首页（魔幻科技感 Hero + grid cards）
  ch1_引言.md … ch9_附录.md
  media/                           ← 文档图片
  stylesheets/extra.css            ← 赛博暗色主题 + 首页特效
mkdocs.yml                         ← MkDocs 配置
.github/workflows/deploy.yml       ← GitHub Actions 自动部署
EC-Zephyr/                         ← 固件源码（本地参考，不入 git）
IT557x_ADL_N_MRD-ec-v0.21-220914/  ← ITE 参考代码（同上）
```

## 文档编辑

- 所有 `.md` 文件是标准 Markdown + MkDocs Material 扩展语法
- 首页使用 `grid cards` 语法展示章节卡片
- **内部链接**使用 `.md` 文件名（如 `[引言](ch1_引言.md)`），MkDocs 会自动转换为 `.html`
- **图片路径**相对于 `docs/`（如 `![](media/image1.png)`）
- **YAML frontmatter**：首页 `index.md` 使用 `hide: navigation` + `hide: toc` 隐藏侧边栏和目录；其他章节不需要
- 修改后运行 `mkdocs serve` 预览，确认无警告后运行 `mkdocs build --clean` 验证，再推送

### 可用的自定义 CSS 类

`docs/stylesheets/extra.css` 提供了以下自定义样式，可在页面中使用：

| CSS 类 | 用途 | 使用位置 |
|--------|------|----------|
| `.cyber-hero` | 首页 Hero 区域（渐变光晕 + 点阵网格背景） | `index.md` |
| `.hero-tagline` | Hero 区域副标题 | `index.md` |
| `.grid cards` | 章节卡片网格（玻璃拟态 + 悬浮幻光） | `index.md` |
| `.page-footer` | 首页页脚 | `index.md` |
| `.stat-icon` | 统计卡片图标 | 按需 |

> CSS 同时覆盖了亮色/暗色两种模式（通过 `[data-md-color-scheme="slate"]` / `[data-md-color-scheme="default"]` 选择器），修改样式时需同时考虑两套配色。

## MkDocs 配置要点

- 主题：Material，暗色模式默认启用
- 配色：deep purple（主色）+ cyan（强调色）
- 自定义 CSS：`docs/stylesheets/extra.css`
- nav 目录在 `mkdocs.yml` 中手动维护

## EC 固件代码参考

`EC-Zephyr/` 是一个独立的 git 仓库，文档中所有代码示例、DTS 片段、Kconfig 配置来源于此：

- `EC-Zephyr/ecfw-zephyr/app/` — 13 个功能模块
- `EC-Zephyr/ecfw-zephyr/drivers/` — 18 个设备驱动
- `EC-Zephyr/ecfw-zephyr/boards/` — 板级支持包

固件代码变更需同步更新文档中的对应章节。

`IT557x_ADL_N_MRD-ec-v0.21-220914/` 是 ITE IT557x（C51 内核）的参考实现，用于 ch7 迁移指南。
