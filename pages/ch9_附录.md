\page ch9_附录 附录

# 附录

## 常用命令速查表

本章汇总 Zephyr RTOS 与 EC 固件开发过程中常用的各类命令，分为 West 工具、Zephyr 构建、调试监控、版本控制四大类，便于日常开发时快速查阅。

### West 命令

West 是 Zephyr 项目的元工具，用于管理多仓库工程、构建、烧录和调试。

| 命令 | 说明 | 示例 |
|------|------|------|
| `west init` | 初始化 Zephyr 工作空间 | `west init -m https://github.com/zephyrproject-rtos/zephyr --mr v3.6.0 zephyrproject` |
| `west update` | 同步所有模块子仓库 | `west update` |
| `west build` | 编译 Zephyr 应用 | `west build -b csce250x_evb app/ec-firmware` |
| `west flash` | 烧录固件到目标板 | `west flash --runner jlink` |
| `west debug` | 启动调试会话 | `west debug --runner jlink` |
| `west boards` | 列出所有支持的开发板 | `west boards | grep csce250x` |
| `west config` | 查看或设置 west 配置 | `west config build.board csce250x_evb` |
| `west status` | 查看所有仓库工作区状态 | `west status` |
| `west list` | 列出所有受 west 管理的仓库及其路径 | `west list` |
| `west forall` | 在所有仓库中执行命令 | `west forall -c "git status -s"` |
| `west topdir` | 打印工作空间顶层目录 | `west topdir` |
| `west zephyr-export` | 导出 Zephyr 环境变量到 CMake | `west zephyr-export` |

### Zephyr 构建命令

以下命令涵盖构建配置、清理、报告生成和高级 CMake 选项。

| 命令 | 说明 | 示例 |
|------|------|------|
| `west build -b BOARD` | 指定开发板编译 | `west build -b csce250x_evb` |
| `west build -t menuconfig` | 图形化 Kconfig 配置 | `west build -b csce250x_evb -t menuconfig` |
| `west build -t clean` | 清理构建产物 | `west build -b csce250x_evb -t clean` |
| `west build -t ram_report` | 生成 RAM 使用报告 | `west build -b csce250x_evb -t ram_report` |
| `west build -t rom_report` | 生成 ROM 使用报告 | `west build -b csce250x_evb -t rom_report` |
| `west build -- -DCONF_FILE=...` | 指定自定义 Kconfig 文件 | `west build -b csce250x_evb -- -DCONF_FILE=prj_ec.conf` |
| `cmake -DBOARD=...` | 直接调用 CMake 配置 | `cmake -DBOARD=csce250x_evb -B build .` |
| `ninja -C build` | 使用 Ninja 增量编译 | `ninja -C build` |
| `ninja -C build -j8` | 指定并行编译任务数 | `ninja -C build -j8` |
| `west build -t flash` | 编译后自动烧录 | `west build -b csce250x_evb -t flash` |
| `west build -t guiconfig` | 图形化 Kconfig 配置 (GUI) | `west build -b csce250x_evb -t guiconfig` |
| `west build -t hardenconfig` | 生成最小化 .config (去除无效选项) | `west build -b csce250x_evb -t hardenconfig` |
| `west build -p` | 纯净构建 (先清理再编译) | `west build -b csce250x_evb -p always` |
| `west build -- -DOVERLAY_CONFIG=...` | 叠加额外 Kconfig 片段 | `west build -b csce250x_evb -- -DOVERLAY_CONFIG=debug.conf` |
| `west build -- -DDTC_OVERLAY_FILE=...` | 叠加 Devicetree 覆盖文件 | `west build -b csce250x_evb -- -DDTC_OVERLAY_FILE=ec.overlay` |
| `west build -- -DCMAKE_BUILD_TYPE=...` | 指定编译类型 | `west build -b csce250x_evb -- -DCMAKE_BUILD_TYPE=Debug` |

### 调试与监控命令

固件开发与调试中常用的调试器和串口终端命令。

| 命令 | 说明 | 示例 |
|------|------|------|
| `west debug` | 通过 west 启动 GDB 调试 | `west debug --runner jlink` |
| `west attach` | 附加到运行中的目标板 | `west attach --runner jlink` |
| `JLinkExe` | J-Link 命令行调试器 | `JLinkExe -device CSCE250X -if SWD -speed 4000` |
| `openocd` | OpenOCD 调试服务器 | `openocd -f interface/jlink.cfg -f target/csce250x.cfg` |
| `minicom` | 串口终端工具 | `minicom -D /dev/ttyUSB0 -b 115200` |
| `screen` | 通用终端多路复用 | `screen /dev/ttyUSB0 115200` |
| `JLinkSWOViewer` | J-Link SWO 输出查看器 | `JLinkSWOViewer -device CSCE250X -speed 4000` |
| `JLinkRTTClient` | J-Link RTT 实时终端 | `JLinkRTTClient` |
| `arm-none-eabi-gdb` | ARM GDB 直接调试 | `arm-none-eabi-gdb build/zephyr/zephyr.elf -ex "target remote :2331"` |
| `arm-none-eabi-objdump` | 反汇编 ELF 文件 | `arm-none-eabi-objdump -d build/zephyr/zephyr.elf` |
| `arm-none-eabi-nm` | 查看 ELF 符号表 | `arm-none-eabi-nm -S --size-sort build/zephyr/zephyr.elf` |
| `arm-none-eabi-size` | 查看段大小统计 | `arm-none-eabi-size build/zephyr/zephyr.elf` |
| `pyocd commander` | pyOCD 命令行调试工具 | `pyocd commander --target csce250x` |

### 版本控制与工程管理

日常开发中使用的 Git 命令速查。

| 命令 | 说明 | 示例 |
|------|------|------|
| `git log --oneline` | 查看单行提交历史 | `git log --oneline -20` |
| `git diff` | 查看未暂存的改动 | `git diff -- ecfw-zephyr/` |
| `git checkout -b BRANCH` | 创建并切换到新分支 | `git checkout -b feature/ec-espi-driver` |
| `git rebase` | 变基到目标分支之上 | `git rebase upstream/main` |
| `west status` | 查看所有仓库工作空间状态 | `west status` |
| `git log --graph --oneline --all` | 可视化提交历史 | `git log --graph --oneline --all -20` |
| `git remote -v` | 查看远程仓库地址 | `git remote -v` |
| `git stash` | 暂存当前工作区改动 | `git stash push -m "WIP: espi driver"` |
| `git stash pop` | 恢复暂存的改动 | `git stash pop` |
| `git cherry-pick` | 摘取特定提交到当前分支 | `git cherry-pick abc1234` |
| `git bisect` | 二分法定位引入问题的提交 | `git bisect start; git bisect bad; git bisect good v3.5.0` |
| `west manifest --freeze` | 导出当前所有仓库的精确版本 | `west manifest --freeze > manifest-frozen.yml` |

---

## 相关开源资源链接

本节整理 EC-Zephyr 固件开发相关的主要开源项目和工具资源，供开发者参考。

### Zephyr 上游

Zephyr 官方项目和维护的资源。

- [Zephyr Project 官方文档](https://docs.zephyrproject.org/latest/) — 包含构建指南、API 参考、开发板支持、驱动模型、网络协议栈等完整技术文档
- [Zephyr Project GitHub](https://github.com/zephyrproject-rtos/zephyr) — Zephyr RTOS 主仓库，包含内核、驱动和子系统，使用 Apache 2.0 许可证
- [Zephyr SoC: arm/chipsea](https://github.com/zephyrproject-rtos/zephyr/tree/main/soc/arm/chipsea) — Zephyr 上游中芯海 (Chipsea) SoC 支持代码，包含 CSCE250X 系列的 Kconfig 和设备树定义
- [Zephyr SDK](https://github.com/zephyrproject-rtos/sdk-ng) — 官方预编译交叉工具链和宿主工具集 (含 arm-zephyr-eabi GCC)
- [Zephyr Modules](https://github.com/zephyrproject-rtos) — 各类 Zephyr 子模块，包括 HAL 层 (hal_st, hal_nordic 等)、文件系统 (LittleFS, FAT) 和网络协议栈
- [Zephyr Sample Applications](https://docs.zephyrproject.org/latest/samples/index.html) — 官方示例应用集，涵盖传感器、网络、电源管理、USB 等多个场景
- [Zephyr Devicetree Bindings](https://docs.zephyrproject.org/latest/build/dts/bindings.html) — Zephyr 设备树绑定文档，描述每个 compatible 节点所需的属性

### 开发工具

构建、调试和辅助开发的核心工具链。

- [GNU Arm Embedded Toolchain](https://developer.arm.com/tools-and-software/open-source-software/developer-tools/gnu-toolchain) — ARM 官方 GNU 交叉编译工具链 (arm-none-eabi-gcc)，ARM Cortex-M 开发必备
- [CMake](https://cmake.org/) — 跨平台构建系统生成器，Zephyr 构建系统的核心基础设施
- [Ninja](https://ninja-build.org/) — 专注于速度的小型构建工具，Zephyr 默认使用的构建后端
- [Segger J-Link Software](https://www.segger.com/downloads/jlink/) — J-Link 调试器驱动与工具包，支持 Flash 断点、RTT 实时终端和 SWO 输出
- [OpenOCD](https://openocd.org/) — 开源片上调试器 GDB 服务端，支持 SWD/JTAG 适配器和多种目标芯片
- [pyOCD](https://github.com/pyocd/pyOCD) — Python 实现的 ARM Cortex-M 调试工具，支持 CMSIS-DAP 和编程 API
- [Visual Studio Code](https://code.visualstudio.com/) — 轻量级代码编辑器，配合 Cortex-Debug、CMake Tools 和 nRF DeviceTree 扩展可实现完整开发体验
- [Devicetree Compiler (dtc)](https://github.com/dgibson/dtc) — 设备树编译器，用于编译/反编译 .dts 和 .dtb 文件
- [Kconfiglib](https://github.com/ulfalizer/Kconfiglib) — Python Kconfig 解析库，Zephyr 的 Kconfig 配置工具链依赖

### 参考设计与社区

与 Zephyr 开发相关的测试框架、Devicetree 规范和社区参考。

- [Zephyr Testing Documentation](https://docs.zephyrproject.org/latest/develop/test/index.html) — Zephyr 单元测试和集成测试框架 (ztest)，以及 twister 自动化测试运行器
- [Devicetree Specification](https://www.devicetree.org/specifications/) — Devicetree 规范官网，Zephyr 采用 Devicetree 描述硬件拓扑和绑定关系
- [Zephyr Project GitHub Discussions](https://github.com/zephyrproject-rtos/zephyr/discussions) — 官方社区讨论区，获取帮助和技术交流的主要渠道
- [Zephyr API Documentation](https://docs.zephyrproject.org/latest/doxygen/html/index.html) — Zephyr 内核和驱动 API 的 Doxygen 自动生成文档
- [eSPI Base Specification (Intel)](https://www.intel.com/content/www/us/en/design/technologies-and-topics/espi-base-specification.html) — Intel 增强串行外设接口 (eSPI) 规范，EC 与 PCH 通信协议的基础标准

### 芯海相关

芯海科技 (Chipsea) 的官方资源入口。

- [芯海科技官网](https://www.chipsea.com/) — 芯海科技产品中心，可获取 CSCE250X 系列 EC 芯片数据手册和参考文档
- [芯海 SDK 与开发工具](https://www.chipsea.com/) — 芯海 MCU 标准外设库 (Standard Peripheral Library)、SDK 和软件开发环境
- [EC-Zephyr 项目仓库](https://github.com/chipsea) — 芯海科技在 GitHub 上的开源项目入口，包含 EC-Zephyr 固件工程等

---

## 硬件接口参考设计

本节基于 EC-Zephyr 实际源码，整理 CSCE250X EC 芯片的核心硬件接口参数，包括外设地址映射、中断向量、eSPI 配置、GPIO 模式编码和板级引脚映射，供硬件设计和驱动开发时参考。

<!-- sourced from: EC-Zephyr/ecfwwork/zephyr_modules_csce250x/hal/csce250x/standard_peripheral/include/ -->

### CSCE250X 外设地址映射

CSCE250X 的各个外设模块均通过 AHB/APB 总线挂载在固定地址空间上。以下列出开发中最常用的外设基地址。

| 外设 | 基地址 | 说明 |
|------|--------|------|
| GPIOA | `0x48000000` | GPIO 端口 A，支持 8 位 I/O |
| GPIOB | `0x48000400` | GPIO 端口 B，支持最高位非完全功能 |
| GPIOC | `0x48000800` | GPIO 端口 C |
| GPIOD | `0x48000C00` | GPIO 端口 D |
| GPIOE | `0x48001000` | GPIO 端口 E |
| GPIOF | `0x48001400` | GPIO 端口 F |
| GPIOG | `0x48001800` | GPIO 端口 G |
| GPIOH | `0x48001C00` | GPIO 端口 H |
| GPIOI | `0x48002000` | GPIO 端口 I |
| GPIOJ | `0x48002400` | GPIO 端口 J，不支持 PIN_2 |
| GPIOK | `0x48002800` | GPIO 端口 K |
| GPIOL | `0x48002C00` | GPIO 端口 L |
| GPIOM | `0x48003000` | GPIO 端口 M |
| GPION | `0x48003400` | GPIO 端口 N |
| I2C0 | `0x48010000` | I2C 控制器 0 |
| I2C1 | `0x48010400` | I2C 控制器 1 |
| I2C2 | `0x48010800` | I2C 控制器 2 |
| I2C3 | `0x48010C00` | I2C 控制器 3 |
| I2C4 | `0x48011000` | I2C 控制器 4 |
| I2C5 | `0x48011400` | I2C 控制器 5 |
| USART | `0x48012000` | 通用同步异步收发器 |
| RCC | `0x48008000` | 复位与时钟控制器 |
| EXTI | `0x48018000` | 外部中断控制器 |
| PMU | `0x48018C00` | 电源管理单元 |
| GPSPI | `0x4001B400` | 通用 SPI 控制器 |
| eSPI | `0x50000000` | 增强串行外设接口 (eSPI Slave) |
| LPC | `0x50001000` | LPC (Low Pin Count) 接口 |
| KBC | `0x50002000` | 键盘控制器 (Keyboard Controller) |
| PECI | `0x4001A000` | PECI (Platform Environment Control Interface) |
| QSPI | `0x4002D000` | Quad SPI 控制器 |
| FSPI | `0x4002E000` | Flash SPI 控制器 |
| ADC | `0x40007000` | 模数转换器 |
| PS2_0 | `0x48013000` | PS/2 接口 0 (键盘) |
| PS2_1 | `0x48013400` | PS/2 接口 1 (鼠标) |
| PWM0 | `0x40004000` | PWM 控制器 0 |
| PWM1 | `0x40004400` | PWM 控制器 1 |
| FAN0 | `0x40002000` | 风扇控制器 0 |
| FAN1 | `0x40002400` | 风扇控制器 1 |
| FAN2 | `0x40002800` | 风扇控制器 2 |
| FAN3 | `0x40002C00` | 风扇控制器 3 |
| FAN4 | `0x40002000` | 风扇控制器 4 |
| FAN5 | `0x40003400` | 风扇控制器 5 |
| FAN6 | `0x40003800` | 风扇控制器 6 |
| FAN7 | `0x40003C00` | 风扇控制器 7 |
| SHM | `0x50005800` | 共享内存 (Shared Memory) |
| ESHM | `0x50005C00` | 扩展共享内存 (Extended Shared Memory) |
| H2EC | `0x50005400` | 主机到 EC 邮箱 |
| EC2H | `0x50005000` | EC 到主机邮箱 |
| DP80 | `0x50004800` | Debug Port 80 |
| KSC | `0x48014400` | 键盘扫描控制器 (Keyboard Scan Controller) |
| BRAM | `0x48029000` | 备份 RAM (Backup RAM) |
| IWDT | `0x48028000` | 独立看门狗定时器 (Independent WDT) |
| WWDT | `0x48022000` | 窗口看门狗定时器 (Window WDT) |
| RTC | `0x48028400` | 实时时钟 (RTC) |
| DMA0 | `0x40020000` | DMA 控制器 0，支持 7 通道 |
| DMA1 | `0x40020400` | DMA 控制器 1，支持 7 通道 |
| BTIM0 | `0x40000000` | 基本定时器 0 (Base Timer) |
| BTIM1 | `0x40000400` | 基本定时器 1 |
| GTIM2 | `0x40000800` | 通用定时器 2 (General Timer) |
| GTIM3 | `0x40000C00` | 通用定时器 3 |
| SWDT | `0x40027C00` | 系统看门狗定时器 (System WDT) |
| I3C0 | `0x40018000` | I3C 控制器 0 |
| I3C1 | `0x40019000` | I3C 控制器 1 |
| OWI0 | `0x48021000` | 单线接口 0 (OneWire Interface) |
| OWI1 | `0x48021400` | 单线接口 1 |
| OWI2 | `0x48021800` | 单线接口 2 |
| OWI3 | `0x48021C00` | 单线接口 3 |
| PWRSW | `0x48028C00` | 电源开关控制器 (Power Switch) |
| UFCS | `0x48014800` | 通用 Flash 控制器 (UFCS) |
| CEC | `0x48014000` | HDMI-CEC 控制器 |
| ACPI0 | `0x50003000` | ACPI 通道 0 寄存器组 |
| ACPI1 | `0x50003400` | ACPI 通道 1 寄存器组 |
| ACPI2 | `0x50003800` | ACPI 通道 2 寄存器组 |
| ACPI3 | `0x50003C00` | ACPI 通道 3 寄存器组 |
| ACPI4 | `0x50004000` | ACPI 通道 4 寄存器组 |
| SDMA | `0x40028400` | 系统 DMA (System DMA) |
| OTPC | `0x40022000` | OTP 控制器 (One-Time Programmable) |
| QCU | `0xE0044000` | Quad SPI 控制单元 (Quad Controller Unit) |
| DEBUG | `0x48018800` | 调试模块 (Debug Module) |
| BPWM0 | `0x48020000` | 基本 PWM 0 (Basic PWM) |
| BPWM1 | `0x48020400` | 基本 PWM 1 |
| BPWM2 | `0x48020800` | 基本 PWM 2 |
| VCI | `0x48028800` | 虚拟组件接口 (Virtual Component Interface) |
| HCFG | `0x50006C00` | 主机配置寄存器 (Host Configuration) |

> 注：GPIO 端口每组间隔 `0x400` 字节，I2C 控制器各组间隔 `0x400` 字节。GPIOA 到 GPION 共 14 组端口。FAN4 与 FAN0 共用物理寄存器组，通过偏移区分。ACPI 通道共 5 组，每组间隔 `0x400`。

<!-- sourced from: EC-Zephyr/ecfwwork/zephyr_modules_csce250x/hal/csce250x/cmsis/csce250x/include/csce250x.h -->

### 核心中断向量（EC 相关）

CSCE250X 使用 ARM Cortex-M33 架构的嵌套向量中断控制器 (NVIC)。以下列出 EC 固件开发中频繁使用的中断向量及其 IRQ 编号。

| IRQ 编号 | 中断名称 | 功能描述 |
|----------|----------|----------|
| 4 | `KSIO_IRQn` | 键盘扫描 I/O 中断 |
| 5 | `VCI_IRQn` | VCI (虚拟组件接口) 中断 |
| 6 | `PWRSW_IRQn` | 电源开关 (Power Switch) 中断 |
| 7 | `VSTBY_IRQn` | 待机电源中断 |
| 11 | `PECI_IRQn` | PECI 接口中断 |
| 12 | `ESPI_SLAVE_IRQn` | eSPI 从机中断 |
| 13 | `LPC_IRQn` | LPC 接口中断 |
| 15 | `KBC_IRQn` | 键盘控制器中断 |
| 16 | `ACPI0_IRQn` | ACPI 通道 0 中断 |
| 17 | `ACPI1_IRQn` | ACPI 通道 1 中断 |
| 18 | `ACPI2_IRQn` | ACPI 通道 2 中断 |
| 19 | `ACPI3_IRQn` | ACPI 通道 3 中断 |
| 20 | `ACPI4_IRQn` | ACPI 通道 4 中断 |
| 26 | `I2C0_IRQn` | I2C 总线 0 中断 |
| 27 | `I2C1_IRQn` | I2C 总线 1 中断 |
| 28 | `I2C2_IRQn` | I2C 总线 2 中断 |
| 29 | `I2C3_IRQn` | I2C 总线 3 中断 |
| 30 | `I2C4_IRQn` | I2C 总线 4 中断 |
| 31 | `I2C5_IRQn` | I2C 总线 5 中断 |
| 32 | `USART_IRQn` | USART 中断 |
| 33 | `FAN0_IRQn` | 风扇控制器 0 中断 |
| 34 | `FAN1_IRQn` | 风扇控制器 1 中断 |
| 35 | `FAN2_IRQn` | 风扇控制器 2 中断 |
| 36 | `FAN3_IRQn` | 风扇控制器 3 中断 |
| 37 | `FAN4_IRQn` | 风扇控制器 4 中断 |
| 38 | `FAN5_IRQn` | 风扇控制器 5 中断 |
| 39 | `FAN6_IRQn` | 风扇控制器 6 中断 |
| 40 | `FAN7_IRQn` | 风扇控制器 7 中断 |
| 52 | `ADC_IRQn` | ADC 模数转换器中断 |
| 60 | `GPIOA_IRQn` | GPIO 端口 A 中断 |
| 61 | `GPIOB_IRQn` | GPIO 端口 B 中断 |
| 62 | `GPIOC_IRQn` | GPIO 端口 C 中断 |
| 63 | `GPIOD_IRQn` | GPIO 端口 D 中断 |
| 64 | `GPIOE_IRQn` | GPIO 端口 E 中断 |
| 65 | `GPIOF_IRQn` | GPIO 端口 F 中断 |
| 66 | `GPIOG_IRQn` | GPIO 端口 G 中断 |
| 67 | `GPIOH_IRQn` | GPIO 端口 H 中断 |
| 68 | `GPIOI_IRQn` | GPIO 端口 I 中断 |
| 69 | `GPIOJ_IRQn` | GPIO 端口 J 中断 |
| 70 | `GPIOK_IRQn` | GPIO 端口 K 中断 |
| 71 | `GPIOL_IRQn` | GPIO 端口 L 中断 |
| 72 | `GPIOM_IRQn` | GPIO 端口 M 中断 |
| 73 | `GPION_IRQn` | GPIO 端口 N 中断 |
| 79 | `I3C0_IRQn` | I3C 总线 0 中断 |
| 80 | `I3C1_IRQn` | I3C 总线 1 中断 |
| 81 | `PS2_0_IRQn` | PS/2 端口 0 (键盘) 中断 |
| 82 | `PS2_1_IRQn` | PS/2 端口 1 (鼠标) 中断 |
| 84 | `PLTRST_IRQn` | 平台复位 (Platform Reset) 中断 |
| 86 | `SHM_ESHM_IRQn` | 共享内存 / 扩展共享内存中断 |
| 87 | `DP80_IRQn` | Debug Port 80 中断 |
| 88 | `H2EC_IRQn` | 主机到 EC 邮箱中断 |

<!-- sourced from: EC-Zephyr/ecfwwork/zephyr_modules_csce250x/hal/csce250x/standard_peripheral/include/csce250x_espi.h -->

### eSPI 通道配置参数

CSCE250X 的 eSPI 从机控制器支持 4 个标准通道。以下给出各通道的能力掩码位、工作频率和 I/O 模式配置。

#### 通道能力位掩码

| 通道 | 支持位 | 功能 |
|------|--------|------|
| Peripheral Channel (PER) | `0x00000001` | 外设通道，支持 Memory Read/Write 和 I/O Read/Write |
| Virtual Wire Channel (VW) | `0x00000002` | 虚拟线通道，传送边沿/电平事件信号 (SCI/SMI/RCIN 等) |
| OOB Message Channel (OOB) | `0x00000004` | 带外消息通道，用于系统管理报文传输 |
| Flash Access Channel (FLS) | `0x00000008` | Flash 访问通道，支持 MAFS/SAFS 两种共享模式 |

> 注：以上位掩码用于通用配置寄存器 (GENL_CFG) 中的通道使能/禁用控制。每个通道被使能后，对应的中断事件 (`ESPI_INT_PER_CHN_EN`, `ESPI_INT_VW_CHN_EN` 等) 才会生效。

#### 工作频率配置

| 工作频率 | 寄存器值 |
|----------|----------|
| 20 MHz | `0x00000000` |
| 25 MHz | `0x00100000` |
| 33 MHz | `0x00200000` |
| 50 MHz | `0x00300000` |
| 66 MHz | `0x00400000` |

#### I/O 模式配置

| I/O 模式 | 寄存器值 | 说明 |
|----------|----------|------|
| Single | `0x00000000` | 单线模式，仅使用 I/O[1] |
| Dual | `0x04000000` | 双线模式，使用 I/O[1:0] |
| Quad | `0x08000000` | 四线模式，使用 I/O[3:0] |

#### 通道负载与缓冲区

| 通道 | 最大请求/负载 | 缓冲区类型 |
|------|--------------|------------|
| PER | 64 Byte 请求 / 64 Byte 负载 | RX: `0x00000001`, TX: `0x00000004` |
| OOB | 64 Byte 负载 (选择/支持) | RX: `0x00000001`, TX: `0x00000002` |
| FLS | 64 Byte 请求 / 64 Byte 负载 (选择) / 64 Byte 负载 (支持) | TX_Req: `0x00000008`, TX_Compl: `0x00000004`, RX: `0x00000002` |
| VW | 1-64 组 (每组含多个 Event Wire) | 不适用 (VW 无独立缓冲区) |

#### FLASH 通道共享模式

| 模式 | 寄存器值 | 说明 |
|------|----------|------|
| MAFS (Master-Attached Flash Sharing) | `0x00000000` | 主控通过 eSPI 访问 EC 侧 Flash |
| SAFS (Slave-Attached Flash Sharing) | `0x00000800` | EC 侧 Flash 共享给主控访问 |

| SAFS 块擦除大小 | 寄存器值 |
|-----------------|----------|
| 4 KB | `0x00000400` |
| 32 KB | `0x00002000` |
| 64 KB | `0x00004000` |
| 128 KB | `0x00008000` |

<!-- sourced from: EC-Zephyr/ecfwwork/zephyr_modules_csce250x/hal/csce250x/standard_peripheral/include/csce250x_gpio.h -->

### GPIO 模式配置编码

CSCE250X 的每个 GPIO 引脚可通过模式寄存器独立配置为模拟、输入、输出、或复用功能。以下编码值可直接传入 `gpio_mode_set()` 函数。

| 模式 | 编码值 | 说明 |
|------|--------|------|
| Analog Mode | `0xC0` | 模拟输入/输出模式 |
| Input Floating | `0x00` | 浮空输入 (无上下拉) |
| Input Pull-Up | `0x10` | 上拉输入 |
| Input Pull-Down | `0x20` | 下拉输入 |
| Output Push-Pull | `0x48` | 推挽输出 (无上下拉) |
| Output Push-Pull + PU | `0x58` | 推挽输出 + 上拉 |
| Output Push-Pull + PD | `0x68` | 推挽输出 + 下拉 |
| Output Open Drain | `0x4C` | 开漏输出 (无上下拉) |
| Output Open Drain + PU | `0x5C` | 开漏输出 + 上拉 |
| Output Open Drain + PD | `0x6C` | 开漏输出 + 下拉 |
| Mux Push-Pull | `0x88` | 复用推挽 (无上下拉) |
| Mux Push-Pull + PU | `0x98` | 复用推挽 + 上拉 |
| Mux Push-Pull + PD | `0xA8` | 复用推挽 + 下拉 |
| Mux Open Drain | `0x8C` | 复用开漏 (无上下拉) |
| Mux Open Drain + PU | `0x9C` | 复用开漏 + 上拉 |
| Mux Open Drain + PD | `0xAC` | 复用开漏 + 下拉 |

> 注：编码值的高 4 位表示大类 (Analog=`0xC`, Input=`0x0`, Output=`0x4`/`0x5`/`0x6`, Mux=`0x8`/`0x9`/`0xA`)，低 4 位表示上下拉属性 (`0x0`=无, `0x8`=推挽/无, `0xC`=开漏, `0x10`=PU, `0x20`=PD)。

#### GPIO 复用功能选择

| 复用功能 | 选择值 | 说明 |
|----------|--------|------|
| `GPIO_MF_SEL0` | `0x00` | 复用功能 0 (默认 GPIO 功能) |
| `GPIO_MF_SEL1` | `0x01` | 复用功能 1 |
| `GPIO_MF_SEL2` | `0x02` | 复用功能 2 |
| `GPIO_MF_SEL3` | `0x03` | 复用功能 3 |
| `GPIO_MF_SEL4` | `0x04` | 复用功能 4 |
| `GPIO_MF_SEL5` | `0x05` | 复用功能 5 |
| `GPIO_MF_SEL6` | `0x06` | 复用功能 6 |
| `GPIO_MF_SEL7` | `0x07` | 复用功能 7 |

> 各引脚的复用功能具体对应关系请查阅 CSCE250X 数据手册中的引脚复用表 (Pin Multiplexing Table)。

#### GPIO 其他配置

| 配置项 | 可选值 | 说明 |
|--------|--------|------|
| 输入电压阈值 | `GPIO_VTH_3V3` (`0x00000000`), `GPIO_VTH_1V8` (`0x00000001`) | 选择施密特触发输入电压阈值 |
| 输出驱动电流 | `GPIO_DRIVE_8MA` (`0x00000000`), `GPIO_DRIVE_16MA` (`0x00000001`) | 仅特定引脚支持 (PA0-3, PB0-1, PB7, PE0, PE7, PG1,3-5,7, PH3-4, PO0-5) |

<!-- sourced from: EC-Zephyr/ecfw-zephyr/boards/chipsea/evb_csce250x.h -->

### 板级 SMBus 引脚映射（EVB）

在 EVB 评估板上，多个 SMBus 控制器的时钟/数据引脚通过 GPIO 多路复用实现。以下为默认引脚定义。

| SMBus | 时钟引脚 | 数据引脚 | 说明 |
|-------|----------|----------|------|
| SMB1 (EC_SMB1) | `EC_GPIO_C01` | `EC_GPIO_C02` | SMBus 1，用于电池/充电器通信 |
| SMB (主, EC_SMB) | `EC_GPIO_F02` | `EC_GPIO_F03` | 主 SMBus，用于与 PCH/SoC 通信 |
| SMB2 (EC_SMB2) | `EC_GPIO_F06` | `EC_GPIO_F07` | SMBus 2，用于温度传感器/辅助设备 |

> 注：`EC_GPIO_PORT_PIN(port, pin)` 宏将端口号与引脚号编码为统一的 `gpio_index`。例如 `EC_GPIO_C01` 对应 `EC_GPIO_PORT_PIN(2, 1)`，即 GPIOC 组的 PIN_1。

#### GPIO 端口索引参考

| 端口字母 | 端口索引 | 端口字母 | 端口索引 |
|----------|----------|----------|----------|
| GPIOA | 0 | GPIOH | 7 |
| GPIOB | 1 | GPIOI | 8 |
| GPIOC | 2 | GPIOJ | 9 |
| GPIOD | 3 | GPIOK | 10 |
| GPIOE | 4 | GPIOL | 11 |
| GPIOF | 5 | GPIOM | 12 |
| GPIOG | 6 | GPION | 13 |

<!-- sourced from: EC-Zephyr/ecfw-zephyr/boards/chipsea/evb_csce250x.h -->

### EVB 核心 GPIO 功能定义

EVB 评估板上关键信号的 GPIO 映射关系，以下列出电源管理、eSPI、键盘和电池相关引脚。

#### 电源管理信号

| 信号名称 | GPIO 引脚 | 方向 | 说明 |
|----------|----------|------|------|
| `PM_PCH_PWROK` | `EC_GPIO_B02` | 输出 | 通知 PCH 电源就绪 |
| `PM_PWRBTN` | `EC_GPIO_B04` | 输出 | 向 PCH 发送电源按钮信号 |
| `PM_RSMRST` | `EC_GPIO_F04` | 输出 | 恢复电源就绪 (Resume Reset) |
| `ALL_SYS_PWRGD` | `EC_GPIO_J04` | 输入 | 系统全部电源就绪指示 |
| `ALL_SYS_PWRGD_PMIC` | `EC_GPIO_D03` | 输入 | PMIC 侧全部电源就绪 |
| `VDD2_PWRGD` | `EC_GPIO_F01` | 输入 | VDD2 电源轨就绪 |
| `VCCIO_PWRGD` | `EC_GPIO_H00` | 输入 | VCCIO 电源轨就绪 |
| `SCVR_PWRGD` | `EC_GPIO_A07` | 输入 | SCVR 电源就绪 |
| `EC_VR_EN` | `EC_GPIO_E04` | 输出 | EC 电压调节器使能 |
| `VDD1_EN_EC` | `EC_GPIO_C04` | 输出 | VDD1 电源使能 |
| `AUXON` | `EC_GPIO_D05` | 输出 | 辅助电源开启 |
| `MAINON` | `EC_GPIO_H02` | 输出 | 主电源开启 |
| `AC_IN` / `AC_PRESENT` | `EC_GPIO_B00` / `EC_GPIO_J05` | 输入/输出 | 交流电源插入检测 / AC 存在指示 |
| `EC_PWRBTN_IN` | `EC_GPIO_B03` | 输入 | EC 电源按钮输入 |
| `LID_SW_IN` | `EC_GPIO_B01` | 输入 | 笔记本上盖开关 (Lid Switch) |

#### eSPI 与平台信号

| 信号名称 | GPIO 引脚 | 方向 | 说明 |
|----------|----------|------|------|
| `ESPI_RESET_MAF` | `EC_GPIO_D02` | 输出 | eSPI 复位 (MAF) |
| `H_PROCHOT_N` | `EC_GPIO_D04` | 输出 | 处理器过热信号 |
| `PCH_SI` | `EC_GPIO_G04` | 输入 | eSPI 从入 (Slave In) |
| `PCH_SO` | `EC_GPIO_G05` | 输出 | eSPI 从出 (Slave Out) |
| `PCH_SCK` | `EC_GPIO_G07` | 输入 | eSPI 时钟 |
| `PCH_SCE0_N` | `EC_GPIO_G03` | 输入 | eSPI 片选 0 |

#### 键盘接口

| 信号名称 | GPIO 引脚 | 说明 |
|----------|----------|------|
| `KSO0` ~ `KSO7` | `EC_GPIO_K00` ~ `EC_GPIO_K07` | 键盘扫描输出线 0-7 |
| `KSO8` ~ `KSO15` | `EC_GPIO_L00` ~ `EC_GPIO_L07` | 键盘扫描输出线 8-15 |
| `KSI0` ~ `KSI7` | `EC_GPIO_N00` ~ `EC_GPIO_N07` | 键盘扫描输入线 0-7 |

#### 电池与充电

| 信号名称 | GPIO 引脚 | 方向 | 说明 |
|----------|----------|------|------|
| `Read_BAT_IN` | `EC_GPIO_D00` | 输入 | 电池在位检测 (MBAT_PRES_N) |
| `MBATLED_WHITE` | `EC_GPIO_C00` | 输出 | 电池指示灯 (白色) |
| `MBATLED_ORANGE` | `EC_GPIO_G01` | 输出 | 电池指示灯 (橙色) |
| `CHARGER_IADP_R` | `EC_GPIO_I02` | 输入 | 充电器适配器电流检测 |
| `CHARGER_IDCHG_R` | `EC_GPIO_I04` | 输入 | 充电器放电电流检测 |

---

以上硬件定义均提取自 EC-Zephyr 实际源码，如需最新信息请直接查阅对应 HAL 驱动与 BSP 文件。

### 源文件定位速查

| 需要查找的内容 | 对应源文件 |
|---------------|-----------|
| GPIO 基地址寄存器 (`GPIOA_REG_BASE` 等) | `EC-Zephyr/ecfwwork/zephyr_modules_csce250x/hal/csce250x/standard_peripheral/include/csce250x_reg_gpio.h` |
| GPIO 模式编码 (`GPIO_MODE_*`) | `EC-Zephyr/ecfwwork/zephyr_modules_csce250x/hal/csce250x/standard_peripheral/include/csce250x_gpio.h` |
| I2C 基地址寄存器 (`I2C0_REG_BASE` 等) | `EC-Zephyr/ecfwwork/zephyr_modules_csce250x/hal/csce250x/standard_peripheral/include/csce250x_reg_i2c.h` |
| eSPI 基地址与配置常量 | `EC-Zephyr/ecfwwork/zephyr_modules_csce250x/hal/csce250x/standard_peripheral/include/csce250x_reg_espi.h` 及 `csce250x_espi.h` |
| USART、RCC、EXTI 等外设基地址 | `EC-Zephyr/ecfwwork/zephyr_modules_csce250x/hal/csce250x/standard_peripheral/include/csce250x_reg_*.h` |
| 中断向量表 (IRQn_Type 枚举) | `EC-Zephyr/ecfwwork/zephyr_modules_csce250x/hal/csce250x/cmsis/csce250x/include/csce250x.h` |
| EVB 板级引脚定义 (EC_GPIO_*) | `EC-Zephyr/ecfw-zephyr/boards/chipsea/evb_csce250x.h` |
| EC GPIO 端口引脚宏 (`EC_GPIO_PORT_PIN`) | `EC-Zephyr/ecfw-zephyr/boards/chipsea/csce250x_pin.h` |
