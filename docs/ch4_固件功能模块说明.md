# 固件功能模块说明

# 固件功能模块说明

本章详细描述 EC 固件中各功能模块的设计与实现，涵盖状态机、逻辑流程、数据结构和模块间交互。工程共包含 13 个应用子模块及 18 个驱动模块，覆盖电源管理、输入处理、热管理、主机通信、安全加密等核心领域。各模块基于 `app/system/` 提供的基础设施（`ec_dev` 设备抽象、`ec_queue` 消息队列、`ec_structure` 数据结构、`sysevent` 系统事件）构建，通过统一的接口层与驱动层交互。

## 系统基础设施 (System Infrastructure)

`app/system/` 为所有应用模块提供核心基础设施，是固件运行的骨架。四大组件各司其职：

| 组件 | 职责 | 通信模式 |
|------|------|----------|
| `ec_dev` | 设备抽象与 IOCTL 分发 | 同步调用 |
| `ec_queue` | 消息队列与滑动窗口滤波 | 异步消息 |
| `ec_structure` | 通用数据结构与等待工具 | 轮询等待 |
| `sysevent` | 系统事件广播 | 一对多广播 |

### 设备抽象层 (ec_dev)

`ec_dev` 提供统一的设备 IOCTL 接口，上层模块无需直接操作硬件即可完成设备控制。

设备类型枚举（`DEV_TYPE`）共定义 16 种设备：

```c
typedef enum {
    DEV_TYPE_SYS,            // 系统控制
    DEV_TYPE_FPR,            // 指纹识别
    DEV_TYPE_TP,             // 触摸板
    DEV_TYPE_LEGACY_ADAPTER, // 传统适配器
    DEV_TYPE_SENSOR_HUB,     // 传感器集线器
    DEV_TYPE_GPU,            // 图形处理器
    DEV_TYPE_PRODUCT,        // 产品信息
    DEV_TYPE_USBA_CHARGER,   // USB-A 充电器
    DEV_TYPE_POWER_LED,      // 电源 LED
    DEV_TYPE_KB_BACKLIGHT,   // 键盘背光
    DEV_TYPE_KBC,            // 键盘控制器
    DEV_TYPE_FPR_LED,        // 指纹 LED
    DEV_TYPE_LED,            // 通用 LED
    DEV_TYPE_FAN,            // 风扇
    DEV_TYPE_IPCM,           // IPCM 电源监控
    FEA_TYPE_DPD,            // DPD 功能
} DEV_TYPE;
```

每个设备类型对应一套 IOCTL 命令集，命令码编码规则为 `(DEV_TYPE << 16) | sub_cmd`。以键盘背光为例：

| IOCTL 命令 | 含义 |
|------------|------|
| `KBBACKLIGHT_IOCTL_SWITCH` | 切换背光开关 |
| `KBBACKLIGHT_IOCTL_SET_MODE` | 设置背光模式 |
| `KBBACKLIGHT_IOCTL_ON` | 开启背光 |
| `KBBACKLIGHT_IOCTL_SET_COLOR` | 设置背光颜色 |
| `KBBACKLIGHT_IOCTL_POWER_ON` | 背光上电 |
| `KBBACKLIGHT_IOCTL_POWER_OFF` | 背光下电 |

设备描述符结构：

```c
typedef void (*DEV_IOCTL_FUNCTION)(const void *, uint32_t, const void *,
                                    uint32_t, void *, uint32_t);

typedef struct dev {
    DEV_TYPE devType;           // 设备类型
    DEV_IOCTL_FUNCTION Ioctl;   // IOCTL 处理函数
    const void *ctx;            // 设备私有上下文
} DEV, *PDEV;
```

所有设备实例以全局 `const DEV devList[]` 静态数组形式在编译期注册。两个核心接口：

- `device_ioctl(devType, ioctl, input, inputSize, output, outputSize)` — 按类型查找设备并执行 IOCTL，找到匹配设备返回 `true`
- `device_ioctl_traversal(ioctl, input, inputSize, output, outputSize)` — 遍历所有设备，对每个唯一 IOCTL 处理函数执行一次调用（连续重复的处理函数跳过，避免冗余调用）

典型调用模式（以通知所有设备系统电源状态变化为例）：

```c
device_ioctl_traversal(SYS_IOCTL_POWER_STATE, &state, sizeof(state), NULL, 0);
```

### 消息队列封装 (ec_queue)

`ec_queue` 基于 Zephyr `struct k_msgq` 提供滑动窗口移动平均滤波工具，用于平滑传感器读数（如温度、电压、电流）：

| 函数 | 数据类型 | 用途 |
|------|----------|------|
| `get_moving_ave_u8(msgq, data)` | uint8_t | 8 位无符号数据滑动平均 |
| `get_moving_ave_u16(msgq, data)` | uint16_t | 16 位无符号数据滑动平均 |
| `get_moving_ave_s16(msgq, data)` | int16_t | 16 位有符号数据滑动平均 |

每个函数将新数据推入消息队列，计算并返回当前窗口内所有样本的算术平均值。窗口大小由 `struct k_msgq` 初始化时的容量决定，OEM 可根据传感器噪声特性调整。

### 通用数据结构 (ec_structure)

`ec_structure` 提供两个通用的条件等待工具函数：

```c
typedef bool (*WAIT_HANDLER)(const void *);

// 轮询等待：每 cycle_ms 检查一次条件，最多重试 retry 次
bool wait_handler(WAIT_HANDLER handler, int cycle_ms, int retry, const void *ctx);

// 每周期等待：在单个周期内等待条件满足
bool wait_handler_per_cycle(WAIT_HANDLER handler, int cycle_ms, const void *ctx);
```

`WAIT_HANDLER` 是条件检测回调函数指针，返回 `true` 表示条件满足。`wait_handler()` 常用于电源序列中的信号等待——每 `cycle_ms` 毫秒调用一次 `handler`，在 `retry` 次内若返回 `true` 则成功，否则超时。`wait_handler_per_cycle()` 用于单周期内确认信号稳定。

### 系统事件广播机制 (sysevent)

EC 固件基于事件驱动模型实现模块间解耦。`sysevent` 模块是这一机制的核心——当系统状态发生关键变化（如电源状态切换、LID 开合、进入操作系统等），由事件产生方通过 `notify_subsystems()` 将事件广播给所有子系统，各子系统线程在自己周期内独立检查并响应。

事件类型定义（`ec_event` 枚举，采用位掩码设计，每个事件占用独立的 bit 位）：

| 事件 | 位掩码 | 含义 |
|------|--------|------|
| `EC_EVENT_SYSTEM_S5_S0` | BIT(0) | 系统从 S5 上电至 S0 |
| `EC_EVENT_SYSTEM_S0_S5` | BIT(1) | 系统从 S0 关机至 S5 |
| `EC_EVENT_SYSTEM_S3_S0` | BIT(4) | 系统从 S3 唤醒至 S0 |
| `EC_EVENT_SYSTEM_S0_S3` | BIT(5) | 系统从 S0 进入 S3 |
| `EC_EVENT_ENTER_OS` | BIT(6) | 操作系统加载完成（ACPI 模式切换） |
| `EC_EVENT_LID_OPEN` | BIT(7) | LID 开盖事件 |
| `EC_EVENT_LID_CLOSE` | BIT(8) | LID 合盖事件 |
| `EC_EVENT_DISPLAY_OFF` | BIT(9) | 显示屏关闭 |
| `EC_EVENT_DISPLAY_ON` | BIT(10) | 显示屏开启 |
| `EC_EVENT_ENTER_DEEP_SLEEP` | BIT(11) | 系统进入深度睡眠 |
| `EC_EVENT_EXIT_DEEP_SLEEP` | BIT(12) | 系统退出深度睡眠 |
| `EC_EVENT_ITS_MODE_CHANGE` | BIT(13) | 智能散热模式切换 |
| `EC_EVENT_LCD_BL_ON` | BIT(14) | LCD 背光开启 |
| `EC_EVENT_LCD_BL_OFF` | BIT(15) | LCD 背光关闭 |

`struct SysEvent` 包含 10 个 `k_event` 对象，每个子系统拥有独立的事件对象：

```c
struct SysEvent {
    struct k_event event_pd;           // PD 管理
    struct k_event event_power;        // 电源管理
    struct k_event event_charge;       // 充电管理
    struct k_event event_bat;          // 电池管理
    struct k_event event_led;          // LED 控制
    struct k_event event_kb_backlight; // 键盘背光
    struct k_event event_keyboard;     // 键盘
    struct k_event event_fan;          // 风扇
    struct k_event event_thermal;      // 热管理
    struct k_event event_touchpad;     // 触摸板
};
```

广播流程：当电源状态变化（如 S5→S0）时，`notify_subsystems(EC_EVENT_SYSTEM_S5_S0)` 遍历所有 10 个 `k_event` 对象执行 `k_event_post()`，将事件同时发布给所有子系统。各子系统的线程在自己的周期中通过 `k_event_wait()` 非阻塞地检查事件，并执行相应处理逻辑（如 charger 子系统在收到 S0→S5 时进入低功耗模式，fan 子系统在收到 S0→S5 时关闭风扇）。系统启动时由 `init_subsystems_events()` 统一初始化所有 `k_event` 对象。

## SMC 主机接口 (SMC Host Interface)

`app/smchost/` 是实现 EC 与主机 CPU 之间通信的核心模块，包含 24 个源文件，覆盖 ACPI 命令处理、SCI 中断管理、共享内存与电源协调。

### 命令处理流程

主机通过 eSPI Peripheral Channel（模拟传统 LPC I/O 端口 0x62/0x66）向 EC 发送命令。EC 端的 `smchost_acpi_handler()` 负责从 ACPI 接口接收命令字节：

命令接收状态机：
1. 主机写入 Command Port (0x66)，EC 侧检测到 IBF（Input Buffer Full）标志和 CD（Command/Data）标志为命令模式
2. EC 读取命令字节（0x80~0x84），重置长度计数器
3. 后续写入 Data Port (0x62)，CD 标志为数据模式，EC 逐字节累积到 `host_req[]`
4. 当接收长度达到该命令的预期长度时（由 `smchost_req_length()` 查询），调用 `smchost_cmd_handler()` 分发

ACPI 标准命令码：

| 命令码 | 宏名称 | 功能 |
|--------|--------|------|
| 0x80 | `SMCHOST_ACPI_READ` | 从 EC 空间读取数据 |
| 0x81 | `SMCHOST_ACPI_WRITE` | 向 EC 空间写入数据 |
| 0x82 | `SMCHOST_ACPI_BURST_MODE` | 进入 ACPI Burst 模式（高速连续读写） |
| 0x83 | `SMCHOST_ACPI_NORMAL_MODE` | 退出 Burst 模式 |
| 0x84 | `SMCHOST_ACPI_QUERY` | 查询待处理事件（返回 SCI 事件码） |

命令分发采用 switch-case 结构：标准 ACPI 命令分派到对应的读/写/burst 处理函数，自定义命令（如 `ACPI_CMD_EC_UPDATE`）触发厂商特定逻辑（如固件更新流程）。

### SCI 中断管理

SCI（System Control Interrupt）是 EC 通知主机有事件需处理的标准机制。EC 维护一个 SCI 事件队列，当 EC 检测到需要通知主机的事件时（如电池状态变化、LID 开合、热事件），将对应的 SCI 码入队并触发 eSPI Virtual Wire 上的 SCI 信号。

系统定义了 40+ 个 SCI 事件码（`scicodes.h`），部分关键事件：

| SCI 码 | 宏名称 | 触发条件 |
|--------|--------|----------|
| 0x09 | `SCI_Thermal_Event` | 温度超过告警阈值 |
| 0x0A | `SCI_Adapter_Status` | AC 适配器插拔 |
| 0x0B | `SCI_Battery_Status` | 电池状态变化 |
| 0x0C | `SCI_LID_Close` | LID 合盖 |
| 0x0D | `SCI_LID_Open` | LID 开盖 |
| 0x10 | `SCI_PB_Press` | 电源键按下 |
| 0x11 | `SCI_PB_Release` | 电源键释放 |
| 0x62 | `SCI_FNLK_On` | FnLock 开启 |
| 0x63 | `SCI_FNLK_Off` | FnLock 关闭 |
| 0x84 | `SCI_GPU_STATE_CHANGE` | GPU 状态变化 |

### 线程运行模式

`smchost_thread` 支持两种运行模式，通过 `CONFIG_SMCHOST_EVENT_DRIVEN_TASK` 控制：

- 事件驱动模式：线程通过 `k_sem_take(&acpi_lock, K_FOREVER)` 阻塞等待。当 eSPI ACPI 事件（IBF 触发）或按钮事件发生时，调用 `smchost_signal_request()` 释放信号量唤醒线程。线程唤醒后循环调用 `smchost_process_tasks()` 处理所有待处理操作，直到无活动后再进入阻塞。此模式功耗更低，是推荐配置。

- 周期轮询模式：线程以固定周期（通过 `k_msleep(period)`）轮询 ACPI 接口状态。适用于不支持事件驱动唤醒的调试场景。

### 关键事件处理

LID 处理（`smchost_lid_handler()`）：开盖时设置 `Lid_Act` 标志，清除键盘禁用标志，通知子系统 LID 打开事件，启用键盘控制器，入队 SCI_LID_Open 事件，若系统在 S3 则生成唤醒信号。合盖时执行反向操作。

平台复位处理（`smchost_pltrst_handler()`）：当检测到 PLT_RST 信号变化时，清除键盘状态标志，刷新 SCI 队列。若为复位动作，启动 PECI 访问延迟定时器（PECI 在启动阶段不稳定，需延迟访问）。同时管理 PLN 信号用于 M.2 SSD 复位准备。

CS 低功耗处理（`smchost_cs_lp_handler()`）：处理 Modern Standby（Connected Standby）的进入和退出。进入低功耗时通知子系统并切换 OLED 状态；退出时恢复。

### 共享内存窗口

EC 通过 eSPI Memory Channel 将指定 SRAM 区域映射到主机内存空间。CSCE250X 支持两个共享内存窗口，通过 Kconfig 配置：

- `CONFIG_CSCE250X_PERIPHERAL_ACPI_SHD_MEM_ADDRESS`：ACPI 共享内存窗口（默认 `0x2002F000`），用于 ACPI 命令/数据交换
- `CONFIG_CSCE250X_PERIPHERAL_HOST_SHD_MEM_ADDRESS`：主机命令共享内存窗口（默认 `0x2002F100`），用于自定义主机命令

主机通过访问自身的 PCI 地址空间即可读写这些 EC SRAM 区域，eSPI/LPC Controller 自动转换为 Memory Cycle 映射到 EC。

### 命令接收缓冲区管理

`host_req[]` 是命令接收环形缓冲区，逐字节累积主机发来的命令数据。接收状态由以下变量跟踪：

| 变量 | 用途 |
|------|------|
| `host_req[]` | 命令数据缓冲区（最大 256 字节） |
| `host_req_len` | 当前已接收字节数 |
| `host_req_expected_len` | 预期接收长度（根据命令码查询） |
| `host_req_state` | 接收状态：IDLE / RECV_CMD / RECV_DATA / COMPLETE |

当 `host_req_len == host_req_expected_len` 时，接收完成，调用 `smchost_cmd_handler()` 分派到对应的命令处理函数。每处理完一条命令后缓冲区自动复位到 IDLE 状态，等待下一条命令。

### OEM 自定义命令扩展

除标准 ACPI 命令（0x80-0x84）外，OEM 可通过以下步骤添加自定义命令：

1. 在 `smchost_acpi_command.h` 中定义新命令码（如 `ACPI_CMD_OEM_FEATURE = 0x90`）
2. 在 `smchost_req_length()` 中注册该命令的预期数据长度
3. 在 `smchost_cmd_handler()` 的 switch-case 中添加 case 分支
4. 实现处理函数（如 `oem_feature_handler()`），读取 `host_req[]` 中的参数并执行操作

常见 OEM 自定义命令包括固件更新触发（`ACPI_CMD_EC_UPDATE`）、工厂模式设置、OEM 诊断接口等。

### eSPI Peripheral Channel 与 LPC 端口映射

eSPI Peripheral Channel 通过 Memory Cycle 模拟传统 LPC I/O 端口访问。对于主机侧代码而言，仍然读写 I/O 端口 0x62/0x66，eSPI Controller 自动转换为 Peripheral Channel 事务：

| LPC I/O 端口 | eSPI Peripheral 事务 | 方向 | 用途 |
|-------------|---------------------|------|------|
| 0x60 | KBC Data Read (OPCODE=0x04) | EC→Host | 键盘数据输出 |
| 0x62 | ACPI Data (OPCODE=0x02) | 双向 | ACPI 数据端口 |
| 0x64 | KBC Command/Status (OPCODE=0x04) | 双向 | 键盘命令/状态 |
| 0x66 | ACPI Command/Status (OPCODE=0x02) | Host→EC | ACPI 命令端口（含 IBF/CD 标志） |
| 0x80 | POST Code (OPCODE=0x06) | Host→EC | Port80 调试码写入 |

这种映射对主机 OS 完全透明——OS 侧 ACPI 驱动无需修改，直接使用标准的 LPC I/O 端口访问即可。

## eSPI Hub (eSPI Driver)

`drivers/espi/espi_hub.c` 是 EC 与主机 PCH 之间 eSPI 总线的底层驱动封装，为上层的 SMC 主机接口、ERPMC、Port80、键盘控制器等提供统一的 eSPI 通道访问能力。

### eSPI 四通道架构

eSPI 协议定义了四个逻辑通道，各司其职：

| 通道 | 方向 | 典型用途 | CSCE250X 实现 |
|------|------|----------|---------------|
| Peripheral | 双向 | ACPI 命令（0x62/0x66）、KBC 键盘、POST Code | `MAX_ACPI_HANDLERS = 5`、`MAX_PERIPH_HANDLERS = 2` |
| Virtual Wire | 双向 | 边带信号（SLP_S3/S4/5、PLT_RST、SCI信号、SMI信号 等） | 通过 VW ISR 实时响应 |
| OOB (Out-of-Band) | 双向 | MCTP 加密消息（ERPMC）、PCH 温度查询 | `CONFIG_ESPI_OOB_CHANNEL_RX_ASYNC` 异步接收 |
| Flash | 从→主 | EC 访问共享 SPI Flash（通常用于系统固件更新） | `espihub_write_flash()` / `read_flash()` / `erase_flash()` |

### 回调注册体系

eSPI Hub 采用"注册回调"模式解耦底层 eSPI 事件与上层业务逻辑。上层模块通过注册回调函数订阅特定事件：

**ACPI 处理器**（最多 5 个，通过 `espihub_add_acpi_handler()` 注册）：

| 处理器类型 | 用途 |
|-----------|------|
| `ESPIHUB_ACPI_PUBLIC` | 标准 ACPI 命令（0x80~0x84） |
| `ESPIHUB_ACPI_PRIVATE_0` ~ `_3` | OEM 自定义 ACPI 命令通道 |

典型注册代码：
```c
espihub_add_acpi_handler(ESPIHUB_ACPI_PUBLIC, smchost_acpi_handler);
```

**状态与警告处理器**（通过 `espihub_add_state_handler()` / `espihub_add_warn_handler()` 注册）：

| 处理器 | 触发条件 |
|--------|----------|
| `ESPIHUB_RESET_WARNING` | eSPI 复位警告 |
| `ESPIHUB_PLATFORM_RESET` | 平台复位（PLTRST#） |
| `ESPIHUB_SUSPEND_WARNING` | 挂起警告 |
| `ESPIHUB_DNX_WARNING` | Download & Execute 模式警告 |
| `ESPIHUB_BUS_RESET` | eSPI 总线复位完成 |

**KBC 处理器**（通过 `espihub_add_kbc_handler()` 注册）：处理来自主机的键盘控制器命令（如 0xED 设置 LED、0xF2 键盘识别）。

**POST Code 处理器**（通过 `espihub_add_postcode_handler()` 注册）：接收主机 BIOS 在启动阶段写入的 Port80 调试码。

### Virtual Wire 信号管理

Virtual Wire 是 eSPI 的核心机制，用于传输传统 LPC 边带信号。每个 VW 通过 `enum espi_vwire_signal` 编号索引，值为 0（低）或 1（高）。

关键 API：

```c
// 发送/读取单个 VW
int espihub_send_vw(enum espi_vwire_signal signal, uint8_t level);
int espihub_retrieve_vw(enum espi_vwire_signal signal, uint8_t *level);

// 等待 VW 达到期望电平（带超时，单位 100us）
int espihub_wait_for_vwire(enum espi_vwire_signal signal, uint16_t timeout,
                           uint8_t exp_level, bool ack_required);

// GPIO + VW 联合监控（用于检测毛刺或异常退出）
int wait_for_pin_monitor_vwire(uint32_t port_pin, uint32_t exp_sts,
                               uint16_t timeout,
                               enum espi_vwire_signal signal,
                               uint8_t abort_sts);
```

这些 API 是电源序列（等待 SLP_Sx 信号）和主机通信（SCI# 触发）的底层基础。

### OOB 通道

OOB 通道承载 MCTP（Management Component Transport Protocol）消息，用于：
- ERPMC 加密通信（CSME ↔ EC 的安全消息）
- PCH 温度查询

支持异步接收模式（`CONFIG_ESPI_OOB_CHANNEL_RX_ASYNC`），接收回调在中断上下文中触发，将完整 OOB 包交由上层处理：

```c
int espihub_send_oob(struct espi_oob_packet *pckt);
int espihub_retrieve_oob(struct espi_oob_packet *pckt);
```

### eSPI 总线管理

- `espihub_init()` — 初始化 eSPI 控制器，配置各通道能力（支持五档频率：20/25/33/50/66 MHz），注册总线事件回调
- `espihub_reset_status()` — 查询 eSPI 复位状态（asserted / de-asserted）
- `espihub_wait_for_espi_reset(exp_sts, timeout)` — 等待 eSPI 复位到位
- `espihub_dnx_status()` — 查询 Download & Execute 模式状态
- `espihub_boot_mode()` — 返回启动配置模式（用于判断 SPI Flash 共享策略）

### 配置

- `CONFIG_ESPI_OOB_CHANNEL_RX_ASYNC`：启用 OOB 通道异步接收（ERPMC 必须开启）
- `ENABLE_ESPI_LTR`：启用 Latency Tolerance Reporting（LTR），用于电源管理优化
- eSPI 频率：五档离散频率 20/25/33/50/66 MHz，通过 `MIN_ESPI_FREQ` / `MAX_ESPI_FREQ` 限定

## USB 功能模块 (USB Function)

`drivers/usb/` 实现 EC 作为 USB 复合设备与主机交互，主要用于系统固件更新（DFU 模式）和调试接口。

### USB 设备模式

EC 支持两种 USB 角色：

| 模式 | 用途 | 场景 |
|------|------|------|
| USB Device (HID) | EC 键盘/鼠标事件上报 | 传统笔记本键盘 → 主机 |
| USB Device (DFU) | Device Firmware Upgrade | EC 固件烧录与恢复 |

### HID 报文格式

EC 键盘以标准 USB HID Boot Protocol 格式上报按键：

- 报文长度：8 字节（1 字节修饰键 + 1 字节保留 + 6 字节按键码）
- 修饰键字节：BIT0=左Ctrl、BIT1=左Shift、BIT2=左Alt、BIT3=左GUI
- 按键码：USB HID Usage ID 标准（0x04=a、0x1D=z 等）
- 多键同时按下：最多 6 键同时上报（6KRO），超过 6 键时第 6 字节填充 0x01（ErrorRollOver）

### Endpoint 配置

| Endpoint | 方向 | 类型 | 用途 |
|----------|------|------|------|
| EP0 | 双向 | Control | 设备枚举、描述符请求、DFU 命令 |
| EP1 IN | IN | Interrupt | HID 键盘报文上报（bInterval=1ms） |

### 配置

通过 Zephyr USB 设备栈配置，关键 Kconfig 选项：
- `CONFIG_USB_DEVICE_STACK`：USB 设备模式总开关
- `CONFIG_USB_HID_DEVICE`：HID 设备类驱动
- `CONFIG_USB_DFU_CLASS`：DFU 固件更新类

## PS/2 接口模块 (PS/2 Interface)

`drivers/ps2/` 实现传统 PS/2 键盘和 AUX 设备的接口协议，向下兼容使用 PS/2 接口的老款键盘和触摸板。

### PS/2 协议时序

PS/2 使用两根线通信：CLK（时钟）和 DATA（数据），均为开漏输出 + 上拉电阻。数据传输由设备（键盘）提供时钟（20-33 kHz），每个数据帧包含：

| 位 | 含义 |
|----|------|
| 1 起始位 | 始终为 0 |
| 8 数据位 | LSB 先发 |
| 1 奇偶校验位 | 奇校验 |
| 1 停止位 | 始终为 1 |

### 扫描码集

PS/2 键盘支持 3 套扫描码集（Scan Code Set），当前固件使用 Set2（默认）：

| 扫描码集 | 特点 | 使用场景 |
|----------|------|----------|
| Set1 | 原始 XT 格式 | PC BIOS 兼容（Set2→Set1 转换后上报） |
| Set2 | 现代键盘默认 | EC 键盘驱动内部使用 |
| Set3 | IBM 3270 终端 | 极少使用 |

Set2 的 Break Code（按键释放）通过 F0 前缀标识：按 A → `1C`；释放 A → `F0 1C`。Set1 的 Break Code 通过在 Make Code 上加 0x80 标识：按 A → `1E`；释放 A → `9E`。键盘模块中的 `keyboard_utility.c` 负责 Set2→Set1 转换。

### AUX 设备支持

PS/2 AUX 端口（通常鼠标/触摸板）占用独立的 IRQ 线和数据线。AUX 设备协议与键盘相似但使用不同的命令集（如 0xE8 设置分辨率、0xF3 设置采样率）。EC 驱动同时管理 Keyboard 和 AUX 两个 PS/2 端口。

### 与键盘模块的关系

PS/2 驱动层仅处理电气层协议（CLK/DATA 时序），不涉及扫描码转换和键值映射——这些由 `app/kbchost/` 键盘主机模块完成。

## ERPMC 加密安全模块 (Encrypted RPMC)

`drivers/erpmc/` 是 EC 固件中规模最大、安全性要求最高的驱动模块（24 个源文件），实现基于 eSPI OOB 通道的加密 RPM 计数器（Replay Protected Monotonic Counter）。

### 架构概览

ERPMC 模块由以下子系统组成：

1. 加密引擎层（`crypto.c`、`hmac.c`、`sha256.c`）：提供 HMAC、SHA256 哈希及对称加密算法，所有加密运算在安全上下文中执行。
2. 密钥管理层（`key_storage.c`）：负责安全存储、加载和更新加密密钥。密钥材料不得明文暴露在 RAM 中超过必要时间。
3. CSME 通信层（`csme_manager.c`、`espioob_mctp.c`）：通过 eSPI OOB 通道上的 MCTP（Management Component Transport Protocol）协议与 Intel CSME 进行安全通信。
4. RPM 计数器层（`erpmc.c`）：维护防重放的单调计数器，确保固件版本和配置的防降级保护。

### 安全通信流程

1. CSME 通过 eSPI OOB 通道发送 MCTP 消息到 EC
2. `espioob_mngr` 解析 OOB 消息头，识别 MCTP 类型的加密消息
3. `csme_manager` 处理 MCTP 协议，提取加密载荷
4. 加密引擎使用存储的密钥进行验证/解密
5. RPM 计数器更新并安全持久化

### 密钥管理安全策略

- 根密钥存储在安全非易失存储区（如 OTP/eFuse），不可被软件读取
- 会话密钥通过 HMAC 从根密钥派生，每次会话独立生成
- 密钥在 RAM 中使用后立即清零（`memset(0)` 后释放）
- 不使用堆内存存储密钥材料——全部使用静态分配的 `__aligned(4)` 缓冲区
- 通信加密模式：HMAC-SHA256 用于消息认证，AES-256-CTR 用于载荷加密

### MCTP over eSPI OOB

MCTP（Management Component Transport Protocol）是 DMTF 标准的管理协议，在 eSPI OOB 通道上承载。ERPMC 的 MCTP 实现处理以下消息类型：

| MCTP 消息类型 | 用途 |
|---------------|------|
| `MCTP_CONTROL_MSG` | 控制消息（端点发现、路由配置） |
| `MCTP_SECURE_MSG` | 加密载荷（RPM 计数器读/写、密钥交换） |

### 设计要点

- 所有加密操作需在 E2E 安全通道内执行。
- 密钥材料不得明文暴露在 RAM 中超过必要时间。
- 需满足 Intel PCH 平台的 eSPI OOB 加密通道规范。
- RPM 计数器必须在每次递增后立即持久化（写穿策略），防止掉电导致计数器回退。

## ACPI 事件路由 (ACPI Hub)

`drivers/acpi/` 负责将 EC 内部事件映射为 ACPI 标准通知并通过 eSPI 上报主机。

### 事件路由表

ACPI Hub 维护一张事件路由表，定义 EC 内部事件与 ACPI 通知码之间的映射关系：

| EC 内部事件 | SCI 码 | 触发条件 | OS 处理 |
|------------|--------|----------|---------|
| 适配器插拔 | `SCI_Adapter_Status (0x0A)` | AC 插拔 GPIO 中断 | 更新电源状态 |
| 电池状态变化 | `SCI_Battery_Status (0x0B)` | RSOC 变化 > 1%、告警标志变化 | 更新电池图标 |
| LID 开合 | `SCI_LID_Open (0x0D)` / `SCI_LID_Close (0x0C)` | LID GPIO 中断 | 显示开关/睡眠唤醒 |
| 热事件 | `SCI_Thermal_Event (0x09)` | 温度变化 > 3°C | 调整散热策略 |
| 电源键 | `SCI_PB_Press (0x10)` / `SCI_PB_Release (0x11)` | 电源键 GPIO 中断 | 关机/睡眠对话框 |
| FnLock 切换 | `SCI_FNLK_On (0x62)` / `SCI_FNLK_Off (0x63)` | Fn+Esc 组合键 | 更新 OSD 指示 |
| GPU 状态变化 | `SCI_GPU_STATE_CHANGE (0x84)` | dGPU 插拔/使能变化 | 切换显卡策略 |

### SCI 队列管理

SCI 码入队后以 FIFO 顺序处理。主机 OS 通过 ACPI 0x84 查询命令（Query）逐一读取 SCI 码——每个 Query 返回一个 SCI 码并清除该事件。若同时有多个待处理事件，OS 连续发送多次 Query 直至返回 0（无更多事件）。

### Q Event 查询流程

1. EC 检测到事件 → 查找路由表获取 SCI 码 → 入队 SCI 队列
2. EC 通过 eSPI Virtual Wire 触发 SCI# 信号（高→低→高脉冲）
3. Host OS ACPI 驱动收到 SCI 中断 → 向 EC 发送 0x84 Query 命令
4. EC 从 SCI 队列中取出第一个 SCI 码 → 返回给 Host
5. Host OS 根据 SCI 码分发到对应 ACPI 设备驱动（电池/热/AC 适配器等）
6. 若队列仍有待处理事件 → 再次触发 SCI#

### OEM 自定义事件

OEM 可通过扩展事件路由表添加平台特定事件（如飞行模式键、性能模式键、OEM 专用热事件等），只需增加映射条目并分配未使用的 SCI 码（如 0x85-0xFF 区间）。

## Port80 调试显示 (Port80 Debug Display)

`drivers/port80/` 在系统启动阶段通过硬件 LED 显示模块展示 POST Code，辅助 BIOS/固件调试。

### POST Code 捕获

主机 BIOS 在启动的每个阶段（SEC、PEI、DXE、BDS）向 I/O 端口 0x80 写入单字节 POST Code，表示当前执行的初始化步骤。EC 通过 eSPI Peripheral Channel 捕获这些写入操作的地址和数据，识别为 Port80 写入后将 POST Code 交给显示驱动。

### MAX6958 LED 数码管驱动

MAX6958 是 I2C 接口的 4 位 7 段 LED 数码管驱动 IC，通过 I2C 总线（通常地址 0x38-0x3F）与 EC 通信：

| 寄存器 | 地址 | 功能 |
|--------|------|------|
| Digit 0-3 | 0x20-0x23 | 4 个数码管的段数据（每个 7 段 + 小数点） |
| Configuration | 0x04 | 亮度、扫描限值、关机模式 |
| Intensity | 0x01-0x04 | 每位数码管的独立亮度（16 级 PWM） |

7 段编码表将 POST Code 的 8 位值（0x00-0xFF）转换为 7 段显示的段选信号——每半字节对应一个数码管，4 个数码管可同时显示 4 位十六进制数。

### 错误状态锁定

当检测到特定的错误 POST Code（由 OEM 定义错误码列表）时，Port80 模块锁定当前显示——暂停更新数码管，使错误码固定显示。工程师可通过观察 LED 读数直接定位故障阶段，无需连接调试器。电源复位后锁定自动解除。

## VCI 虚拟组件接口 (Virtual Component Interface)

`drivers/vci/` 提供虚拟化的外设访问接口，使上层应用无需关注底层硬件的具体实现细节。VCI 封装了 I2C、SPI、GPIO 等底层总线的访问，为传感器、电源 IC、LED 驱动等外设提供统一的寄存器读写抽象层。

## MPS2825 VR IC 配置 (MPS2825 VR Config)

`drivers/mps/` 负责配置 MPS2825 电压调节器 IC 的寄存器参数。MPS2825 是 MPS 公司的多路输出 VR 芯片，通过 I2C 总线（通常地址 0x60）与 EC 通信。

### 配置流程

1. 系统上电后，EC 通过 I2C 读取 MPS2825 的 Device ID 寄存器确认芯片型号
2. 写入预设的寄存器初始化表（`{register, value}` 对序列），依次配置：
   - 各路输出电压（VOUT0 ~ VOUT3）
   - 上电时序延迟（Turn-On Delay）
   - 下电时序（Turn-Off Slew Rate）
   - 过流/过温保护阈值
3. 使能各路输出，确认 PGOOD（Power Good）信号

### 寄存器初始化表示例

初始化表为静态编译期定义，包含多路输出的电压值和保护参数。OEM 根据板卡实际电源树设计修改表中的电压值。

## EEPROM 存储 (EEPROM Driver)

`drivers/eeprom/` 提供板载 EEPROM 存储器的读写驱动，用于存储系统配置、设备标识符等非易失性数据。

### 存储布局

EEPROM 典型使用 I2C 接口（地址 0x50-0x57），存储空间按功能分区：

| 分区 | 偏移 | 大小 | 内容 |
|------|------|------|------|
| 设备信息区 | 0x00 | 128B | 序列号、MAC 地址、制造日期 |
| 配置数据区 | 0x80 | 256B | BIOS 设置备份、EC 偏好配置 |
| 校准数据区 | 0x180 | 128B | ADC 校准系数、温度补偿值 |
| 日志区 | 0x200 | 256B | 系统事件日志、错误记录 |

### 原子写入

EEPROM 写入以页为单位（通常 32/64 字节页），驱动保证单页写入的原子性——若写过程中掉电，该页数据处于旧状态或新状态之一，不会出现半写状态。跨页写入由应用层通过"先写数据、后写提交标志"两阶段提交保证一致性。

### DTS 配置

```devicetree
&i2c0 {
    eeprom@50 {
        compatible = "atmel,at24c256";
        reg = <0x50>;
        size = <32768>;    // 256Kbit = 32KB
        pagesize = <64>;   // 64 字节页写入
    };
};
```

## SPI Flash 共享 (SPI Flash Driver)

`drivers/spi_flash/spi_flash_hub.c` 提供 EC 端访问共享 SPI Flash 的接口。在部分平台设计中，EC 与 PCH 共享同一颗 SPI Flash 芯片——EC 可通过 eSPI Flash Channel 代理访问，或通过专用 SPI 总线直接访问。

### SPI 总线与实例

当前支持单 SPI 总线（`SPI_BUS_0`），OEM 可扩展多路：

```c
enum spi_bus_num {
    SPI_BUS_0 = 0,
};
```

### 核心 API

| 函数 | 用途 |
|------|------|
| `spi_read_jedec_id(instance, id)` | 读取 SPI Flash 的 JEDEC 制造商 ID（用于识别 Flash 型号和容量） |
| `spi_flash_hub_read(instance, buf, offset, len)` | 从指定偏移量读取数据到缓冲区 |

Flash 写/擦除操作通常由主机侧发起（通过 eSPI Flash Channel 的 `espihub_write_flash()` / `espihub_erase_flash()`），EC 侧以只读为主。

### 与 eSPI Flash Channel 的关系

当使用 eSPI Flash Channel 访问共享 Flash 时，上层通过 `espihub_read_flash()` 代理，底层由 eSPI Hub 处理。当 EC 独占 SPI 总线时，直接通过 `spi_flash_hub_read()` 操作。

## 电源管理 (Power Sequencing, Sleep States)

电源管理模块是 EC 固件的核心，负责系统全局的电源状态控制与协调。代码位于 `app/power_sequencing/` 和 `app/power_management/`。

### 系统电源状态机

系统电源状态基于 ACPI 规范定义（`enum system_power_state`，来自 `include/system.h`），共 15 个状态：

稳定状态：

| 状态 | 含义 | 说明 |
|------|------|------|
| `SYSTEM_G3_STATE` | 机械断电 | 系统完全断电，仅 RTC 保持供电 |
| `SYSTEM_DSX_STATE` | 深度睡眠 | 平台深度睡眠中间状态 |
| `SYSTEM_S0_STATE` | 工作状态 | 系统全开，主机与 EC 正常运行 |
| `SYSTEM_S3_STATE` | 挂起到内存 | 主机休眠，仅保留内存供电 |
| `SYSTEM_S4_STATE` | 挂起到磁盘 | 系统上下文保存到磁盘 |
| `SYSTEM_S5_STATE` | 软关机 | 主机关闭，EC、充电模块仍供电 |

过渡状态（在状态切换过程中使用）：

| 状态 | 含义 |
|------|------|
| `SYSTEM_S0_S3_STATE` | S0 → S3 过渡中 |
| `SYSTEM_S0_S4_STATE` | S0 → S4 过渡中 |
| `SYSTEM_S0_S5_STATE` | S0 → S5 过渡中 |
| `SYSTEM_S3_S0_STATE` | S3 → S0 过渡中 |
| `SYSTEM_S4_S0_STATE` | S4 → S0 过渡中 |
| `SYSTEM_S5_S0_STATE` | S5 → S0 过渡中 |

Modern Standby 状态：

| 状态 | 含义 |
|------|------|
| `SYSTEM_MS_STATE` | Modern Standby 主状态 |
| `SYSTEM_MS_HW_DRIP_STATE` | Modern Standby 硬件 DRIP 模式 |
| `SYSTEM_MS_HW_DRIP_S0_STATE` | Modern Standby 硬件 DRIP 下 S0 |

状态切换通过 `transition_power_state()` 函数设置，该函数将 `SysPowState` 更新为目标过渡状态并将 `PWSeqStep` 复位为 0。整个系统使用统一的 `SysPowState` 全局变量，并提供便捷的状态判断宏（如 `SystemIsS0`、`SystemIsS5`、`SystemIsS5S0` 等）。

启动/关机原因：

启动原因枚举（`boot_cause_t`）记录系统启动的触发源：

| 枚举值 | 含义 |
|--------|------|
| `BOOTUP_CAUSE_FLIP_TO_BOOT` | 翻盖启动 |
| `BOOTUP_CAUSE_POWER_KEY` | 电源键按下 |
| `BOOTUP_CAUSE_NOVO_KEY` | Novo 键按下（一键恢复） |
| `BOOTUP_CAUSE_EC_AUTO` | EC 自动上电（如 BBRAM 标记触发） |
| `BOOTUP_CAUSE_SOC_BOOT` | SoC 唤醒（SLP_Sx 信号触发） |
| `BOOTUP_CAUSE_SUPER_KEY` | Super 键触发 |
| `BOOTUP_CAUSE_ONE_KEY_BATTERY` | 一键电池检测 |
| `BOOTUP_CAUSE_AI_WOV` | AI 语音唤醒 |
| `BOOTUP_CAUSE_Factory_TEST` | 工厂测试模式 |

关机原因枚举（`ENUM_SHUTDOWN_CAUSE`）：

| 枚举值 | 含义 |
|--------|------|
| `SC_CPUHOT` | CPU 过热保护关机 |
| `SC_BATLOW` | 电池低电保护关机 |
| `SC_RESET_CPU` | CPU 复位 |
| `SC_SELF_HEALING` | 自愈机制触发 |
| `SC_ESPI_RESET` | eSPI 复位触发 |

### 电源序列控制

电源时序（Power Sequencing）通过预定义的步骤表实现。每个步骤由 `power_seq_struct` 描述：指定 GPIO 引脚、方向（输出/输入/VW信号）、期望电平、延时时间及可选回调函数。系统定义了 7 种电源序列：

| 序列 | 用途 |
|------|------|
| `G3_S5_SEQ` | G3 到 S5 的启动序列 |
| `S5_S0_SEQ` | S5 到 S0 的上电序列 |
| `S0_S5_SEQ` | S0 到 S5 的关机序列 |
| `S3_S0_SEQ` | S3 到 S0 的唤醒序列 |
| `S0_S3_SEQ` | S0 到 S3 的睡眠序列 |
| `S5_G3_SEQ` | S5 到 G3 的下电序列 |
| `RESTART_SEQ` | 系统重启序列 |

每个序列是一个静态数组，以 `END_PWRSEQ` 标记结束。

序列执行器 `process_power_seq()` 按步骤逐步执行：对于 DIR_OUTPUT 步骤设置 GPIO 高低电平并延时；对于 DIR_INPUT 步骤等待引脚达到期望电平（带超时保护）；对于 DIR_VW_PIN 步骤通过 eSPI Virtual Wire 等待信号。每个步骤执行后调用可选的 `pfun` 回调函数。若任何步骤超时（5000 次迭代），触发 `pwrseq_error()` 强制关机。

序列执行结果状态：

| 状态 | 含义 |
|------|------|
| `PWR_SEQ_SUCCESS` | 序列执行成功 |
| `PWR_SEQ_TIMEOUT` | 序列超时失败 |
| `PWR_SEQ_VM_ERROR` | 电压监控错误 |

### pwrseq 线程逻辑

`pwrseq_thread` 是系统的核心定时器任务，以 1ms 为周期运行（最高优先级线程）。其运行流程如下：

1. 初始化阶段：注册背光按钮处理回调 → `pwrseq_task_init()` 初始化电源序列 → 设置 `SysPowState = SYSTEM_S5_STATE`
2. 主循环（每 1ms 执行）：
   - `k_msleep(period)` — 等待 1ms
   - `monitor_power_signal()` — 读取 eSPI Virtual Wire 上的 SLP_S3 和 SLP_S4 信号；根据当前 `SysPowState` 进行状态判断：
     - 在 S5 状态：检查自动开机条件（SLP_S3/SLP_S4 信号组合 或 BBRAM 标记 `0xA5`），满足则调用 `system_power_on()`
     - 在 S3 状态：若 SLP_S3 信号置位，触发 `SYSTEM_S3_S0_STATE` 过渡
     - 在 S0 状态：若 SLP_S4 信号清零，执行 S4 关键操作后触发 `SYSTEM_S0_S5_STATE` 过渡
   - 检查 `g_pwrflags.turn_pwr_on` — 若为 true，调用 `transition_power_state(SYSTEM_S5_S0_STATE)` 并清除标志
   - 检查 `g_pwrflags.turn_pwr_off` — 若为 true，调用 `transition_power_state(SYSTEM_S0_S5_STATE)` 并清除标志
   - `pwrseq_update()` — 若当前无序列错误，根据 `SysPowState` 分发到对应过渡处理函数（如 `pwrseq_handle_transition_s5_to_s0`），每个处理函数内部调用 `process_power_seq()` 执行对应序列表

电源控制标志位（`struct pwr_flags`，位域结构体）实时反映电源状态：

| 标志位 | 含义 |
|--------|------|
| `ac_powered` | AC 适配器已连接 |
| `turn_pwr_on` | 请求开启电源 |
| `turn_pwr_off` | 请求关闭电源 |
| `wait_pwr_btn_up` | 等待电源键释放 |
| `en_pwr_btn_notify` | 启用电键通知 |
| `deep_s3_timer_on` | 深度 S3 定时器运行中 |
| `g3_exit` | G3 退出标志 |

### 过热保护

当热管理模块检测到 CPU 温度超过临界阈值时，调用 `therm_shutdown()` 函数：记录关机原因为 `SC_CPUHOT` → 等待 eSPI 复位完成 → 过渡到 S5 状态 → 挂起所有可挂起任务 → 阻塞等待电源键按下以恢复。

### 低功耗管理

EC 在 `app/power_management/power_management.c` 的 `check_enter_deepsleep()` 函数中设定进入深度睡眠的条件（如系统处于 S5、现代待机状态、无唤醒源待处理等），客户可按需修改此逻辑以适配不同的功耗策略。

## 键盘扫描与输入处理

`drivers/keyboard/` 实现键盘矩阵扫描、键值转换和高级功能处理。

### 矩阵扫描算法

EC 以固定周期（毫秒级，由 Kconfig 配置）对键盘矩阵进行扫描。扫描原理为行列扫描法：
1. 驱动逐列输出低电平（Column Drive）
2. 读取所有行输入（Row Sense）状态
3. 交叉比对当前扫描结果与上一次结果，检测电平变化
4. 电平从高变低 → 按键按下事件；电平从低变高 → 按键释放事件

### 去抖与按键状态

采用软件多次采样确认的去抖算法——对每个检测到变化的按键进行连续多次采样，结果一致才确认键位状态变化。去抖参数（采样次数、间隔时间）应可配置，以适配不同机械键盘的特性。

### 扫描码转换

键盘扫描码通过 `app/kbchost/keyboard_utility.c` 从 PS/2 Set2 格式转换为 Set1 格式——Set2 是现代键盘的标准输出格式，Set1 是传统 PC BIOS 期望的格式。转换表中维护每个 Set2 码对应的 Set1 码，F0 前缀（Set2 的 break code 前缀）转换为 Set1 的 0x80 + 键码格式。

### 键盘映射与高级功能

- 多层键位映射：通过 `kbs_keymap.h` 和 `oem_keymap.h` 定义基础层和 Fn 组合层的键值映射。OEM 可通过 `oem_keymap.c` 定制特定机型的键位布局。
- Fn 组合功能：Fn 键状态标志独立于普通按键，当 Fn 标志置位时，后续按下的键在 Fn 键位映射层中查找对应键值。
- Boot 按键序列（`kbs_boot_keyseq.h`）：定义系统启动时的特殊按键序列（如 F2 进入 BIOS Setup、F12 进入 Boot Menu），EC 在启动阶段检测这些序列并注入对应的开机行为。
- 键盘布局支持：通过 `KEYBOARD_LAYOUT` 枚举支持多种键盘布局（美式、巴西、法语、韩语等）。

### 矩阵硬件连接

典型笔记本键盘矩阵为 16 列 × 8 行 = 128 键位：

```
       COL0  COL1  COL2  ...  COL15
ROW0   [K0]  [K1]  [K2]  ...  [K15]
ROW1   [K16] [K17] [K18] ...  [K31]
...     ...   ...   ...  ...   ...
ROW7   [K112][K113][K114]... [K127]
```

- 列引脚（COL0~COL15）配置为推挽输出，扫描时逐列置低
- 行引脚（ROW0~ROW7）配置为上拉输入，读取按键状态
- 每个交叉点连接一个机械按键开关，按下时接通行列
- 未使用的键位（如 > 128 键的矩阵空闲位置）在键位映射表中标记为 `KEY_NONE`

### Ghost Key 检测与处理

当矩阵中三个键恰好占用矩形的三个顶点时，电流可能通过第四个顶点形成通路，导致未按下的键被错误检测（Ghost Key 现象）。典型场景：

- 三键同按形成矩形 → 第四个顶点产生假按键
- 处理策略：检测到三键及以上同按时，对可疑的矩形顶点键位进行第二轮单独扫描验证
- 若怀疑是 Ghost Key → 丢弃该按键事件，不向上层报告

### 键位映射文件结构

键位映射采用分层设计，便于多语言/多机型支持：

```
kbs_keymap.h          ← 基础层定义（US 布局，190+ 个键位标记）
├── oem_keymap.h      ← OEM 层定义（覆盖特定键位或添加厂商功能键）
│   └── oem_keymap.c  ← OEM 键值回调函数（如飞行模式、性能模式键）
└── kbs_boot_keyseq.h ← Boot 按键序列（F2=BIOS Setup, F12=Boot Menu）
```

每个键位由 `{row, col, keycode, flags}` 四元组定义，其中 `flags` 标记该键是否为 Fn 组合键、是否支持重复（Typematic）、是否为电源键等特殊键。

## 电池与充电控制 (Battery/Charger)

`app/battery/` 和 `app/charge/` 负责管理系统电池的运行状态和充放电过程。电池子系统通过 SMBus 接口（I2C0，地址 0x16）与智能电池包通信读取状态信息，充电子系统通过 I2C0（地址 0x6B）与 BQ25720 充电 IC 通信控制充放电参数。

### 电池状态机

电池子系统维护一个 7 状态的状态机（`BATTERY_STATE` 枚举），精确控制电池在不同工况下的行为：

| 状态 | 含义 | 典型充电行为 |
|------|------|-------------|
| `BAT_Step_ID` | 初始化 | 读取电池信息（制造商名、设备名、化学类型、设计容量等），确定初始状态 |
| `BAT_Step_WC` | 唤醒充电 | 电池电压过低时的预充电阶段，以小电流唤醒电池 |
| `BAT_Step_NC` | 正常充电 | 恒流/恒压充电阶段（CC/CV），按电池需求动态调整充电电流和电压 |
| `BAT_Step_DC` | 放电 | 适配器未连接时电池供电，监控放电状态和剩余容量 |
| `BAT_Step_FullyChg` | 充满 | 电池已满电，停止充电，维持涓流充电 |
| `BAT_Step_ForceDC` | 强制放电 | 存储模式或电池校准时的受控放电 |
| `BAT_Step_ACONLY` | 仅 AC | 无电池插入，仅适配器供电 |

状态转换通过 `bat_sts_machine[]` 转换表驱动——该表由 `BATTERY_STATE_MACHINE {exitState, enterState, transfer}` 条目组成，定义了 20 条合法状态转换路径，每条路径绑定一个转移回调函数（如 `from_id_to_wc`、`from_fullc_to_dc`、`from_forcedc_to_nc`）。`set_bat_ctrlstep(ctrlstep)` 函数在转换表中搜索匹配的 `{当前状态, 目标状态}` 对并执行回调，完成状态切换。

状态转换触发条件示例：

- ID → WC：电池就绪（`Initialized` 位已置位）且需要充电
- ID → NC：电池就绪且充电器已在正常充电模式下
- NC → FullyChg：充电电流降至接近零且电压达到满电水平
- DC → WC/NC：适配器插入
- FullyChg → DC：适配器移除
- DC → ForceDC：进入存储模式（长时间 AC 供电）

### 电池数据采集

电池信息通过 SMBus 轮询循环采集。`battery_thread` 以配置的周期运行，在每个周期内：
1. `polling_bat_data()` — 从 `bat1_polling_tabdata[]` 轮询表中按轮转（round-robin）读取一项数据（17 项轮询条目，包括 RSOC、电压、电流、温度、剩余容量、健康状态等）
2. 每 100ms 周期：执行电池状态机主逻辑 `battery_loop_100ms()`
3. 每 500ms 周期：执行 `battery_loop_500ms()`
4. 每 1s 周期：执行 `battery_loop_1s()` — 根据当前 `BAT1_CtrlStep` 分发到对应状态处理函数：

主状态分发函数 `battery_loop_1s()` 内部逻辑：
```c
switch(BAT1_CtrlStep) {
case BAT_Step_ID:      init_battery();           break;
case BAT_Step_WC:      bat1_wakeup_charge();     break;
case BAT_Step_NC:      bat1_normal_charge();     break;
case BAT_Step_DC:      bat1_discharge();         break;
case BAT_Step_FullyChg: bat1_fully_charged();    break;
case BAT_Step_ForceDC: bat1_force_discharge();   break;
case BAT_Step_ACONLY:  bat1_aconly();            break;
}
```

每个状态处理函数检查当前条件（AC 在线状态、FET 状态、RSOC 百分比阈值、存储模式标志），并在条件满足时通过 `set_bat_ctrlstep()` 发起状态转换。

轮询表中每个条目包含读取成功回调和读取失败回调。例如 `read_rsoc_success` 在 RSOC 读回后更新电量百分比并检查是否需发起 SCI 通知主机；`read_battery_status_success` 解析告警位（初始化完成、放电、充电、充满等）并触发相应动作。

### 电池插拔处理

- 电池插入（`battery_plugin_cb()`）：设置 `BT1_STATUS1.bat_in` 标志 → 若此前处于 ACONLY 状态，转换为 ID 重新初始化 → 可能触发电池固件更新模式
- 电池移除（`battery_plugout_cb()`）：清除 `BT1_STATUS1.bat_in` 标志 → 转换到 ACONLY 状态 → 通知系统电池已移除

插拔检测通过 GPIO 中断触发（`battery_pwrbtn_handler()`），根据引脚电平变化区分插入和移除。

### 充电器控制

`charge_thread` 独立于电池线程运行，周期性地：
1. `polling_charger_data()` — 通过 SMBus 轮询充电器状态寄存器（输入电流、充电电流、充电电压、系统电压等）
2. `charger_sys_event()` — 检查系统事件：
   - S0→S3/S5：调用 `charger_enable_lowpower()` 降低充电功率
   - S3/S5→S0：调用 `charger_disable_lowpower()` 恢复正常充电，启用 OOA（On-Or-After）功能
3. 处理适配器插拔事件：生成对应的 SCI 通知主机，通知设备子系统

充电 IC 初始化通过 `CHARGER_INIT_DATA` 表（`{cmd, data}` 对）写入 BQ25720 寄存器序列，设置输入电流限制、充电电压上限、系统电压最小值等参数。

Learn Mode（电池学习模式）：用于电池容量校准。进入时请求强制放电，完成后恢复在线模式。触发条件包括 Type-C 拔出检测和强制放电请求标志。

### BQ25720 充电 IC 寄存器映射

BQ25720 是 TI 公司的 Buck-Boost NVDC 充电控制器，通过 I2C/SMBus（地址 0x6B）与 EC 通信。关键寄存器：

| 寄存器 | 地址 | 功能 | 典型值 |
|--------|------|------|--------|
| `ChargeOption0` | 0x00 | 充电选项（使能、复位、看门狗） | 0x810E |
| `ChargeCurrent` | 0x02 | 充电电流设置（mA） | 取决于电池规格 |
| `MaxChargeVoltage` | 0x04 | 最大充电电压（mV） | 12600（3S 电池） |
| `ChargeOption3` | 0x30 | 输入电流限制（mA） | 取决于适配器功率 |
| `ADCVBUS` | 0x27 | VBUS 电压读数 | 实时值 |
| `ADCIIN` | 0x29 | 输入电流读数 | 实时值 |
| `ADCSYSVO` | 0x2D | 系统电压读数 | 实时值 |
| `ChargerStatus` | 0x20 | 充电器状态（AC 在线、充电中、故障） | 状态位域 |

初始化通过 `CHARGER_INIT_DATA` 表（`{register, value}` 对序列）写入，通常在电池线程启动时执行一次。

### SMBus 电池轮询表

`bat1_polling_tabdata[]` 定义了 17 个轮询条目，按轮转（round-robin）方式逐周期读取一项：

| 轮询条目 | SMBus 命令 | 读取内容 |
|----------|-----------|----------|
| RSOC | 0x0D | 相对剩余电量百分比 |
| Voltage | 0x09 | 电池端电压（mV） |
| Current | 0x0A | 充放电电流（mA，正=充电，负=放电） |
| Temperature | 0x08 | 电池温度（0.1K） |
| RemainingCapacity | 0x0F | 剩余容量（mAh） |
| FullChargeCapacity | 0x10 | 满充容量（mAh） |
| DesignCapacity | 0x18 | 设计容量（mAh） |
| ManufactureDate | 0x1B | 制造日期 |
| SerialNumber | 0x1C | 序列号 |
| BatteryStatus | 0x16 | 电池状态（告警位域） |
| CycleCount | 0x17 | 充放电循环次数 |
| DesignVoltage | 0x19 | 设计电压（mV） |
| ManufactureName | 0x20 | 制造商名称（字符串） |
| DeviceName | 0x21 | 设备名称（字符串） |
| DeviceChemistry | 0x22 | 电池化学类型（如 "LION"） |
| ChargingCurrent | 0x14 | 期望充电电流 |
| ChargingVoltage | 0x15 | 期望充电电压 |

每个轮询条目绑定读取成功回调和失败回调——如 `read_rsoc_success` 更新电量百分比并检查是否需要发 SCI 通知主机刷新电池图标。

### Learn Mode 电池校准流程

当电池长时间 AC 供电（存储模式）或电池计量精度下降时，触发 Learn Mode 校准：

1. 检测触发条件：Type-C 拔出 或 `force_discharge` 请求标志置位
2. 通过 `set_bat_ctrlstep(BAT_Step_ForceDC)` 进入强制放电状态
3. 放电至电池 RSOC 降到 Learn Mode 下限阈值（通常 5-7%）
4. 重新开始充电，经过 ID → WC → NC → FullyChg 完整状态链
5. 满充点触发电池计量 IC 的容量更新（Battery Gauging 算法重新标定）
6. 退出 Learn Mode，恢复在线正常模式

## PD/Type-C 管理 (PD Management)

`app/pd_management/` 负责 USB Power Delivery 协议管理与 Type-C 端口状态监控，是供电策略的核心决策模块。

### PD 状态机

PD 管理维护 4 个状态（`enum pd_state`）：

| 状态 | 含义 |
|------|------|
| `PD0_LOAD_PDFW` | 加载 PD 固件（第一阶段） |
| `PD1_LOAD_PDFW` | 加载 PD 固件（第二阶段） |
| `PD_INIT` | PD 协议栈初始化 |
| `PD_WAIT_EVENT_PROCESS` | 等待事件并处理（正常运行状态） |

上电后 PD 模块依次完成两级固件加载和协议栈初始化，然后进入事件驱动的主循环。

### 供电能力协商

当 Type-C 适配器插入后，EC 通过 PD 协议与适配器协商供电能力（PDO — Power Delivery Object），协商结果通过以下 OEM 可定制函数对外提供：

| 函数 | 返回值 | 用途 |
|------|--------|------|
| `get_opened_adapter_watt()` | 适配器功率（W） | 确定系统总供电能力，决定是否可全性能运行 |
| `get_input_current()` | 输入电流限制（mA） | 充电器输入电流上限，防止适配器过载 |
| `clear_dead_battery_flag()` | void | 清除死电池标志，恢复电池正常充放电 |

OEM 需根据实际 PD 协商结果实现这三个函数。典型返回值示例：65W 适配器 → `get_opened_adapter_watt()` 返回 `65`，`get_input_current()` 返回 `3250`（3.25A）。

### 线程模型

`pd_thread` 以配置的周期运行，每个周期执行两步：

1. `pd_sys_event()` — 通过 `k_event_wait(&sEvent.event_pd, ...)` 检查系统事件：
   - `EC_EVENT_SYSTEM_S5_S0`：记录 PD 事件日志（S5→S0）
   - `EC_EVENT_SYSTEM_S0_S5`：记录 PD 事件日志（S0→S5）
   - 其他事件（LID、Display、ITS 模式切换等）当前为预留桩，OEM 可按需扩展
2. 100ms 子周期 — 预留的周期性任务槽位，可在此执行 PD 状态轮询或 Type-C 插拔检测

### 与电池充电模块的协作

PD 协商结果直接影响充电策略：
- `get_input_current()` 返回值传递给充电器驱动，设置 `CHARGER_INIT_DATA` 中的输入电流限制
- 低功率适配器（如 15W/27W）→ 限制充电电流 + 降低系统性能等级
- 高功率适配器（如 65W/100W）→ 全速充电 + 全性能运行
- 死电池场景：PD 模块检测到电池电压过低 → 调用 `clear_dead_battery_flag()` → 电池模块进入唤醒充电（WC）状态

### 配置

通过 `CONFIG_PD_LOG_LEVEL` 控制 PD 模块的日志输出级别，调试阶段建议设为 `LOG_LEVEL_DBG`。

## 风扇与热管理 (Thermal Control)

`app/thermal_management/` 通过对系统关键部位温度的监控，动态调整散热策略。

### 智能散热模式 (ITS)

系统定义 8 种智能散热（ITS）模式（`ITS_MODE_INDEX` 枚举），由主机通过 ACPI 或 EC 自主选择：

| 模式 | 标识字节 | 含义 |
|------|----------|------|
| `ITS_MODE_EPM` | 0xAA | 极速性能模式（Extreme Performance Mode） — 风扇最高转速 |
| `ITS_MODE_iEPM` | 0xB9 | 增强性能模式 |
| `ITS_MODE_APM` | 0xBC | 高级性能模式 |
| `ITS_MODE_STD` | 0xBB | 智能模式（Smart/Standard） — 平衡性能与噪音 |
| `ITS_MODE_AQM` | 0xBA | 静音模式 |
| `ITS_MODE_iBSM` | 0xBD | 增强省电模式 |
| `ITS_MODE_BSM` | 0xCC | 省电模式（Battery Saving Mode） — 限制风扇和 GPU 功率 |
| `ITS_MODE_MAX` | 0xBE | 模式总数 / 无效模式标记 |

模式切换函数 `transfer_its_mode(newMode)` 的流程：
1. 判断 `newMode != CURRENT_ITS_MODE`，若相同则直接返回
2. 调用 `exit_its_mode(current)` 执行当前模式的退出清理
3. 调用 `enter_its_mode(newMode)` — 更新 `CURRENT_ITS_MODE` → 调用平台特定的 `fan_instance.update_its_mode()` → 通过 `notify_subsystems(EC_EVENT_ITS_MODE_CHANGE)` 广播模式切换事件

### 风扇控制算法

风扇控制的核心是缓启动/缓降的 PWM 调整算法。

关键参数：
- `START_SPEED = 25`（% duty cycle）— 风扇启动的最低 PWM 占空比
- `RPMACC = 30` — 转速容差范围（±30 RPM），防止因转速微波动反复调整 PWM
- `FAN_STEP_UP_VALUE` / `FAN_STEP_DW_VALUE` — 每次调整的 PWM 步进值（初始为 1）

控制算法（`fan1_control()` / `fan2_control()`）：
1. 读取当前实际 RPM
2. 若目标 RPM ≤ 1500 RPM → 关闭风扇（写入 0% duty cycle）
3. 若当前 RPM == 0（风扇已停止）→ 从 `START_SPEED + FAN_STEP_UP_VALUE` 启动
4. 若 `|当前RPM - 目标RPM| > RPMACC`（偏差超过 30 RPM）：
   - 当前 < 目标 → 占空比 + `FAN_STEP_UP_VALUE`（渐增）
   - 当前 > 目标 → 占空比 - `FAN_STEP_DW_VALUE`（渐降）
5. 在容差范围内 → 维持当前占空比不变

这种缓启动/缓降策略避免了风扇转速的剧烈变化，减少噪音和机械磨损。

风扇管理器（`fan1_manager()` / `fan2_manager()`）负责确定目标 RPM：
- 正常模式：使用 `Fan1RPM` / `Fan2RPM`（由热管理策略或 ACPI 设置），`EXTREME_COOLING` 标志可提升目标值
- 调试模式：使用 `DebugFan1RPMT` / `DebugFan2RPMT`（可通过 Shell 命令覆盖）

系统事件响应（`fan_sys_event()`）：
- `EC_EVENT_ENTER_OS`：调用平台特定操作事件，重新进入当前 ITS 模式（刷新风扇策略）
- `EC_EVENT_SYSTEM_S3_S0` / `EC_EVENT_SYSTEM_S5_S0`：调用平台操作事件（从睡眠恢复后重新初始化风扇）
- `EC_EVENT_SYSTEM_S0_S3` / `EC_EVENT_SYSTEM_S0_S5`：调用 `fan_fulloff()` 完全关闭风扇

### CPU 温度监控

CPU 温度读取路径因平台而异：
- Intel 平台：通过 PECI（Platform Environment Control Interface）读取 CPU 温度，同时检查 dGPU 温度，当温度变化超过 `CPU_TEMP_ALERT_DELTA`（3°C）时入队 `SCI_THERMAL` 通知主机
- AMD 平台：通过 I2C 传感器读取，计算滑动平均值

PCH 温度通过 eSPI OOB 通道发送消息给 PCH 获取，同样使用滑动平均值（10 个样本窗口 `TEMP_AVG_CNT = 10`）。

### 热保护阈值

| 阈值 | 温度 | 动作 |
|------|------|------|
| 操作系统关机 | 99°C | 触发 ACPI 紧急关机 |
| CPU 降频开启 | 97°C | 通过 PROCHOT 触发 CPU 降频，启用超级风扇模式 |
| CPU 降频关闭 | 90°C | 取消 PROCHOT，恢复常规风扇模式 |
| EC 硬件关机 | 103°C | EC 绕过 OS 直接切断电源（含 3°C EC 容许误差） |

当 PCH 温度超过降频阈值时，EC 通过 `PROCHOT` 信号请求 CPU 降频。若温度继续上升达到关机阈值，触发 PCH 关机序列。降频释放后需温度降至 `CPU_TEMP_ALERT_DELTA` 以下才重新开启 PROCHOT，避免反复振动。

### BSOD 覆盖

当检测到系统蓝屏（BSOD），可通过 ACPI 设置临时的温控覆盖参数（`therm_bsod_override_thrsd_acpi`）：提高温度阈值和风扇速度，确保在系统崩溃时能维持散热。BSOD 覆盖由 `is_bsod_setting_en` 标志控制启用/禁用。

### 热管理线程

`thermalmgmt_thread` 的运行周期根据系统状态而不同：
- Modern Standby（CS）模式：以 8 秒周期运行（大幅降低功耗）
- 正常模式：以配置的标准周期运行

每个周期执行：`manage_fan_process()` → `thermal_sys_event()` → `manage_cpu_thermal()` → `manage_gpu_thermal()` → `manage_pch_temperature()`，每 10 个周期额外执行 `adc_thermal_sensors_update()` 和 `i2c_thermal_sensors_update()`。

`thermal_sys_event()` 响应系统事件：S0→S5 时禁用 PROCHOT 并清除标志；S3/S5→S0 时清除 DTS 消息队列缓存。

## PECI Hub (PECI Driver)

`drivers/peci/peci_hub.c` 封装 Intel PECI（Platform Environment Control Interface）协议，为热管理系统提供 CPU 和 GPU 的温度读取、寄存器和 MSR 访问能力。

### PECI 设备与通道

PECI 总线为单主单线协议，EC 作为 PECI 主机通过 PECI 引脚与 CPU/GPU 通信。CSCE250X 支持两个 PECI 目标设备：

| 设备 | 枚举值 | 域 | 典型用途 |
|------|--------|-----|----------|
| CPU | `CPU = 0` | 域 0 | 读取 IA 核心温度、TjMax、MSR、Package Config |
| GPU | `GPU = 1` | 域 1 | 读取 dGPU 温度（部分双芯平台） |

### 核心 API

**温度读取**：

```c
// 获取 CPU/GPU 当前温度（单位：°C）
int peci_get_temp(enum peci_devices dev, int *temperature);

// 获取 CPU/GPU Tjunction Max（最大结温）
int peci_get_tjmax(enum peci_devices dev, uint8_t *tjmax);
```

**MSR（Model Specific Register）访问**：

```c
// 读取 IA MSR（如 PL1/PL2 功率限制、温度目标等）
int peci_rd_ia_msr(enum peci_devices dev, uint8_t *req_buf,
                   uint8_t *resp_buf, uint8_t rd_len);

// 写入 IA MSR
int peci_wr_ia_msr(enum peci_devices dev, uint8_t *req_buf,
                   uint8_t *resp_buf, uint8_t wr_len);
```

**Package Config 访问**：

```c
int peci_rdpkg_config(enum peci_devices dev, uint8_t *req_buf,
                      uint8_t *resp_buf, uint8_t rd_len);
int peci_wrpkg_config(uint8_t *req_buf, uint8_t *resp_buf, uint8_t wr_len);
```

**设备信息与功率管理**：

| 函数 | 用途 |
|------|------|
| `peci_get_dib(dev, dev_info, rev_num)` | 读取 Device Information Byte（设备标识和版本） |
| `peci_update_pl4_offset(pl4_value)` | 更新 PL4 功率偏移（总源功率基线偏移） |
| `peci_access_mode_config(mode)` | 配置 PECI 访问模式（由 BIOS 通过 ACPI 命令设置） |

### PL4 功率管理

`peci_update_pl4_offset()` 用于 Intel DTT/DPTF 的动态功率调节场景。当系统总功耗需要限制时（如电池供电模式），EC 通过 PECI 写入 PL4 寄存器偏移值，CPU 硬件自动限制包功耗不超过 `PL1 + PL4_offset`。写入命令发送后需等待 `SOC_RDY_PECI_CMD_DELAY_MS`（1ms）以确保 CPU 接受更新。

### 与热管理模块的集成

在热管理线程的每周期循环中：
1. 调用 `peci_get_temp(CPU, &cpu_temp)` 获取 CPU 温度
2. 计算滑动平均值（通过 `get_moving_ave_u8()`）
3. 温度变化超过 `CPU_TEMP_ALERT_DELTA`（3°C）时入队 `SCI_THERMAL` 通知主机
4. 温度超过降频/关机阈值时通过 PROCHOT 和平台复位执行保护动作

## DTT 动态调优 (Dynamic Tuning Technology)

`app/dtt/dtt_thermals.c` 实现 Intel DTT（Dynamic Tuning Technology，原名 DPTF — Dynamic Platform and Thermal Framework）的 EC 侧支持。

### 功能概述

DTT 将部分温度监控负载从 SoC 卸载到 EC——EC 负责实时监测指定温度传感器并在温度穿越编程阈值时通知平台固件，由 Intel DTT 框架决定响应策略（如 CPU 降频、风扇提速、外设功率限制等）。

### 迟滞（Hysteresis）机制

为避免温度微小波动引发频繁事件，DTT 对每个传感器应用迟滞窗口：温度上升时在高温阈值触发事件，下降时需回落低温阈值以下才重新触发。这一机制平滑了不必要的尖峰和波动，仅在具有实际意义的时刻通知平台固件。

### 阈值结构

每个 DTT 管理的温度传感器由 `dtt_threshold` 结构描述：

```c
struct dtt_threshold {
    uint8_t status;      // BIT0: 初始化状态(1=完成), BIT4: 跳变点状态(1=已触发)
    int16_t low_temp;    // 低温通知阈值（温度低于此值触发事件）
    int16_t high_temp;   // 高温通知阈值（温度高于此值触发事件）
    int16_t temp_hyst;   // 迟滞温度（用于防止反复触发）
};
```

### 关键 API

| 函数 | 用途 |
|------|------|
| `dtt_init_thermals(thrm_sensors)` | 初始化 DTT 热传感器，将阈值设为默认值。`thrm_sensors` 指向 ACPI 表中定义的热传感器列表 |
| `smc_update_dtt_threshold_limits(acpi_sen_idx, thrd)` | SMC 主机接口调用的阈值更新函数——DTT 框架通过 ACPI 命令动态修改阈值 |
| `dtt_therm_sensor_trip()` | 跳变点检查——应在热管理例程每次获取到更新的传感器值后调用。若传感器读数穿越任何跳变点，触发对应热事件上报主机 |

### 集成流程

1. 系统启动 → `dtt_init_thermals()` 设置默认阈值
2. 操作系统加载 → DTT 框架通过 ACPI 命令下发传感器特定的高/低温阈值和迟滞值 → `smc_update_dtt_threshold_limits()` 更新
3. 热管理线程每周期 → 读取各传感器温度 → `dtt_therm_sensor_trip()` 检查跳变点 → 发送 SCI 通知主机
4. 操作系统 DTT 框架收到 SCI → 查询当前温度 → 执行散热策略

### 配置

`CONFIG_DTT_SUPPORT_THERMALS` 控制 DTT 热管理子系统的编译开关。

## GPIO 控制与事件处理

`app/peripheral_management/` 对系统的通用输入输出引脚进行统一抽象和管理，提供便捷的配置与控制接口，并处理外部 GPIO 中断事件。

### 中断驱动的外设事件处理

EC 的外设管理采用"GPIO 中断 + 事件广播"模式：硬件 GPIO 中断触发 → ISR 中完成最小处理（消抖、电平确认） → 调用预注册的回调函数 → 回调函数通过 `notify_subsystems()` 或 `k_event_post()` 将事件广播给相关子系统。

典型外设及其处理模块：

| 外设 | 处理模块 | 事件 |
|------|----------|------|
| 电源按钮 | `pwrbtnmgmt.c` | 按击检测、长按关机、SCI 通知 |
| LID 开关 | `periphmgmt.c` | 开盖唤醒、合盖休眠、SCI 通知 |
| AC 适配器 | `periphmgmt.c` | 插拔检测、充电策略切换 |
| 键盘背光 | `kb_backlight.c` | 亮度调节、超时自动关闭 |
| 触摸板 | `touchpad.c` | 使能/禁用、状态切换 |
| LED 指示 | `ec_led.c` | 电源 LED、充电 LED、通知 LED |
| 外部 Flash | `external_flash.c` | 读写管理 |

回调注册接口为各模块提供统一、简洁的回调函数注册机制，实现事件驱动的编程模型，降低模块间耦合度。

设计要点

- GPIO 资源配置（如引脚复用）应在系统初始化阶段清晰定义，避免冲突。
- 中断服务程序（ISR）应保持简短，将非紧急处理任务移交至低优先级任务或消息队列中执行。
- 需考虑 GPIO 状态的去抖处理，特别是对于机械开关类输入。

## LED 控制 (LED Driver)

`drivers/led/led_hub.c` 提供通用的 LED 控制接口，支持常亮、熄灭和呼吸灯三种模式，广泛用于电源指示灯、充电指示灯、通知灯等场景。

### LED 设备模型

LED 设备以编号索引（`led_num` 枚举：`LED0`、`LED1`），通过 Zephyr 原生 `led` 驱动类 + DTS 绑定。`led_init(idx)` 初始化指定 LED 的 GPIO 引脚和 PWM 通道（若支持呼吸）。

### 呼吸灯配置

呼吸灯由 `bled_breathing_info` 结构体完整描述：

```c
typedef struct {
    uint8_t smy;      // 亮度对称性（0-100，50=完全对称）
    uint8_t psize;    // 峰值保持时间（周期百分比）
    uint8_t max;      // 最大亮度（0-100）
    uint8_t min;      // 最小亮度（0-100）
    uint16_t hd;      // 高电平持续时间（ms）
    uint16_t ld;      // 低电平持续时间（ms）
    uint32_t itrl;    // 亮度递增步长
    uint32_t step;    // 定时器步进周期（ms）
} bled_breathing_info;
```

预定义常量：
- `ONLY_ON = 100` — 常亮模式（直接设置 100% 亮度）
- `ONLY_OFF = 0` — 熄灭模式

调用方式：

```c
bled_breathing_info info = {
    .smy = 50, .psize = 20, .max = 100, .min = 10,
    .hd = 1000, .ld = 1000, .itrl = 2, .step = 20
};
led_breathing(LED0, &info);  // LED0 开始呼吸
```

### 应用层集成

应用层通过 `ec_dev` IOCTL 接口间接控制 LED（`LED_IOCTL_TURN_ON` / `LED_IOCTL_TURN_OFF`），而非直接调用 `led_hub` API。这保证了 LED 控制逻辑集中在设备抽象层，上层模块（如电池、充电、电源管理）通过统一的 `device_ioctl(DEV_TYPE_LED, ...)` 接口操作 LED。

典型场景：
- 电源 LED：S0 常亮、S3 慢速呼吸、S5 熄灭
- 充电 LED：充电中橙色呼吸、充满绿色常亮、故障红色快闪
- 通知 LED：收到新消息时快速闪烁 3 次

## 调试与监控（Debug & Trace）

`app/debug/` 为固件开发、测试和现场问题诊断提供必要的日志、状态监控和交互手段。

功能说明

- POST Code 管理（`postcodemgmt.c`）：捕获和记录主机 BIOS 在启动各阶段写入的 Port80 调试码，辅助定位启动故障。
- RAM 调试（`ram_debug.c`）：提供运行时内存读写能力，用于在运行时检查变量值和内存状态。
- LED 调试（`led_debug.h`）：通过 LED 闪烁模式指示系统状态或错误码，在没有串口的场景下是重要的调试手段。

设计要点

- 调试功能在最终发布版本中应能被有效禁用或减小其对性能/尺寸的影响。
- 日志系统应设计为异步、非阻塞式，避免影响系统实时性。
- 监控数据应能通过一定方式（如日志、专用数据通道）导出供分析。

## SoC 调试感知 (SoC Debug Awareness)

`app/soc_debug_awareness/soc_debug.c` 提供平台级调试挂钩，允许 EC 在 SoC 调试模式下执行特定的初始化、复位和许可操作。

| 函数 | 用途 |
|------|------|
| `soc_debug_init()` | 低层级平台调试挂钩初始化 |
| `soc_debug_reset()` | 复位 SoC 调试感知状态 |
| `soc_debug_consent_kbs()` | 通过键盘矩阵检查替代的超时禁用方式（调试模式下跳过正常超时逻辑） |

此模块用于工厂调试和故障分析场景，OEM 可根据平台需求扩展调试功能。

## 系统启动与复位（System Boot & Reset）

此模块负责从上电伊始到操作系统加载前的整个 EC 固件启动流程，并管理系统复位行为。

### 启动流程

EC 从上电到进入正常运行状态的启动序列：

```
上电复位 → BootROM 验证 → Bootloader → 时钟初始化 → 外设初始化
→ 中断向量表 → sys_event 初始化 → task_info[] 遍历 → k_thread_start()
→ RTOS 调度器启动 → 各模块线程进入主循环
```

1. BootROM：验证 Bootloader 签名（Secure Boot），若验证失败进入恢复模式
2. Bootloader：验证 Application 固件签名，加载到 SRAM
3. 时钟初始化：配置 HSE/PLL、系统时钟（120MHz）、外设总线时钟
4. 外设初始化：GPIO、I2C、SPI、eSPI、PECI 等按依赖顺序初始化
5. `init_subsystems_events()`：初始化 10 个 `k_event` 对象
6. `start_all_tasks()`：遍历 `task_info[]` 静态数组，为每个任务创建 Zephyr 线程并启动

### 任务表结构

`task_info[]` 是编译期定义的静态线程注册表，每个条目包含：

| 字段 | 含义 |
|------|------|
| 线程函数入口 | 线程主函数指针 |
| 栈大小 | 线程专用栈（字节） |
| 优先级 | Zephyr 线程优先级（数值越小优先级越高） |
| 线程名称 | 用于调试和 Shell 显示的字符串标识 |

pwrseq_thread 具有最高优先级（1ms 周期），其余应用模块按业务重要度分配优先级。

### 复位源鉴别

启动时读取 RCC（Reset and Clock Control）寄存器，记录复位原因：

| 复位源 | 寄存器标志位 | 含义 |
|--------|-------------|------|
| `POR` | Power-On Reset | 首次上电或从 G3 恢复 |
| `WDT` | Watchdog Reset | 看门狗超时复位，指示系统卡死 |
| `SOFT` | Soft Reset | 软件通过 `ec_reset()` 请求的复位 |
| `NRST` | External Pin Reset | 外部硬件复位引脚触发 |

复位源信息存入备份寄存器（保持域），可通过 Shell 命令或 ACPI 接口查询，辅助现场问题分析。

### 看门狗策略

- 喂狗周期：由 pwrseq_thread 在 1ms 循环中执行，确保即使其他线程卡死也能按时喂狗
- 超时时间：通常配置为 1-2 秒，兼顾故障快速恢复和正常运行不误触发
- 早喂狗处理：系统启动后先配置 WDT，待所有关键线程启动完成后再启用喂狗（防止初始化阶段误复位）
- 调试模式：连接调试器时自动暂停 WDT（`DBGMCU` 配置）

## 安全与固件更新 (FW Update / OTA)

`drivers/ota/` 确保 EC 固件本身的安全性、完整性和可更新性。

### A/B 分区布局

EC Flash 划分为两个独立的固件分区：

```
+------------------+  ← Flash 起始地址
| Bootloader       |  一次性烧录，不可更新
+------------------+
| Partition A      |  当前运行固件（Active）
| (256KB)          |
+------------------+
| Partition B      |  更新固件（Inactive / Staging）
| (256KB)          |
+------------------+
| NV Storage       |  非易失数据（配置/日志/校准）
+------------------+
```

启动时 Bootloader 检查两个分区的版本号和完整性标志，选择版本号更高且 CRC 校验通过的分区启动。

### OTA 更新流程

```
主机发送更新包 → EC 接收并校验每块 CRC → 写入 Inactive 分区
→ 全包写完后验证签名 → 写入魔术字(0xOTA_MAGIC) → 通知主机重启
→ EC 复位 → Bootloader 检测魔术字 → 验证新固件 → 升级版本号 → 启动新固件
```

### 断点续传

更新过程中若 eSPI 通信中断或意外复位，EC 记录已写入的块编号到 NV Storage。恢复后 OTA 模块从下一个未写入的块继续接收，避免从头重传。单个块内写入是原子的（写前擦除 → 写入 → 写后校验）。

### 回滚机制

| 触发条件 | 行为 |
|----------|------|
| 新固件 CRC 校验失败 | 自动回退到旧分区 |
| 新固件启动后 3 次看门狗复位 | Bootloader 认定新固件不稳定，回退并标记分区为坏 |
| 安全版本号（SVN）低于当前版本 | 拒绝启动，停留在 Bootloader 等待有效更新 |

回退后 EC 通过 SCI 通知主机固件更新失败，主机 OS 可提示用户重试或联系售后。

### 安全校验

- 完整性：每 4KB 块使用 CRC32 校验
- 真实性：固件镜像末尾附 RSA-2048 数字签名，使用 Bootloader 中预置的公钥验证
- 版本控制：每个固件镜像头部包含 32 位安全版本号（SVN），单调递增

### 设计要点

- 签名密钥需安全存储，防止泄露。
- 更新流程需设计为原子操作，确保在写入新镜像过程中发生意外时，不会破坏原有可启动镜像。
- 回滚机制需考虑防止版本降级攻击（通常通过版本号控制）。

## 安全启动与验证（Secure Boot）

安全启动是系统信任链的根，确保 EC 固件从最开始即运行可信代码。

### 信任链模型

```
硬件 Root of Trust (OTP/eFuse)
    ↓ 验证
BootROM (掩模 ROM，不可修改)
    ↓ 验证
Bootloader (Flash 中，可更新但需签名)
    ↓ 验证
Application Firmware (Flash 中)
```

每一级在加载下一级之前验证其签名，形成不可打断的信任链。

### 密钥体系

| 密钥 | 存储位置 | 用途 |
|------|----------|------|
| 根公钥哈希（SHA-256） | OTP/eFuse（32 字节） | 验证 Bootloader 公钥 |
| Bootloader 公钥（RSA-2048） | Bootloader 代码段末尾 | 验证 Application 签名 |
| Application 签名（RSA-2048） | Application 分区末尾 | 验证固件完整性 |

根公钥哈希固化在芯片 OTP 中，出厂后不可修改——这是信任的最终锚点。即使攻击者获取了 Flash 的全部读写权限，也无法替换根公钥哈希。

### 验证流程

1. BootROM 读取 Bootloader 末尾的公钥，计算 SHA-256，与 OTP 中预置哈希比对
2. 哈希匹配 → BootROM 跳转到 Bootloader 入口
3. Bootloader 读取 Application 分区末尾的 RSA 签名
4. 使用 Bootloader 中存储的公钥验证签名
5. 签名有效 → 检查 Application 头部 SVN ≥ 最低允许版本
6. 版本通过 → 跳转到 Application 入口

### 安全恢复模式

当签名验证失败时，EC 进入安全恢复模式：
- 仅运行 Bootloader（最小化代码，不启动 Application）
- 通过 eSPI 通知主机进入恢复流程
- 主机通过 OTA 通道发送完整固件镜像
- Bootloader 直接写入 Application 分区（绕过常规 OTA 流程）
- 写完后执行完整验证，通过后重启进入新固件

### 防回滚

每个固件镜像头部嵌入 32 位 SVN（Security Version Number）。Bootloader 维护当前最低允许 SVN（存储在 OTP 或 NV Storage 的防篡改区域）。若新固件 SVN < 最低允许 SVN，拒绝启动——这防止了攻击者通过烧录旧版本固件利用已知漏洞。

### 设计要点

- 根信任锚（如公钥哈希）应固化在硬件中，难以修改。
- 验证失败必须导致启动中止，并进入安全恢复模式（如仅运行最小化 Bootloader 等待更新）。
- 整个验证流程本身应是防篡改的。
