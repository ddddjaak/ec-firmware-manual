<div class="chapter-header"><span class="chapter-num">03</span><span class="separator">/</span><a href="index.md">首页</a><span class="separator">›</span><span>开发包架构概述</span></div>

# 开发包架构概述


Chipsea Zephyr 开发包是基于 Zephyr RTOS 3.7.0（LTS）和 CSCE250X 系列芯片的 EC 固件框架，核心目标：

- 开箱即用：集成完整 BSP 与参考工程，客户可直接编译运行；
- 模块化架构：功能模块独立，便于裁剪与扩展；
- 统一配置体系：基于 Zephyr 设备树（DTS）与 Kconfig，硬件适配简单；
- 降低开发门槛：客户只需专注上层业务逻辑。

## 架构分层模型

开发包采用四层分层设计：

```
+----------------------------------------------------+
|  应用层 (Application)                                |
|  电源管理、键盘控制、热管理、充电、PD、外设管理、调试   |
+----------------------------------------------------+
|  服务层 (Services)                                   |
|  任务调度、消息队列、事件通知、日志、OTA              |
+----------------------------------------------------+
|  驱动层 (Drivers)                                    |
|  GPIO, I2C, SPI, UART, ADC, PWM, KSCAN, eSPI, PECI  |
|  Charger, Fan, Timer, RTC, Power Seq, PS/2, USB, LED |
+----------------------------------------------------+
|  硬件层 (Hardware)                                   |
|  CSCE250X MCU (ARM Cortex-M33)                       |
+----------------------------------------------------+
```

- 应用层：实现 EC 业务逻辑，包含电源管理、键盘主机接口、热管理、电池/充电、PD 管理、外设管理、调试等 13 个子模块；
- 服务层：基于 Zephyr 内核封装的任务调度、消息系统、日志框架和 OTA 升级机制；
- 驱动层：基于 Zephyr 设备驱动模型，对 CSCE250X 片上外设进行抽象封装，涵盖通用接口驱动（GPIO、I2C、SPI、USB 等）和 EC 专用驱动（键盘扫描、风扇、eSPI、PECI 等），共 18 个模块；
- 硬件层：CSCE250X 芯片本身，含 ARM Cortex-M33 内核及片上外设。

> 各模块的详细功能与使用方法见 [固件功能模块说明](ch4_固件功能模块说明.md)。

## 与传统 EC 固件的差异

| 维度 | 传统 EC 固件 | Chipsea Zephyr 开发包 |
|------|-------------|----------------------|
| 系统基础 | 裸机或轻量 RTOS + 自研驱动 | Zephyr RTOS 3.7.0 LTS |
| 可移植性 | 与硬件强耦合，迁移成本高 | DTS 解耦硬件，一套代码适配多平台 |
| 配置方式 | 宏定义 / 硬编码 | DTS + Kconfig 统一配置 |
| 可维护性 | 私有代码，团队交接成本高 | 对齐 Zephyr 社区标准，易于升级 |
| 上手难度 | 需深入理解芯片与私有框架 | 开箱即用，专注业务逻辑 |

## 开发包目录结构

整个开发环境由三个工程目录组成，其关系如下：

```
工作区根目录
├── ecfw-zephyr/          ← 主工程（应用与驱动代码，日常开发主要在此）
├── ecfwwork/
│   ├── zephyr_fork/              ← Zephyr 内核源码（只读，勿改）
│   ├── modules/                  ← Zephyr 模块（crypto、fs、cmsis）
│   └── zephyr_modules_csce250x/  ← Chipsea SDK（BSP、HAL、SoC）
```

### ecfw-zephyr —— 主工程

日常开发的主要工作目录，结构如下：

```
ecfw-zephyr/
├── app/          ← 应用层（13 个功能子模块）
├── boards/       ← 板级支持包（DTS、pinmux、时钟配置）
├── drivers/      ← 外设驱动（18 个驱动模块）
├── include/      ← 公共头文件与 API 声明
├── lib/          ← 通用库（算法、协议栈）
├── linker/       ← 链接脚本（.ld）
├── misc/         ← 任务管理、Flash 头部、软 Strap
├── samples/      ← 29 个 Demo 工程（ADC、I2C、eSPI 等）
├── scripts/      ← 构建、打包、下载脚本
├── tools/        ← 固件打包工具 + 更新工具
├── prj.conf      ← 工程主配置文件
├── Kconfig       ← 配置菜单入口
├── west.yml      ← 依赖管理
└── CMakeLists.txt
```

| 关键目录 | 用途 |
|----------|------|
| `app/` | 业务逻辑层，移植或开发新功能的主要扩展点 |
| `drivers/` | 外设驱动封装，需新增外设驱动时在此开发 |
| `boards/` | 板级硬件描述（DTS），适配新板卡时修改 |
| `prj.conf` | 功能裁剪与编译选项，定制固件时最常修改 |

### ecfwwork —— 内核与 SDK

该路径下的代码由厂家提供，一般无须改动：

- `zephyr_fork/`：Zephyr 内核源码，提供 RTOS 内核、驱动框架、子系统、构建系统。
- `modules/`：Zephyr 官方模块精简版（crypto、debug、fs、cmsis）。
- `zephyr_modules_csce250x/`：Chipsea 芯片 SDK，以独立模块形式存在，不侵入 Zephyr 源码。包含：
  - `boards/` — 开发板定义（DTS、pinmux、Kconfig）；
  - `drivers/` — 25 个片上外设驱动（GPIO、I2C、SPI、eSPI、PECI 等）；
  - `hal/` — 芯片抽象层（CMSIS、标准外设库、ROM 库）；
  - `soc/` — SoC 初始化与配置代码。

## Legacy EC 与 Zephyr EC 源码对照

Chromium EC 项目在 2021 年从 Legacy EC（裸机 RTOS）迁移到 Zephyr RTOS，两套代码在上游仓库中并行存在。了解两者的目录对应关系有助于阅读上游文档和参考代码。

### 共享目录（Legacy 与 Zephyr 共用）

| 目录 | 职责 |
|------|------|
| `common/` | EC 核心逻辑——系统、主机命令、芯片无关的功能代码（电源管理、LED、充电策略等） |
| `driver/` | EC 硬件无关驱动——键盘矩阵扫描、温度传感器、BC1.2 等 |
| `include/` | 头文件——EC 代码使用的宏、类型、函数声明 |
| `baseboard/` | 底板系列定义——`baseboard.h/c`、`build.mk`、`usb_pd_policy.c` |
| `board/` | 单板定义——`board.h/c`、`build.mk`、`gpio.inc`、`ec.tasklist` |
| `chip/` | 芯片系列代码——芯片寄存器定义、芯片级驱动、初始化和中断处理 |
| `core/` | 核心运行时——启动、任务调度、中断处理、主机命令调度器、闪存更新 |
| `util/` | 独立工具——位操作、字节序、数学工具、控制台历史等 |

### Zephyr 专属目录

| 目录 | 职责 |
|------|------|
| `zephyr/` | Zephyr shim 层——适配 Zephyr 框架的代码（board 目录、drivers、subsys、include 等） |
| `zephyr/boards/` | 硬件定义——board.h、板级 Kconfig、DTS overlay、devicetree 目录、代码片段、扇区布局 |
| `zephyr/drivers/` | 常用驱动——非芯片相关的 EC 驱动、信号驱动、IO 展开、用于模拟和测试的 fake 驱动 |
| `zephyr/subsys/` | 子系统——console、charger、thermal、USBC、firmware、debug 等 |
| `zephyr/test/` | 单元测试——基于 CMocka 的 host-based（native_posix）测试，通过 twister 运行 |
| `zephyr/tests/` | 集成测试——基于 Zephyr ztest 框架的板级测试 |
| `zephyr/lib/` | 通用库——thermal、math 工具、EC 信号模拟、getter/setter |
| `zephyr/include/` | Zephyr 专属头文件 |

### Legacy EC 不再使用的目录

| 目录 | 说明 |
|------|------|
| `arch/` | CPU 架构代码，Zephyr 由 Zephyr 自身处理 |
| `core/` | Legacy 核心运行时，Zephyr 替代 |
| `chip/` | Legacy 芯片驱动，Zephyr 由 `chip/` + `soc/` + `dts/` 替代 |
| `common/` | Legacy 共享代码，Zephyr 由 `common/` + `zephyr/subsys/` 替代 |
| `driver/` | Legacy 共享驱动，Zephyr 由 `driver/` + `zephyr/drivers/` 替代 |
| `include/` | Legacy 头文件，Zephyr 由 `include/` + `zephyr/include/` 替代 |
| `util/` | Legacy 独立工具，Zephyr 由 `util/` + `zephyr/lib/` 替代 |

## 配置体系简介

开发包使用 Zephyr 标准的 Kconfig + 设备树 双轨配置：

- Kconfig：控制功能开关（软件层面）—— 决定哪些模块参与编译；
- 设备树（DTS）：描述硬件连接（硬件层面）—— 决定外设的地址、引脚、速率等参数。

日常开发主要通过 `prj.conf` 启用/关闭功能模块，通过板级 `.dts` 文件调整硬件参数。Kconfig 配置语法、优先级机制与自定义方法详见第5章 [应用开发指南 → Kconfig 配置系统](ch5_应用开发指南.md)。
