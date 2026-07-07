# Zephyr 嵌入式控制器（Zephyr EC）

## 简介

大约从 2021 年 7 月开始，Chromebook 从原始的 Google Chrome EC 切换到基于 [Zephyr Project RTOS](https://zephyrproject.org/) 的应用。

两种实现的术语：

- **原始 Chrome EC**：ECOS、cros-ec、Legacy EC
- **基于 Zephyr 的 EC**：Zephyr EC

## 快速上手

- **Zephyr 构建**文档详细介绍了 Google 的元构建工具 `zmake` 的用法，用于配置和构建 Zephyr EC 二进制文件。如果只需要为现有板级构建 Zephyr EC 二进制文件，从这里开始。
- **项目配置**文档详细介绍了创建新的 Chromebook 程序（参考板级）和创建新项目变体所需的步骤。
- **Zephyr 新板级清单**链接到配置各个 EC 功能所需的文档。
- **Zephyr 故障排除**页面列出了使用 Zephyr 时的常见错误和故障排除技术。

## 源码组织

Zephyr EC 镜像依赖多个 Chromium 仓库来构建：

- `third_party/zephyrproject/zephyr` — Google 的上游 Zephyr RTOS 源码本地镜像
- `platform/ec` — 包含 Legacy EC 和 Zephyr EC 共享代码的本地仓库

### 共享代码

两种 EC 实现目前共享大量代码，位于以下目录中（所有路径相对于 Chrome EC 基目录 `platform/ec`）：

- **`common/`** — 跨板级和 EC 实现共享的上层代码，包括：
    - 电池充电
    - USB Power Delivery
    - AP 芯片组电源时序
    - Motionsense（EC 传感器支持）
    - 键盘处理
    - Verified Boot 支持

- **`driver/`** — 由 EC 控制的板上外围设备底层驱动。不包括直接集成到 EC 芯片组中的驱动（如 GPIO 控制器、I2C 控制器、键盘控制器）。板上外围设备驱动包括：
    - 充电控制器
    - USB PD 芯片（TCPC、PPC、MUX 等）
    - 温度传感器
    - 运动传感器（加速度计、陀螺仪、光传感器等）

- **`include/`** — `common/` 和 `driver/` 代码的头文件

以下 Legacy EC 目录**不被** Zephyr EC 应用使用：

- `baseboard/`
- `board/`
- `chip/`
- `core/`

### Zephyr 子目录

只有 Zephyr EC 应用使用 `platform/ec` 仓库下的以下目录：

- `zephyr/`

`zephyr/` 下的子目录概述：

| 目录 | 说明 |
|------|------|
| `zephyr/app/` | Zephyr EC 应用入口点。Zephyr 内核初始化所有服务和芯片级驱动后调用 `ec_app_main()` |
| `zephyr/boards/` | EC 芯片级支持。此目录和组织方式由 Zephyr 构建系统要求 |
| `zephyr/cmake/` | CMake 构建系统的配置文件 |
| `zephyr/drivers/` | 符合 Zephyr 设备模型的驱动，实现 Chrome EC 特定功能 |
| `zephyr/dts/` | 尚未上游的 Google Zephyr 驱动的设备树描述文件 |
| `zephyr/emul/` | 尚未上游的模拟器源代码 |
| `zephyr/include/` | `zephyr/` 子目录文件的头文件 |
| `zephyr/linker/` | 用于构建 Zephyr EC 二进制文件的链接器指令文件 |
| `zephyr/program/` | 每个 Zephyr 支持程序的特定配置 |
| `zephyr/shim/` | 将 Legacy EC API 适配到等效 Zephyr OS API 的源代码 |
| `zephyr/subsys/` | 将移至上游的子系统代码暂存区 |
| `zephyr/tests/` | 基于宿主机的模拟测试 |
| `zephyr/zmake/` | `zmake` 元工具的源代码 |

> **参考来源**：Chromium EC 文档 (`chromium.googlesource.com/chromiumos/platform/ec`)
