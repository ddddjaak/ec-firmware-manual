# EC 中 USB-C 供电与 Alt Mode 的实现

USB-C 是一种灵活的连接器，支持多种数据速率、协议和双向供电。当一个新的 USB-C 连接建立时，通过配置通道（CC）端口上的上下拉电阻来协商谁是供电方（Source）谁是受电方（Sink）。USB PD 消息可用于启用 Alt Mode（如 DisplayPort）和发送结构化厂商自定义消息（SVDM）。

USB PD 在系统层面需要复杂的状态机，因为 PD 可以在多种不同模式下运行，包括：

- 协商电力合约。连接的任一端都可以作为 Source 或 Sink，最高支持 100W。
- 反转线缆模式。这需要在信号到达 SoC（或 AP）之前通过 MUX 切换。
- 调试配件模式，如 Case Closed Debugging（CCD）。
- 差分信号对的多种用途：
    - USB SuperSpeed 模式（最多 4 通道 USB 数据）
    - DisplayPort Alt Mode（最多 4 通道 DP 数据）
    - Dock 模式（2 通道 USB + 2 通道 DP）
    - Thunderbolt 3 Alt Mode（4 通道 TBT3 数据）
    - 音频配件模式（1 通道用于左右声道模拟音频）
    - USB4（4 通道 USB 数据，使用不同于 USB 3.2 的信令）

## 术语表

- **PD（Power Delivery）** — USB-C 连接器上的供电协议，最高支持 100W。不支持 USB-A 或 USB-B 连接器。

- **TCPC（Type-C Port Controller）** — Type-C 端口控制器。通常是通过 I2C 连接的独立 IC，有时嵌入 EC 内部。TCPC 解释 CC 线和 VBUS 上的物理层信号，并将信息发送给 TCPM 以决定采取什么操作。

- **TCPM（Type-C Port Manager）** — Type-C 端口管理器。管理 USB-C 连接的状态，决定状态转换。这是运行在 EC 上的代码。

- **PE（Policy Engine）** — 策略引擎。根据 TypeC 规范，策略引擎是决定 USB-C 连接如何在不同状态之间转换以及哪些 USB-C PD 功能可用的状态机。

- **TC（Type-C physical layer）** — Type-C 物理层。

- **PPC（Power Path Controller）** — 电源路径控制器。可选的独立 IC，隔离各种 USB-C 信号与板上其他部分。该 IC 应防止 VBUS 短路和过流/过压情况。

- **SSMUX（SuperSpeed Mux）** — 超高速多路复用器。通常与 TCPC 集成在同一 IC 中；使 USB-C 线缆的镜像方向连接到 SoC 上正确的引脚。还允许超高速信号用于不同用途，如 USB 数据或 DisplayPort。

- **SVDM（Structured Vendor Defined Messages）** — 结构化厂商自定义消息。一类 USB PD 消息，用于端口伙伴之间的非供电相关通信。SVDM 用于协商和设置 USB-C 连接上的 DisplayPort 模式。

- **DRP（Dual Role Power Port）** — 双角色电源端口。可以作为供电方或受电方的 USB-C 端口。

- **UFP（Upstream Facing Port）** — 上行端口。典型的外设 USB 数据角色（如 HID 键盘）。

- **DFP（Downstream Facing Port）** — 下行端口。典型的主机 USB 数据角色（如运行 ChromeOS 的设备）。

- **E-Mark（Electronically Marked Cable）** — 电子标记线缆。包含嵌入式芯片的 USB-C 线缆，用于标识线缆的能力。

- **VCONN（Connector Voltage）** — 连接器电压。为 E-Mark 线缆和其他配件功能供电的专用电源轨。VCONN 复用 CC1/CC2 信号之一，提供 5V、1W 的电力。

- **VDM（Vendor-Defined Message）** — 厂商自定义消息。一种 PD 数据消息，其内容可针对特定厂商或从属规范。TCPM 主要使用 VDM 来发现 Alt Mode 支持并进入 Alt Mode。

## 不同的 PD 协议栈

目前 platform/ec 有两种不同的 USB-C PD 协议栈实现：

1. **旧实现**：主要包含在 `usb_pd_protocol.c` 和 `usb_pd_policy.c` 中
2. **新实现**：位于 `common/usbc` 目录下，分为多个文件和状态机：
    - 设备策略管理器文件：`usb_pd_dpm.c`、`usb_mode.c`、`*_alt_mode.c`
    - 策略引擎状态机文件：`usb_pe_*_sm.c`
    - 协议引擎状态机文件：`usb_prl_*_sm.c`
    - 状态机框架文件：`usb_sm.c`
    - Type-C 物理层状态机文件：`usb_tc_*_sm.c`
    - USB-C PD 任务文件：`usbc_task.c`

旧实现支持 Chromebook 之外的设备类型固件。要使用新的 USB-C PD 协议栈实现，请参考 TCPMv2 文档。

## 实现注意事项

在新旧两种实现中，以下细节适用：

- 每个 USB-C 端口必须有两个任务：`PD_C#` 和 `PD_INT_C#`，其中 `#` 是从 `0` 开始的端口编号。
    - `PD_C#` 任务运行状态机，与 TCPC、MUX 和 PPC 通信。此任务需要较大的任务栈。
    - `PD_INT_C#` 任务以更高优先级运行，其唯一职责是以最快速度接收来自 TCPC 的中断，然后向其他任务（包括 `PD_C#`）发送适当的消息。

- 在 EC 跳转之间保存 PD 状态：
    - PD 通信在锁定的 RO 镜像中禁用。当从 RO 到 RW 的跳转较快时，RW 接管并协商更高 PD 合约不会有太大问题。
    - 为支持无电池的工厂用例，PD 通信在未锁定的 RO 中启用。
    - 在 RO → RW 和 RW → RO 跳转之间保存和恢复 PD 状态，以在整个跳转和重新初始化过程中维持较高的协商电力。

## 配置

`board.h` 和 `board.c` 实现中需要许多 `CONFIG_*` 选项和驱动结构体。

### TCPC 配置

`board.c`（或底板等效文件）中定义的 `tcpc_config_t` 结构体的 `tcpc_config` 数组应为每个板级定义。数组中的索引对应 USB-C 端口编号。此结构体应指向对应端口上使用的 TCPC 驱动。TCPC 的 I2C 端口和地址也在此指定。

### SSMUX 配置

`board.c` 中定义的 `usb_mux` 结构体的 `usb_muxes` 数组应为每个板级定义。通常标准的 `tcpci_tcpm_usb_mux_driver` 驱动适用，特别是当 TCPC 和 MUX 是同一 IC 时。

如果需要为特定硬件布局调整高速数据线的信号强度，`usb_mux` 上的 `board_init` 字段在每次 MUX 从低功耗状态唤醒时被调应用于设置自定义板级调优参数。

### PPC 配置

某些板级有一个额外的 IC 位于物理 USB-C 连接器和板上其他部分之间。PPC IC 根据 I2C 设置或 GPIO 引脚控制 VBUS 线是输入还是输出信号。PPC 通常还提供过压和过流保护。

### 常用配置选项

许多 USB-C 策略和功能由各种 `CONFIG_*` 选项控制，应在 `board.h` 中定义。大多数 USB-C 选项以 `CONFIG_USB_PD_` 或 `CONFIG_USBC_` 开头。
