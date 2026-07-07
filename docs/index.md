---
hide:
  - navigation
  - toc
---

<div class="cyber-hero" markdown>

# 🔧 芯海 EC 固件开发手册

<p class="hero-tagline">基于 Zephyr 3.7.0 LTS 的嵌入式控制器固件开发指南</p>

为内部团队及 ODM 伙伴提供标准化的 EC 固件开发框架——从环境搭建、设备树配置、驱动开发到系统集成的最佳实践。

</div>

---

## 📖 快速入口

<div class="grid cards" markdown>

-   :material-help-circle: **认识 EC** · 引言

    ---

    理解 EC 在笔记本与嵌入式系统中的角色，掌握 OpenEC + Zephyr RTOS 的架构优势与开发理念

    [:material-arrow-right: 开始阅读](ch1_引言.md)

-   :material-code-braces: **开始搭建** · 开发环境

    ---

    Linux / Windows 双平台一站式开发环境搭建，从工具链配置到首次固件编译验证

    [:material-arrow-right: 开始搭建](ch2_开发环境准备.md)

-   :material-package-variant: **开发包架构** · 架构概述

    ---

    深入 Chipsea Zephyr SDK 目录结构、Kconfig 配置分层与设备树组织方式

    [:material-arrow-right: 了解架构](ch3_Chipsea_Zephyr_开发包架构概述.md)

-   :material-flash: **固件开发** · 应用指南

    ---

    任务调度模型、外设驱动框架、主机通信协议与 Zephyr 系统服务实战

    [:material-arrow-right: 开始开发](ch5_应用开发指南.md)

</div>

---

## :material-account-group: 选择你的起点

<div class="grid cards" markdown>

-   :material-code-tags: **应用开发者**

    ---

    开发 EC 固件业务逻辑和功能模块

    - [引言 — 了解 EC 核心概念](ch1_引言.md)
    - [开发环境准备 — 从头搭建工具链](ch2_开发环境准备.md)
    - [应用开发指南 — 从零开始构建 EC 功能模块](ch5_应用开发指南.md)
    - [调试与验证 — 日志、Shell、仿真](ch6_调试与验证.md)

-   :material-chip: **硬件 / 移植工程师**

    ---

    接入新平台、定制 BSP 与设备树

    - [开发包架构概述 — 目录与配置体系](ch3_Chipsea_Zephyr_开发包架构概述.md)
    - [固件功能模块 — 电源、键盘、接口详解](ch4_固件功能模块说明.md)
    - [移植与定制 — BSP 创建与设备树适配](ch7_移植与定制.md)

-   :material-shield-check: **质量 / 规范**

    ---

    代码质量、安全与团队协作

    - [最佳实践与建议 — 代码规范与优化](ch8_最佳实践与建议.md)
    - [附录 — 命令速查与资源链接](ch9_附录.md)
    - [调试与验证 — 问题定位与仿真](ch6_调试与验证.md)

</div>

---

## :material-bookmark: 核心参考

<div class="grid cards" markdown>

-   :material-view-grid: **功能模块**

    ---

    电源、键盘、风扇、接口模块详解

    [:material-arrow-right: 查看](ch4_固件功能模块说明.md)

-   :material-cog: **Kconfig 配置**

    ---

    编译选项与功能裁剪配置体系

    [:material-arrow-right: 查看](ch5_应用开发指南.md)

-   :material-swap-horizontal: **移植指南**

    ---

    BSP 创建、设备树适配与新平台接入

    [:material-arrow-right: 查看](ch7_移植与定制.md)

-   :material-security: **最佳实践**

    ---

    代码规范、能耗优化与安全加固

    [:material-arrow-right: 查看](ch8_最佳实践与建议.md)

-   :material-file-document: **附录**

    ---

    命令速查表、开源资源与硬件参考

    [:material-arrow-right: 查看](ch9_附录.md)

</div>

---

## :material-format-list-bulleted: 全部章节

<div class="grid cards" markdown>

-   1. :material-help-circle: **引言** — EC 概念与 OpenEC + Zephyr 优势

    [:material-arrow-right: 阅读](ch1_引言.md)

-   2. :material-code-braces: **开发环境准备** — Linux / Windows 双平台搭建

    [:material-arrow-right: 阅读](ch2_开发环境准备.md)

-   3. :material-package-variant: **开发包架构概述** — 目录与 Kconfig 解析

    [:material-arrow-right: 阅读](ch3_Chipsea_Zephyr_开发包架构概述.md)

-   4. :material-view-grid: **固件功能模块** — 电源、键盘、接口详解

    [:material-arrow-right: 阅读](ch4_固件功能模块说明.md)

-   5. :material-flash: **应用开发指南** — 快速上手与最佳实践

    [:material-arrow-right: 阅读](ch5_应用开发指南.md)

-   6. :material-bug: **调试与验证** — 日志、Shell、仿真诊断

    [:material-arrow-right: 阅读](ch6_调试与验证.md)

-   7. :material-swap-horizontal: **移植与定制** — BSP 与设备树适配

    [:material-arrow-right: 阅读](ch7_移植与定制.md)

-   8. :material-security: **最佳实践与建议** — 规范、优化、安全

    [:material-arrow-right: 阅读](ch8_最佳实践与建议.md)

-   9. :material-file-document: **附录** — 命令速查、资源、硬件参考

    [:material-arrow-right: 阅读](ch9_附录.md)

</div>

---

<div class="info-box" markdown>

| | |
|---|---|
| **版本** | V1.0 (2026-05-21) |
| **适用平台** | ARM EC — CSCE10X / CSCE201X / CSCE250X 系列 |
| **工具链** | VS Code + Zephyr 3.7.0 LTS |

</div>

---

<div class="page-footer" markdown>

**V1.0** · 9 个章节 · 基于 Zephyr 3.7.0 LTS

有问题？请通过内部渠道反馈

</div>
