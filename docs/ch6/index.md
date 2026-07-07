<div class="chapter-header"><span class="chapter-num">06</span><span class="separator">/</span><a href="index.md">首页</a><span class="separator">›</span><span>调试与验证</span></div>

# 调试与验证

EC（Embedded
Controller）固件通常运行在一个无显示、无操作系统支持的实时环境中。在这种系统中，日志输出
与 命令行调试接口（Shell） 是开发与验证阶段最重要的调试手段。Zephyr RTOS
提供了灵活的 Logging 框架 与 Shell
模块，两者可独立使用，也可联动输出日志，实现强大的在线诊断能力。

---

<div class="grid cards" markdown>

-   :material/microsoft-windows: **日志与调试接口 (Zephyr logging, Shell)**

    ---

    EC
固件运行在实时环境中，通常缺少显示接口，因此日志输出和命令行接口是开发调试的主要手段。Zephyr
RTOS 提供了轻量、灵活的调试框架，可直接集成到 EC 系统中。

    [:material-arrow-right: 阅读](01_日志与调试接口.md)

-   :material/linux: **单元测试与仿真环境（Unit Test）**

    ---

    ### 测试的重要性与目标

    [:material-arrow-right: 阅读](02_单元测试与仿真环境.md)

-   :material/file-tree: **异常监控与奔溃分析（Fatal Error / Assert / Dump）**

    ---

    在嵌入式控制器（EC）固件中，系统可靠性至关重要。由于固件通常运行在无操作系统保护、无显示界面的实时环境中，一旦出现异常（如栈溢出、非法访问、断言失败等），若无法有效捕获与分析，将严重影响系统稳定性与

    [:material-arrow-right: 阅读](03_异常监控与奔溃分析.md)

-   :material/compare: **功能验证方法 (电源、按键、风扇等)**

    ---

    功能验证阶段是 EC
固件开发中最关键的环节。其目标不仅是验证各模块功能正确性，还需确保在各种电源状态、交互场景与异常条件下，系统能稳定、可恢复地运行。

    [:material-arrow-right: 阅读](04_功能验证方法.md)

-   :material/folder-open: **常见问题排查 (FAQ)**

    ---

    本章整理了在 OpenEC + Zephyr
开发过程中常见的系统级、驱动级与调试级问题。通过定位思路、命令工具与参考日志分析，帮助开发者快速识别故障根因并制定修复方案。

    [:material-arrow-right: 阅读](05_常见问题排查.md)

-   :material/cog: **测试框架**

    ---

    Zephyr 提供了多层次的测试体系，从单元测试到集成测试，帮助开发者在开发阶段尽早发现和修复缺陷。

    [:material-arrow-right: 阅读](06_测试框架.md)

</div>
