<div class="chapter-header"><span class="chapter-num">04</span><span class="separator">/</span><a href="../index.md">首页</a><span class="separator">›</span><span>固件功能模块说明</span></div>

# 固件功能模块说明

本章详细描述 EC 固件中各功能模块的设计与实现，涵盖状态机、逻辑流程、数据结构和模块间交互。工程共包含 13 个应用子模块及 18 个驱动模块，覆盖电源管理、输入处理、热管理、主机通信、安全加密等核心领域。各模块基于 `app/system/` 提供的基础设施（`ec_dev` 设备抽象、`ec_queue` 消息队列、`ec_structure` 数据结构、`sysevent` 系统事件）构建，通过统一的接口层与驱动层交互。

---

<div class="grid cards" markdown>

-   :material-cog: **系统基础设施**

    ---

    ec_dev 设备抽象、ec_queue 消息队列、ec_structure 数据结构、sysevent 事件广播

    [:material-arrow-right: 阅读](01_系统基础设施.md)

-   :material-serial-port: **主机通信接口**

    ---

    SMC 主机接口、eSPI Hub 驱动、ACPI 命令处理、SCI 中断管理

    [:material-arrow-right: 阅读](02_主机通信接口.md)

-   :material-power-plug: **电源管理**

    ---

    电源序列、休眠状态（S0/S3/S5）、系统启动与复位流程

    [:material-arrow-right: 阅读](03_电源管理.md)

-   :material-keyboard: **键盘与输入**

    ---

    键盘矩阵扫描、按键去抖、输入事件处理

    [:material-arrow-right: 阅读](04_键盘与输入.md)

-   :material-battery-charging: **电池与充电**

    ---

    电池管理、充电控制、BC1.2 检测、SMBus 通信

    [:material-arrow-right: 阅读](05_电池与充电.md)

-   :material-thermometer: **热管理**

    ---

    风扇控制、PECI 温度采集、DTT 动态调优

    [:material-arrow-right: 阅读](06_热管理.md)

-   :material-usb: **USB 与 PD**

    ---

    USB 功能模块、PD/Type-C 管理、TCPC/PPC/SSMUX、写保护机制

    [:material-arrow-right: 阅读](07_USB与PD.md)

-   :material-shield-lock: **安全与固件更新**

    ---

    安全启动、签名验证、OTA 固件更新、防回滚

    [:material-arrow-right: 阅读](08_安全与固件更新.md)

-   :material-chip: **外设与存储**

    ---

    PS/2 接口、ERPMC 加密、EEPROM、SPI Flash 共享

    [:material-arrow-right: 阅读](09_外设与存储.md)

-   :material-bug: **调试与 GPIO**

    ---

    ACPI 事件路由、Port80、GPIO 控制、LED 驱动、核心运行时架构

    [:material-arrow-right: 阅读](10_调试与GPIO.md)

</div>
