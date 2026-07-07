<div class="chapter-header"><span class="chapter-num">02</span><span class="separator">/</span><a href="index.md">首页</a><span class="separator">›</span><span>开发环境准备</span></div>

# 开发环境准备

本章节将指导用户如何搭建 CSCE250X 芯片基于 Zephyr 3.7.0
的固件开发环境。在开始固件开发前，客户需要完成以下准备工作：

- 安装必要的软件工具链（Zephyr SDK、Python、Git 等）；

- 获取工程源码（两种方式：使用官方 GitHub 仓库，或直接使用 Chipsea
  提供的打包工程）；

- 验证开发环境（确保能够编译和运行示例代码）。

---

<div class="grid cards" markdown>

-   :material/microsoft-windows: **软件工具链安装（Linux/Windows）**

    ---

    ### Windows平台环境搭建

    [:material-arrow-right: 阅读](01_软件工具链安装.md)

-   :material/linux: **zmake 构建工具**

    ---

    `zmake` 是 Chromium OS EC 项目的专用构建工具，用于简化 Zephyr 固件的构建流程。Chipsea Zephyr EC 项目当前使用 `west build` + `buil

    [:material-arrow-right: 阅读](02_zmake构建工具.md)

</div>
