<div class="chapter-header"><span class="chapter-num">04-10</span><span class="separator">/</span><a href="../index.md">首页</a><span class="separator">›</span><a href="index.md">固件功能模块</a><span class="separator">›</span><span>调试与GPIO</span></div>

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


---

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


---

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


---

## 核心运行时架构

Legacy EC 的核心运行时负责任务调度、中断处理、启动流程和内存管理。虽然 Chipsea Zephyr EC 使用 Zephyr RTOS 替代了 Legacy 运行时，但理解 Legacy 架构有助于阅读上游文档和理解 EC 的设计约束。

### 任务系统

Legacy EC 采用**协作式优先级调度**模型：

- **四个优先级**：IDLE、LOW、HIGH、HIGHEST
- **协作式调度**：任务不会被抢占，只有主动调用 `task_wait_event()` 时才切换
- **事件驱动**：通过 `task_set_event()` 向目标任务发送事件位图
- **中断延迟最小化**：中断处理程序（INT handler）尽可能短，将实际工作推迟到任务上下文

```c
/* 任务定义 */
void thermal_task(void) {
    while (1) {
        /* 处理温度传感器 */
        process_temp_sensors();
        /* 等待下一个周期事件 */
        task_wait_event(THERMAL_PERIOD_MS * MSEC);
    }
}
DECLARE_TASK(thermal_task, TASK_PRIORITY_LOW, thermal_task_stack);
```

### Hooks 机制

Hooks 是 EC 中的回调机制，当特定事件发生时自动调用注册的处理函数：

| Hook 类型 | 触发时机 | 典型用途 |
|-----------|----------|----------|
| `HOOK_INIT` | 系统初始化完成后 | 初始化外设、注册事件监听 |
| `HOOK_CHIPSET_STARTUP` | AP 启动时 | 使能外设电源、开启传感器 |
| `HOOK_CHIPSET_SHUTDOWN` | AP 关机时 | 关闭外设、保存状态 |
| `HOOK_CHIPSET_SUSPEND` | AP 进入 S3 暂停 | 降低功耗、关闭非必要外设 |
| `HOOK_CHIPSET_RESUME` | AP 从 S3 恢复 | 恢复外设状态 |
| `HOOK_AC_CHANGE` | AC 电源状态变化 | 切换充电策略 |
| `HOOK_LID_CHANGE` | 翻盖状态变化 | 通知 AP 显示器状态 |

### Deferred Functions

Deferred Functions 允许在**较低优先级上下文**中执行回调：

- 在中断上下文中无法执行耗时操作（如 I²C 通信）
- 通过 `hook_call_deferred()` 将回调推迟到主循环执行
- 支持延迟执行（指定超时时间）

```c
/* 在中断中推迟执行 */
void usb_interrupt_handler(void) {
    /* 仅设置标志，不做耗时操作 */
    usb_event_pending = 1;
    hook_call_deferred(&usb_process_deferred_data, 0);
}

/* 在主循环中执行 */
static void usb_process_deferred(void) {
    /* 这里可以安全地进行 I²C 通信 */
    process_usb_events();
}
DECLARE_DEFERRED(usb_process_deferred);
```

### 看门狗

EC 使用硬件看门狗防止死锁：

- **喂狗周期**：任务必须在规定时间内喂狗，否则系统复位
- **中断模式**：看门狗中断会在复位前调用 `panic` 函数，保存崩溃现场
- **调试模式**：调试时可暂停看门狗计数（`CONFIG_WATCHDOG_HELP`）

### 启动流程

```
上电 → 芯片初始化 → 读取 Flash 头 →
→ 选择启动分区（RO/RW）→ RW 签名验证 →
→ 跳转到 RW → HOOK_INIT 初始化 →
→ 主循环（任务调度）
```

### 时间系统

EC 使用 32 位计数器实现时间管理：

| 函数 | 用途 |
|------|------|
| `get_time()` | 获取当前时间（微秒精度） |
| `usleep(usecs)` | 忙等待指定微秒 |
| `msleep(msecs)` | 等待指定毫秒（任务上下文） |
| `task_wait_event(timeout)` | 等待事件或超时 |

> **注意**：Chipsea Zephyr EC 使用 Zephyr 的 `k_timer`、`k_sleep()`、`k_usleep()` 等 API 替代了 Legacy 时间系统。

### 内存模型

Legacy EC 通常无 MMU，代码在物理地址空间运行：

- **RO 区域**：启动代码和验证逻辑
- **RW 区域**：可更新的业务代码
- **数据区域**：全局变量、栈
- **共享内存**：EC 和 AP 通过共享内存交换数据（如电池状态、传感器数据）


---

<div class="chapter-nav">
<a href="09_外设与存储.md">‹ 外设与存储</a>
<a href="index.md">目录</a>
</div>
