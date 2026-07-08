---
hide:
  - navigation
  - toc
---

<div class="cyber-hero" markdown>

<span class="hero-chip-label">CSCE250X · Cortex-M33 · Zephyr 3.7.0</span>

# 芯海 Zephyr EC 开发手册

<div class="hero-divider"></div>

<p class="hero-tagline">嵌入式控制器固件开发指南</p>

为内部团队及 ODM 伙伴提供标准化的 EC 固件开发框架——从环境搭建、设备树配置、驱动开发到系统集成的最佳实践。

<div class="hero-stats" markdown>

<div class="hero-stat" markdown>
<span class="hero-stat-value">30</span>
<span class="hero-stat-label">分钟上手</span>
</div>

<div class="hero-stat" markdown>
<span class="hero-stat-value">13</span>
<span class="hero-stat-label">功能模块</span>
</div>

<div class="hero-stat" markdown>
<span class="hero-stat-value">18</span>
<span class="hero-stat-label">驱动</span>
</div>

<div class="hero-stat" markdown>
<span class="hero-stat-value">29</span>
<span class="hero-stat-label">示例</span>
</div>

</div>

</div>

---

## :material-rocket-launch: 快速入口

<div class="grid cards" markdown>

-   :material-rocket-launch:{ .lg .middle } **快速上手**

    ---

    30 分钟完成环境搭建、编译并烧录第一个固件工程

    [:material-arrow-right: 立即开始](quickstart/index.md)

-   :material-book-open-variant:{ .lg .middle } **开发指南**

    ---

    架构设计 · 功能模块 · 外设驱动 · 调试验证 —— 日常开发的核心参考资料

    [:material-arrow-right: 浏览指南](dev/index.md)

-   :material-cable-data:{ .lg .middle } **移植与定制**

    ---

    新平台 BSP 移植、设备树适配、驱动开发、从传统 EC 迁移到 Zephyr

    [:material-arrow-right: 查看详情](ch7/index.md)

-   :material-bookmark-multiple:{ .lg .middle } **参考手册**

    ---

    命令速查表、EC 术语与缩写、硬件接口参考设计、开源资源链接

    [:material-arrow-right: 快速查阅](ref/index.md)

</div>

---

## :material-view-grid-outline: 全部内容

<div class="grid cards" markdown>

-   :material-layers:{ .lg .middle } **架构与配置**

    ---

    分层模型、与传统 EC 的差异、目录结构、源码对照、Kconfig / DTS 配置体系

    [:material-arrow-right: 阅读](dev/architecture/index.md)

-   :material-developer-board:{ .lg .middle } **功能模块**

    ---

    电源管理、键盘扫描、电池充电、热管理、USB/PD 等 10 个子模块详解

    [:material-arrow-right: 阅读](dev/modules/index.md)

-   :material-code-braces:{ .lg .middle } **应用开发**

    ---

    新增功能模块、外设驱动调用、任务与事件模型、主机通信、电源与唤醒管理

    [:material-arrow-right: 阅读](dev/appdev/index.md)

-   :material-bug-outline:{ .lg .middle } **调试与验证**

    ---

    Zephyr Logging / Shell 调试、单元测试与仿真、崩溃分析、FAQ 排错

    [:material-arrow-right: 阅读](dev/debug/index.md)

-   :material-puzzle:{ .lg .middle } **移植与定制**

    ---

    Porting Guide、板级初始化、设备树与驱动适配、功能裁剪、新驱动开发

    [:material-arrow-right: 阅读](ch7/index.md)

-   :material-shield-star:{ .lg .middle } **最佳实践**

    ---

    代码规范与提交流程、功耗优化策略、安全加固与运行时防护、客户协作

    [:material-arrow-right: 阅读](ch8/index.md)

-   :material-console-line:{ .lg .middle } **命令速查**

    ---

    West 命令、Zephyr 构建命令、调试与监控命令、Git 版本控制

    [:material-arrow-right: 阅读](ref/01_命令速查.md)

-   :material-sort-alphabetical-variant:{ .lg .middle } **术语表**

    ---

    EC 与 Zephyr 常用术语、缩写速查、中英对照

    [:material-arrow-right: 阅读](ref/02_术语表.md)

</div>

---

<div class="page-footer" markdown>

**V1.0** · 基于 Zephyr 3.7.0 LTS · CSCE250X Cortex-M33

有问题？请通过内部渠道反馈

</div>
