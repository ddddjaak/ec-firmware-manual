# CLAUDE.md

本文件为 Claude Code (claude.ai/code) 在本仓库中工作时提供指引。

## 项目概述

**Chipsea Zephyr EC Manual** — 基于 MkDocs Material 的 EC 固件开发手册。

- 源文件：`docs/` 下 10 个 `.md` 文件（9 章 + 首页）
- 构建工具：MkDocs + Material 主题
- 部署：GitHub Actions 自动部署到 GitHub Pages
- EC 固件源码：`EC-Zephyr/` + `IT557x_ADL_N_MRD-ec-v0.21-220914/`（本地参考，不入 git）

## 本地预览

```bash
# 安装依赖
pip install mkdocs-material

# 启动开发服务器（热更新）
mkdocs serve
# 打开 http://127.0.0.1:8000
```

## 部署到 GitHub Pages

**自动化**：推送 `main` 分支即可，GitHub Actions 自动构建并部署。

```bash
git add docs/
git commit -m "更新文档"
git push origin main
```

工作流文件：`.github/workflows/deploy.yml`

**手动构建验证**：

```bash
mkdocs build --clean   # 输出到 site/，无警告即为通过
```

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
- 首页卡片使用 `grid cards` 语法
- 内部链接使用 `.md` 文件名（如 `[引言](ch1_引言.md)`）
- 图片路径相对于 `docs/`（如 `![](media/image1.png)`）
- 修改后运行 `mkdocs serve` 预览，确认无警告后推送

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
