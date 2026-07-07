# 创建新的 EC 板级

## 概述

本文档描述创建新 EC 板级所需的高级步骤。如果基于现有的底板（Baseboard）创建新板级，可以直接跳到"配置 EC 功能"部分，关注已知的板级变更。

## 规范

### 关键文件

开始之前，需要理解 EC 代码库中几个关键文件的作用：

- **`include/config.h`** — 包含 Chrome EC 代码库的顶层配置选项列表。每个配置选项都有内联文档，是权威定义。

- **`baseboard/<name>/`** — 此目录包含底板系列所有板级共享的头文件和源文件。
    - `baseboard.h` — 包含底板系列所有设备共享的 EC 配置选项。
    - `baseboard.c` — 包含底板系列所有设备共享的代码。
    - `build.mk` — 底板系列 Makefile，指定编译到所有板级的 C 源文件。

- **`board/<board>`** — 此目录中的文件仅为单个板级构建。
    - `board.h` — 单个板级特有的 EC 配置选项。
    - `board.c` — 仅在此板级上构建的代码。
    - `build.mk` — 板级 Makefile，定义 EC 芯片系列、底板名称，并指定要编译的 C 源文件。
    - `gpio.inc` — 此 C 头文件定义 EC 芯片上所有引脚的中断、GPIO 和复用功能选择。
    - `ec.tasklist` — 此 C 头文件定义板级上启用的任务列表。

### GPIO 命名

通用 EC 代码中的许多驱动和库依赖于板级变体定义精确的 GPIO 信号名称。例如 `GPIO_LID_OPEN`、`GPIO_ENTERING_RW` 和 `GPIO_SYS_RESET_L` 信号。原理图中的网络名称通常与这些名称不完全匹配。

最佳实践是：`gpio.inc` 中所有 `GPIO_INT()`、`GPIO()`、`ALTERNATE()` 和 `UNIMPLEMENTED()` 定义使用原理图网络名称，然后在 `board.h` 中创建 `#define` 宏将网络名称映射到 EC 通用名称。

以下是 SYS_RESET_L 信号的示例配置。该信号的原理图网络名称为 EC_RST_ODL，信号连接到 EC 芯片引脚 GPIO02：

```c
/* gpio.inc */
GPIO_INT(EC_RST_ODL, PIN(0, 2), GPIO_INT_BOTH, signal_interrupt)

/* board.h */
#define GPIO_SYS_RESET_L GPIO_EC_RST_ODL
```

## 如何使用本文档

## 创建新的 EC 条级

### 创建新的参考板级

1. 在 `baseboard/` 下创建底板目录（如果需要新的底板系列）
2. 在 `board/` 下创建板级目录
3. 创建必要的文件：`board.h`、`board.c`、`build.mk`、`gpio.inc`、`ec.tasklist`

## 配置 EC 功能

以下是正确运行 Chromebook 所需配置的 EC 功能清单。"上电必需"列标示了板级 bringup 期间的关键功能。

| EC 功能 | 上电必需 |
|---------|---------|
| 配置 EC 芯片组 | 是 |
| 配置 AP 与 EC 通信 | 是 |
| 配置 AP 电源阈值 | 是 |
| 配置 AP 电源时序 | 是 |
| 配置 USB-A | 否 |
| 配置 USB-C | 是 |
| 配置充电器 | 是 |
| 配置 I2C 总线 | 是 |
| 配置 GPIO | 是 |
| 配置休眠 | 否 |
| 配置电池 | 否 |
| 配置 CrOS 板级信息（CBI） | 否 |
| 配置键盘 | 否 |
| 配置 LED | 否 |
| 配置运动传感器 | 否 |
| 配置 BC1.2 充电检测 | 否 |
| 配置 ADC | 否 |
| 配置温度传感器 | 否 |
