<div class="chapter-header"><span class="chapter-num">05</span><span class="separator">/</span><a href="index.md">首页</a><span class="separator">›</span><span>应用开发指南</span></div>

# 应用开发指南

本章面向 ODM 开发者，以实战为导向介绍在 Chipsea Zephyr 开发包上进行 EC 固件开发的完整流程。从创建一个新功能模块的端到端案例入手，逐步覆盖配置系统、外设驱动、任务模型、主机通信、电源管理、系统服务、调试手段以及构建烧录验证。

---

<div class="grid cards" markdown>

-   :material/microsoft-windows: **快速上手：新增一个功能模块**

    ---

    以"电池电量计（Fuel Gauge）"模块为例，演示从零到一在 EC 固件中新增一个自定义功能模块的完整流程。这个模式适用于任何新增的 EC 应用模块。

    [:material-arrow-right: 阅读](01_快速上手：新增一个功能模块.md)

-   :material/linux: **Kconfig 配置系统**

    ---

    Kconfig 是控制功能启用、驱动选择、编译参数的核心机制。配合 `prj.conf` 等配置文件，可以灵活裁剪系统。日常开发中，`prj.conf` 是最常修改的文件。

    [:material-arrow-right: 阅读](02_Kconfig配置系统.md)

-   :material/file-tree: **外设驱动使用指南**

    ---

    本节以代码片段形式展示 EC 开发中最常用的外设驱动模式。所有驱动均基于 Zephyr 设备树绑定硬件资源，通过 `DEVICE_DT_GET()` 获取设备实例。

    [:material-arrow-right: 阅读](03_外设驱动使用指南.md)

-   :material/compare: **任务与事件模型**

    ---

    在 EC 固件中，线程（任务）是功能模块的基本执行单元，事件框架用于模块间的解耦通信。

    [:material-arrow-right: 阅读](04_任务与事件模型.md)

-   :material/folder-open: **主机通信**

    ---

    EC 通过 LPC 或 eSPI 接口与主机（BIOS/OS）通信，实现命令交互、事件上报与状态同步。

    [:material-arrow-right: 阅读](05_主机通信.md)

-   :material/cog: **电源与唤醒管理**

    ---

    EC 负责系统全局的电源状态控制与协调，从上电到关机全过程的电源序列管理。

    [:material-arrow-right: 阅读](06_电源与唤醒管理.md)

-   :material/console: **系统服务速查**

    ---

    ### 看门狗（WDT）

    [:material-arrow-right: 阅读](07_系统服务速查.md)

-   :material/test-tube: **调试与问题定位**

    ---

    ### 日志系统

    [:material-arrow-right: 阅读](08_调试与问题定位.md)

-   :material/bug: **构建、烧录与验证**

    ---

    ### 构建命令

    [:material-arrow-right: 阅读](09_构建、烧录与验证.md)

</div>
