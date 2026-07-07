<div class="chapter-header"><span class="chapter-num">03</span><span class="separator">/</span><a href="index.md">首页</a><span class="separator">›</span><span>开发包架构概述</span></div>

# 开发包架构概述

Chipsea Zephyr 开发包是基于 Zephyr RTOS 3.7.0（LTS）和 CSCE250X 系列芯片的 EC 固件框架，核心目标：

- 开箱即用：集成完整 BSP 与参考工程，客户可直接编译运行；
- 模块化架构：功能模块独立，便于裁剪与扩展；
- 统一配置体系：基于 Zephyr 设备树（DTS）与 Kconfig，硬件适配简单；
- 降低开发门槛：客户只需专注上层业务逻辑。

---

<div class="grid cards" markdown>

-   :material/microsoft-windows: **架构分层模型**

    ---

    开发包采用四层分层设计：

    [:material-arrow-right: 阅读](01_架构分层模型.md)

-   :material/linux: **与传统 EC 固件的差异**

    ---

    

    [:material-arrow-right: 阅读](02_与传统EC固件的差异.md)

-   :material/file-tree: **开发包目录结构**

    ---

    整个开发环境由三个工程目录组成，其关系如下：

    [:material-arrow-right: 阅读](03_开发包目录结构.md)

-   :material/compare: **Legacy EC 与 Zephyr EC 源码对照**

    ---

    Chromium EC 项目在 2021 年从 Legacy EC（裸机 RTOS）迁移到 Zephyr RTOS，两套代码在上游仓库中并行存在。了解两者的目录对应关系有助于阅读上游文档和参考代码。

    [:material-arrow-right: 阅读](04_LegacyEC与ZephyrEC源码对照.md)

-   :material/folder-open: **配置体系简介**

    ---

    开发包使用 Zephyr 标准的 Kconfig + 设备树 双轨配置：

    [:material-arrow-right: 阅读](05_配置体系简介.md)

</div>
