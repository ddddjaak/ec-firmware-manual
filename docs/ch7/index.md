<div class="chapter-header"><span class="chapter-num">07</span><span class="separator">/</span><a href="index.md">首页</a><span class="separator">›</span><span>移植与定制</span></div>

# 移植与定制

将 Zephyr EC 框架移植到新的硬件平台，或为现有平台进行深度功能定制，是嵌入式开发者的高阶技能。本章将系统性地阐述从零开始构建一个新硬件平台支持包的完整过程，涵盖从最基础的工程创建、芯片架构初始化，到设备树配置、驱动适配，最终进行系统级的资源与功能优化。通过本章的学习，开发者将掌握在 Zephyr 体系下进行平台移植与定制的核心方法论。

---

<div class="grid cards" markdown>

-   :material/microsoft-windows: **新平台移植流程（Porting Guide）**

    ---

    移植工作并非一蹴而就，而是需要从前期评估到分阶段验证的系统化工程。本节介绍移植前的准备工作、BSP 创建流程以及推荐的分阶段移植策略。

    [:material-arrow-right: 阅读](01_新平台移植流程.md)

-   :material/linux: **板级初始化（Board Init / PinMux / Clock）**

    ---

    板级初始化是从复位到应用层启动的桥梁，涉及启动流程、链接脚本、时钟树、引脚控制和板级特定代码。

    [:material-arrow-right: 阅读](02_板级初始化.md)

-   :material/file-tree: **设备树与驱动适配（Devicetree / Binding / Driver）**

    ---

    设备树（Devicetree）和驱动绑定（Binding）是 Zephyr 硬件描述和驱动匹配的核心机制。本节从基础概念出发，逐步讲解 DTS 编写、驱动绑定启用和裁剪适配。

    [:material-arrow-right: 阅读](03_设备树与驱动适配.md)

-   :material/compare: **功能与资源裁剪（Kconfig / Memory Optimization）**

    ---

    EC 固件运行在资源极为受限的 MCU 上（典型配置：256-512 KB Flash、64-256 KB SRAM）。系统化的裁剪和优化是量产固件的必经环节。

    [:material-arrow-right: 阅读](04_功能与资源裁剪.md)

-   :material/folder-open: **新驱动开发流程（New Driver Development）**

    ---

    当现有驱动无法覆盖 CSCE250X 的特定外设时，需要开发新驱动。Zephyr 的驱动模型提供了一套标准化的开发流程。

    [:material-arrow-right: 阅读](05_新驱动开发流程.md)

-   :material/cog: **从传统 EC 平台迁移至 Chipsea Zephyr**

    ---

    前述章节介绍了在 Zephyr 生态内为新板卡创建 BSP 的标准流程。然而，芯海 EC 芯片的一个重要业务场景是芯片替代——客户希望用 CSCE250X 替换现有的 ITE（如 IT5571/IT5

    [:material-arrow-right: 阅读](06_从传统EC平台迁移至ChipseaZephyr.md)

-   :material/console: **Zephyr 新板 Bringup 清单**

    ---

    本节介绍为 Zephyr EC 创建新板级的完整流程，基于 Chromium EC 上游的 Baseboard/Board 目录结构。

    [:material-arrow-right: 阅读](07_Zephyr新板Bringup清单.md)

</div>
