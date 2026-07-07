# Chromium EC 文档分析报告

> 来源：https://chromium.googlesource.com/chromiumos/platform/ec.git/+/HEAD/docs/

## 拉取页面

| # | 页面 | 内容 |
|---|------|------|
| 1 | `README.md` | 项目主页 — 涵盖 Introduction / Code Overview / Building / Flashing / Debugging |
| 2 | `docs/sitemap.md` | 文档站点地图 — 按主题分类（Getting Started / Bringup / Debugging / Testing / Zephyr） |
| 3 | `docs/ec_terms.md` | EC 缩写与技术术语表 — 40+ 个缩写，含锚点链接和交叉引用 |
| 4 | `docs/getting_started_quickly.md` | 快速上手 |
| 5 | `docs/core_runtime.md` | 核心运行时 — 任务调度、Hooks、延迟函数、共享内存 |
| 6 | `docs/new_board_checklist.md` | 新板创建清单 — GPIO 命名规范、关键文件、配置步骤 |
| 7 | `docs/write_protection.md` | 写保护机制 |
| 8 | `docs/usb-c.md` | USB-C PD 深度文档 |
| 9 | `docs/unit_tests.md` | 单元测试框架 |
| 10 | `docs/code_coverage.md` | 代码覆盖率 |
| 11 | `docs/zephyr/README.md` | Zephyr EC 总览 — 共享代码 vs Zephyr 专属、源码组织图 |
| 12 | `docs/zephyr/zephyr_new_board_checklist.md` | Zephyr 版新板清单 |
| 13 | `docs/zephyr/zephyr_build.md` | Zephyr 构建（zmake 工具） |
| 14 | `docs/zephyr/ztest.md` | Zephyr 测试框架 |

---

## 关键发现

### 1. 文档以任务/角色组织，而非线性章节

| Chromium EC | 你的项目 |
|-------------|---------|
| Getting Started（快速上手） | ch1 引言 + ch2 环境 |
| EC Bringup（新板清单） | ❌ 缺失 |
| Case Closed Debugging（CCD 调试） | ch6 部分覆盖 |
| Testing（单元测试 + 代码覆盖率） | ❌ 缺失 |
| Zephyr 专属区（zephyr/ 子目录） | 散落在各章 |
| USB / PD（深度专题） | ch4 部分覆盖 |
| Verified Boot（安全启动） | ch4 部分覆盖 |
| Fingerprint MCU（指纹专项） | N/A（非笔记本 EC） |

### 2. 术语表是他们最实用的页面

`ec_terms.md` 特点：
- 40+ 个缩写，每个有锚点 ID，可被其他页面直接引用
- 定义精简（2-3 句），链接到详细文档
- 覆盖：ADC, ALS, AP, BC12, CBI, CEC, DPTF, EC, ectool, eSPI, FAFT, GPIO, I2C, LPC, MCU, MKBP, PD, PMIC, PPC, PWM, SHI, SPI, TCPC, UART 等

### 3. 新板 Bringup 是实操清单，不是教程

`new_board_checklist.md` 特点：
- 先讲 Conventions（GPIO 命名规范、关键文件角色）
- 再给步骤：创建目录 → 配置 EC Features
- 每个步骤有具体文件路径和代码片段

### 4. Zephyr + Legacy 双轨制经验

Chromium EC 在 2021 年从 Legacy EC（裸机 RTOS）切到 Zephyr，两套代码共存：
- `common/` — 共享代码（电池、USB PD、键盘、verified boot）
- `driver/` — 共享驱动
- `zephyr/` — Zephyr 专属（shim 适配层、boards、drivers、tests）
- 明确列出「Legacy EC 不再使用的目录」

### 5. 设计文档作为 wiki 的一部分

Chromium EC 把架构设计文档直接放在 docs 目录里（如 `fingerprint-authentication-design-doc.md`），而不是放在单独的私有空间。这对 ODM 伙伴特别有用。

---

## 可执行建议

| 优先级 | 建议 | 工作量 |
|--------|------|--------|
| 🔴 高 | 新增**术语表**页面（基于 Chromium EC ec_terms.md） | 中 |
| 🔴 高 | 新增**新板 Bringup 清单**页面 | 大 |
| 🟡 中 | 将 ch4 安全部分独立为**写保护/安全启动**专题 | 小 |
| 🟡 中 | 新增**测试框架**页面（ztest + 单元测试） | 中 |
| 🟢 低 | 补充**核心运行时**概念（任务/Hooks/延迟函数）到 ch4 | 小 |
| 🟢 低 | 将散落各章的 Zephyr 专属信息集中为专题 | 中 |
| 🟢 低 | 标注 **Legacy EC vs Zephyr EC** 目录对照表 | 小 |
