\page ch5_应用开发指南 应用开发指南

# 应用开发指南

本章面向 ODM 开发者，以实战为导向介绍在 Chipsea Zephyr 开发包上进行 EC 固件开发的完整流程。从创建一个新功能模块的端到端案例入手，逐步覆盖配置系统、外设驱动、任务模型、主机通信、电源管理、系统服务、调试手段以及构建烧录验证。

## 快速上手：新增一个功能模块

以"电池电量计（Fuel Gauge）"模块为例，演示从零到一在 EC 固件中新增一个自定义功能模块的完整流程。这个模式适用于任何新增的 EC 应用模块。

第1步：创建模块目录

在 `app/` 下新建子目录：

```
app/fuel_gauge/
```

第2步：编写模块代码

`app/fuel_gauge/fuel_gauge.h` —— 对外接口：

```c
#ifndef FUEL_GAUGE_H
#define FUEL_GAUGE_H

int fuel_gauge_get_percent(void);
int fuel_gauge_get_voltage_mv(void);

#endif
```

`app/fuel_gauge/fuel_gauge.c` —— 实现文件，通过 ADC 读取电池电压并结合放电曲线计算电量百分比，内部使用 `adc_read()` 和线程定时采样。

第3步：添加 Kconfig 选项

在 `app/fuel_gauge/Kconfig` 中定义：

```kconfig
config FUEL_GAUGE
    bool "Battery Fuel Gauge Module"
    select ADC
    default n
    help
      Enable battery fuel gauge monitoring module.
```

第4步：注册到 CMakeLists.txt

在 `app/CMakeLists.txt` 中添加：

```cmake
zephyr_library_sources_ifdef(CONFIG_FUEL_GAUGE
    fuel_gauge/fuel_gauge.c
)
```

第5步：在 prj.conf 中启用

```
CONFIG_FUEL_GAUGE=y
```

重新运行 `west build` 即可将模块编译进固件。

关键要点：遵循上述四件套模式（Kconfig + CMakeLists + 头文件 + 源文件），确保新增模块与系统构建体系无缝集成。

## Kconfig 配置系统

Kconfig 是控制功能启用、驱动选择、编译参数的核心机制。配合 `prj.conf` 等配置文件，可以灵活裁剪系统。日常开发中，`prj.conf` 是最常修改的文件。

### 基础概念

Kconfig 通过定义配置项为系统组件提供编译开关：

```kconfig
config UART_CONSOLE
    bool "Enable UART console"
    default y
    help
      Enable UART device as the system console.
```

| 关键字 | 含义 |
|--------|------|
| `config` | 配置项名称（如 `UART_CONSOLE`） |
| `bool` / `int` / `string` / `hex` | 配置类型 |
| `"Enable UART console"` | 菜单中显示的说明文字 |
| `default y` | 默认值 |
| `help` | 详细描述 |

### 驱动、设备树与 Kconfig 的关系

![图 3-1](media/image4.png){width="5.0569444444444445in" height="2.6847222222222222in"}

- Kconfig：决定驱动是否被编译进系统（软件层面开关）；
- 设备树（DTS）：决定驱动初始化时的硬件参数（地址、引脚、速率等）；
- 驱动：编译进内核后在系统中注册设备实例，供应用层调用；
- 应用程序：通过设备名称查找设备实例，调用 API 操作硬件。

### 配置文件的组织

Kconfig 文件分多个层级：根目录 `Kconfig` 作为入口，子系统（`drivers/*/Kconfig`）、板级（`boards/`）、应用级（`app/Kconfig`）各自定义。模块间通过 `source` 语句串联。

常用配置文件：

| 文件 | 作用 |
|------|------|
| `prj.conf` | 应用层主配置，控制工程功能启用（最常用） |
| `boards/<board>_defconfig` | 板级默认配置 |
| `overlay.conf` | 特殊场景的功能叠加 |
| `debug.conf` / `release.conf` | 调试/发布差异化配置 |

示例 `prj.conf`：

```
# 启用日志与控制台
CONFIG_LOG=y
CONFIG_CONSOLE=y
CONFIG_UART_CONSOLE=y

# 启用 shell
CONFIG_SHELL=y
CONFIG_SHELL_BACKEND_SERIAL=y

# 启用 OTA
CONFIG_OTA_UPDATE=y
CONFIG_OTA_BUFFER_SIZE=1024
```

### 配置生效流程

执行 `west build` 时，构建系统依次：
1. 解析所有 Kconfig 文件；
2. 读取应用配置（`prj.conf`）；
3. 根据依赖与默认值生成 `build/zephyr/.config`（最终配置）；
4. 转换为 `autoconf.h` 中的 C 宏，如 `#define CONFIG_LOG 1`。

C 代码中可直接使用：

```c
#if defined(CONFIG_OTA_UPDATE)
    ota_start_service(CONFIG_OTA_BUFFER_SIZE);
#endif
```

### 配置文件优先级

多个配置来源同时存在时，高优先级覆盖低优先级（从低到高）：

1. 模块默认配置 — Kconfig 中的 `default` 值
2. Board 默认配置 — `boards/<board>_defconfig`
3. `prj.conf` — 应用层主配置，最常用的修改方式
4. 额外覆盖配置 — 通过 `-DOVERLAY_CONFIG=release.conf` 指定
5. 命令行配置 — `west build -DCONFIG_LOG=y`，最高优先级

### 可视化配置

Zephyr 支持 menuconfig / guiconfig 交互式界面：

```bash
west build -t menuconfig
# 或
west build -t guiconfig
```

这会启动类似 Linux 内核的菜单界面，可手动启用或关闭配置项，退出时修改写回 `.config`。

![图 3-2](media/image5.png){width="3.3541666666666665in" height="4.004166666666666in"}

![图 3-3](media/image6.png){width="6.486111111111111in" height="1.9319444444444445in"}

### 自定义 Kconfig

模块可以定义自己的配置项。例如为 OTA 模块添加 `Kconfig`：

```kconfig
menu "OTA Configuration"

config OTA_UPDATE
    bool "Enable OTA update feature"
    default n
    help
      Enable the OTA update functionality.

config OTA_BUFFER_SIZE
    int "OTA buffer size"
    default 512
    range 256 4096
    depends on OTA_UPDATE

endmenu
```

并在 `CMakeLists.txt` 中按条件编译：

```cmake
zephyr_library_sources_ifdef(CONFIG_OTA_UPDATE ota_update.c)
```

在 `prj.conf` 中启用即可：

```
CONFIG_OTA_UPDATE=y
CONFIG_OTA_BUFFER_SIZE=1024
```

## 外设驱动使用指南

本节以代码片段形式展示 EC 开发中最常用的外设驱动模式。所有驱动均基于 Zephyr 设备树绑定硬件资源，通过 `DEVICE_DT_GET()` 获取设备实例。

### GPIO

设备树定义（在板级 `.dts` 或 overlay 中）：

```
led0: led_0 {
    gpios = <&gpioa 5 GPIO_ACTIVE_HIGH>;
    label = "LED0";
};
```

驱动使用：

```c
const struct gpio_dt_spec led = GPIO_DT_SPEC_GET(DT_NODELABEL(led0), gpios);

void main(void)
{
    gpio_pin_configure_dt(&led, GPIO_OUTPUT_ACTIVE);
    while (1) {
        gpio_pin_toggle_dt(&led);
        k_msleep(500);
    }
}
```

中断回调配置——EC 中最常用的外设事件响应模式：

```c
static void button_pressed(const struct device *dev,
                           struct gpio_callback *cb,
                           uint32_t pins)
{
    printk("Button pressed!\n");
}

GPIO_DT_DEFINE(button, gpios);

void init_button(void)
{
    gpio_pin_configure_dt(&button, GPIO_INPUT);
    gpio_pin_interrupt_configure_dt(&button, GPIO_INT_EDGE_TO_ACTIVE);
    gpio_add_callback(button.port, &button_cb_data);
}
```

### I2C / SPI / UART

I2C 示例——常用于电池、Charger、传感器通信：

```
&i2c0 {
    status = "okay";
    clock-frequency = <I2C_BITRATE_FAST>;
};
```

```c
const struct device *i2c_dev = DEVICE_DT_GET(DT_NODELABEL(i2c0));
uint8_t data = 0;
i2c_write_read(i2c_dev, SENSOR_ADDR, &reg, 1, &data, 1);
```

SPI 示例：

```c
struct spi_config spi_cfg = {
    .frequency = 8000000,
    .operation = SPI_WORD_SET(8) | SPI_TRANSFER_MSB,
};
spi_transceive(spi_dev, &spi_cfg, &tx_bufs, &rx_bufs);
```

UART 示例：

```c
const struct device *uart_dev = DEVICE_DT_GET(DT_NODELABEL(uart0));
uart_poll_out(uart_dev, 'A');
```

### ADC

ADC 用于读取模拟传感器（电池电压、温度热敏电阻、电流检测）。DTS 中使能 ADC 节点：

```dts
&adc0 {
    status = "okay";
};
```

应用代码通过 `adc_sequence` 描述采样参数：

```c
#include <zephyr/drivers/adc.h>

static const struct device *adc_dev = DEVICE_DT_GET(DT_NODELABEL(adc0));
int16_t sample;

struct adc_sequence seq = {
    .channels = BIT(0),
    .buffer = &sample,
    .buffer_size = sizeof(sample),
    .resolution = 12,
};

int ret = adc_read(adc_dev, &seq);
if (ret == 0) {
    /* sample contains 12-bit ADC value */
}
```

使用前需在 `prj.conf` 中启用 `CONFIG_ADC=y`。

### PWM

PWM 用于风扇转速调节、背光亮度控制和 LED 呼吸灯。使用 `PWM_DT_SPEC_GET()` 从 DTS 获取设备：

```c
#include <zephyr/drivers/pwm.h>

static const struct pwm_dt_spec fan_pwm = PWM_DT_SPEC_GET(DT_NODELABEL(pwm0));

/* 25kHz周期，50%占空比（12.5kHz脉宽） */
int ret = pwm_set_dt(&fan_pwm, PWM_HZ(25000), PWM_HZ(12500));
```

使用前需在 `prj.conf` 中启用 `CONFIG_PWM=y`。

### pinctrl 引脚复用

Zephyr 通过 pinctrl 系统解耦引脚配置与驱动代码。DTS 中声明引脚功能：

```dts
&pinctrl {
    uart0_default: uart0_default {
        group1 {
            pinmux = <UART0_TX_PA0>, <UART0_RX_PA1>;
        };
    };
};

&uart0 {
    pinctrl-0 = <&uart0_default>;
    pinctrl-names = "default";
    status = "okay";
};
```

整体数据流为：DTS pinctrl 节点 → Zephyr pinctrl 驱动解析 → HAL 写寄存器 → 引脚模式生效。开发者只需在 DTS 中声明功能需求，无需关心寄存器地址和位偏移。

> Zephyr 设备驱动模型（struct device、驱动注册级别、DEVICE_DT_DEFINE 宏等）的详细原理请参考 [Zephyr 官方设备驱动文档](https://docs.zephyrproject.org/latest/kernel/drivers/index.html)。EC 开发中日常使用的就是上述 API 模式，掌握这些即可应对绝大多数场景。

## 任务与事件模型

在 EC 固件中，线程（任务）是功能模块的基本执行单元，事件框架用于模块间的解耦通信。

### 线程定义与类型

EC 框架使用 `K_THREAD_DEFINE` 宏进行静态线程定义，在编译时分配资源：

```c
K_THREAD_DEFINE(
    thread_id,          /* 线程标识符 */
    stack_size,         /* 栈大小 */
    thread_function,    /* 线程入口函数 */
    period_ptr,         /* 线程周期参数指针（可选） */
    NULL, NULL,         /* 保留参数 */
    priority,           /* 线程优先级 */
    K_INHERIT_PERMS,    /* 权限继承标志 */
    EC_WAIT_FOREVER     /* 延迟启动时间 */
);
```

EC 系统中有三种典型任务类型：

| 任务类型 | 典型周期 | 栈大小 | 示例 |
|----------|----------|--------|------|
| 高频关键任务 | 1ms | 2048 字节 | 电源时序 `pwrseq_thread` |
| 中频系统任务 | 100ms | 2048 字节 | 电池监控 `battery_thread` |
| 事件驱动任务 | 无固定周期 | 2048 字节 | OOB 管理 `oobmngr_thread` |

周期性任务入口函数模式：

```c
void battery_thread(const uint32_t *period)
{
    while (true) {
        battery_status_check();
        battery_data_report();
        k_msleep(*period);
    }
}
```

事件驱动任务入口函数模式：

```c
void oobmngr_thread(void *unused1, void *unused2, void *unused3)
{
    while (true) {
        uint32_t events = k_event_wait(&oob_events, ALL_OOB_EVENTS,
                                       false, K_FOREVER);
        if (events & OOB_DATA_RECEIVED) {
            process_oob_data();
        }
    }
}
```

### 线程栈大小规划

| 任务类型 | 典型栈大小 | 说明 |
|----------|-----------|------|
| 简单控制任务 | 1024 字节 | LED 控制、背光调节等 |
| 中等复杂度任务 | 2048 字节 | 电源序列、电池管理等 |
| 复杂协议任务 | 4096 字节 | SMC 主机通信、USB HID 等 |
| 外设管理任务 | 2048 字节 | 外设统一管理 |

栈大小设置原则：考虑函数调用深度和局部变量大小，为中断嵌套保留足够空间，通过栈水印分析进行优化调整。建议在开发阶段启用 `CONFIG_THREAD_STACK_INFO=y` 和 `CONFIG_STACK_SENTINEL=y` 检测栈溢出。

### 线程生命周期

系统通过 `start_all_tasks()` 函数统一启动所有线程：

```c
void start_all_tasks(void)
{
    init_subsystems_events();
    for (int i = 0; i < ARRAY_SIZE(tasks); i++) {
        if (tasks[i].thread_id) {
            k_thread_name_set(tasks[i].thread_id, tasks[i].tagname);
            k_thread_start(tasks[i].thread_id);
        }
    }
}
```

任务通过 `task_info` 结构体统一管理元数据：

```c
struct task_info {
    k_tid_t thread_id;
    bool can_suspend;       /* 是否允许挂起（电源管理） */
    const char *tagname;    /* 任务标签名，用于调试和管理 */
};
```

### EC 事件框架

事件驱动模型以"状态变化触发动作"为核心，基于 Zephyr `k_event` 原语实现模块间一对多广播。

系统事件定义（`sysevent.h`）：

```c
typedef enum {
    EC_EVENT_SYSTEM_S5_S0,
    EC_EVENT_SYSTEM_S0_S5,
    EC_EVENT_SYSTEM_S3_S0,
    EC_EVENT_SYSTEM_S0_S3,
    EC_EVENT_ENTER_OS,
    EC_EVENT_LID_OPEN,
    EC_EVENT_LID_CLOSE,
    EC_EVENT_DISPLAY_OFF,
    EC_EVENT_DISPLAY_ON,
    EC_EVENT_ENTER_DEEP_SLEEP,
    EC_EVENT_EXIT_DEEP_SLEEP,
} ec_event;
```

事件广播——当系统状态变化时，`notify_subsystems()` 将事件同时发布给所有子系统：

```c
bool notify_subsystems(ec_event event)
{
    LOG_INF("System event: %d", event);
    k_event_post(&sEvent.event_pd, event);
    k_event_post(&sEvent.event_power, event);
    k_event_post(&sEvent.event_charge, event);
    /* ... 其他子系统 ... */
    return true;
}
```

子系统监听示例——charger 模块响应电源状态变化：

```c
static void charger_sys_event(void)
{
    uint32_t events;
    events = k_event_wait(&sEvent.event_charge, 0xFFFF, false, K_NO_WAIT);
    if (events == 0) return;
    k_event_clear(&sEvent.event_charge, 0xFFFF);

    switch(events) {
    case EC_EVENT_SYSTEM_S0_S3:
    case EC_EVENT_SYSTEM_S0_S5:
        charger_enable_lowpower();
        break;
    case EC_EVENT_SYSTEM_S3_S0:
    case EC_EVENT_SYSTEM_S5_S0:
        charger_disable_lowpower();
        break;
    }
}
```

事件框架的核心优势：模块解耦（子系统仅感知事件，不直接依赖其他模块逻辑）、统一广播（同一事件可同时触发多个子系统响应）、易于扩展（新增子系统只需添加对应 `k_event` 对象与监听线程）。

> EC 框架也使用 Zephyr 标准 IPC 机制（消息队列用于任务间传递结构化数据、信号量用于任务间同步通知、互斥锁用于保护共享资源），但这些是 Zephyr 通用知识，本节不再展开。

## 主机通信

EC 通过 LPC 或 eSPI 接口与主机（BIOS/OS）通信，实现命令交互、事件上报与状态同步。

### 通信接口

LPC（Low Pin Count）——传统 x86 架构的 EC 接口，主机通过固定 I/O 端口访问 EC：
- Command Port (0x66)：写入命令
- Data Port (0x62)：读写数据
- EC 通过 SCI/SMI 中断通知主机

eSPI（Enhanced Serial Peripheral Interface）——新一代主机与 EC 通信标准，取代 LPC，支持更高带宽与多虚拟通道：
- Peripheral Channel — 用于传统 LPC 事务
- Virtual Wire Channel — 用于电源/事件信号
- OOB（Out-of-Band）Channel — 用于安全通信
- Flash Channel — 用于 BIOS 访问 EC Flash

### 命令处理流程

EC 从主机接收命令字节，在命令完整后分发到对应处理函数：

```c
void smchost_acpi_handler(void)
{
    while (acpi_get_flag(ACPI_EC_0, ACPI_FLAG_IBF)) {
        if (acpi_get_flag(ACPI_EC_0, ACPI_FLAG_CD)) {
            /* 接收到命令 */
            host_req_len = 0;
            host_req[host_req_len] = acpi_read_idr(ACPI_EC_0);
        } else {
            /* 接收到数据 */
            host_req[host_req_len] = acpi_read_idr(ACPI_EC_0);
        }
        if (host_req[0]) {
            if (smchost_req_length(host_req[0]) == host_req_len) {
                smchost_cmd_handler(host_req[0]);
                host_req[0] = 0;
            }
        }
        host_req_len++;
    }
}
```

命令分发：

```c
static void smchost_cmd_handler(uint8_t command)
{
    switch (command) {
    case SMCHOST_ACPI_READ:    acpi_read_ec();    break;
    case SMCHOST_ACPI_WRITE:   acpi_write_ec();   break;
    case SMCHOST_ACPI_BURST_MODE: acpi_burst_ec(); break;
    case ACPI_CMD_EC_UPDATE:   ecfw_update(&host_req[1]); break;
    default:                   host_cmd_default(command); break;
    }
}
```

自定义协议设计建议：保留命令空间（如 0xC0-0xFF）、所有命令定义请求/响应长度、返回码统一格式（0 = OK，非 0 = ERR）、对关键操作增加安全校验（Magic Code、CRC、签名）。

### 共享内存

EC SRAM 可通过 eSPI/LPC 映射到 Host Memory 空间，使 Host 访问 EC 内存就像访问本地内存。在 CSCE250X 上通过 Kconfig 配置共享内存地址：

```kconfig
config CSCE250X_PERIPHERAL_ACPI_SHD_MEM_ADDRESS
    hex "share memory win1 address"
    default 2002F000

config CSCE250X_PERIPHERAL_HOST_SHD_MEM_ADDRESS
    hex "share memory win2 address"
    default 2002F100
```

CSCE250X 支持两个共享内存窗口，默认地址分别为 `0x2002F000` 和 `0x2002F100`，用户可按需修改。

## 电源与唤醒管理

EC 负责系统全局的电源状态控制与协调，从上电到关机全过程的电源序列管理。

### 系统电源状态

根据 ACPI 规范，系统电源状态分为：

| 状态 | 名称 | EC 职责 |
|------|------|---------|
| G3 | Mechanical Off | 系统完全断电，仅 RTC 保持供电 |
| S5 | Soft Off | 主机关闭，EC 仍供电，可响应按键或唤醒事件 |
| S3 | Suspend to RAM | 主机休眠，仅保留内存供电；EC 监控唤醒源 |
| S0 | Working | 系统全开，主机与 EC 正常运行 |

EC 在各状态转换中的典型动作：

- S5 → S0 上电：检测电源键按下或适配器插入 → 依次上电各电源轨 → 拉高 PWRBTN_OUT 通知主机启动 → 上报 `EC_EVENT_SYSTEM_S5_S0`
- S0 → S3 睡眠：主机发送 SUSPEND# 信号 → EC 关闭非关键电源轨（LCD、风扇、背光） → 进入低功耗模式 → 上报 `EC_EVENT_SYSTEM_S0_S3`
- S3 → S0 唤醒：检测唤醒源事件 → 重新开启电源轨并恢复外设 → 上报 `EC_EVENT_SYSTEM_S3_S0`
- S0 → S5 关机：响应主机关机命令或长按电源键 → 执行有序掉电 → 保留 RTC 和键盘唤醒能力 → 上报 `EC_EVENT_SYSTEM_S0_S5`

### 电源序列控制

电源序列控制是 EC 的核心任务之一，代码位于 `app/power_sequencing/`。pwrseq 线程以 1ms 周期运行，监控时序信号并根据当前电源状态决定状态转换：

```c
void pwrseq_thread(void *p1, void *p2, void *p3)
{
    uint32_t period = *(uint32_t *)p1;
    pwrseq_task_init();
    SysPowState = SYSTEM_S5_STATE;

    while (true) {
        k_msleep(period);
        monitor_power_signal();

        if (g_pwrflags.turn_pwr_on) {
            transition_power_state(SYSTEM_S5_S0_STATE);
            g_pwrflags.turn_pwr_on = false;
        }
        if (g_pwrflags.turn_pwr_off) {
            transition_power_state(SYSTEM_S0_S5_STATE);
            g_pwrflags.turn_pwr_off = false;
        }
        if (!pwrseq_failure) {
            pwrseq_update();
        }
    }
}
```

`monitor_power_signal()` 中通过 eSPI Virtual Wire 获取 SLP_S3/SLP_S4 信号，根据当前电源状态和信号组合决定是否进行状态切换。

### 唤醒源管理

系统处于低功耗时，EC 保持部分外设与中断逻辑活动以响应唤醒事件：

| 唤醒源 | 说明 |
|--------|------|
| 电源按钮（PWRBTN#） | 用户主动唤醒系统 |
| LID 开合信号 | 笔电合盖休眠、开盖唤醒 |
| 键盘输入 | 键击唤醒系统 |
| RTC Alarm | 定时任务唤醒 |
| AC 插拔检测 | 适配器状态改变触发唤醒 |

电源键中断配置示例——中断触发后将事件分发至电源管理任务：

```c
static void pwrbtn_callback(const struct device *dev,
                            struct gpio_callback *cb, uint32_t pins)
{
    LOG_INF("Power button pressed");
    k_event_post(&sEvent.event_power, EC_EVENT_PWRBTN_PRESS);
}

static int pwrbtn_init(void)
{
    gpio_pin_configure_dt(&pwrbtn, GPIO_INPUT | GPIO_PULL_UP);
    gpio_pin_interrupt_configure_dt(&pwrbtn, GPIO_INT_EDGE_TO_ACTIVE);
    gpio_init_callback(&pwrbtn_cb, pwrbtn_callback, BIT(pwrbtn.pin));
    gpio_add_callback(pwrbtn.port, &pwrbtn_cb);
    return 0;
}
```

低功耗策略：在 S3/S5 下屏蔽非关键中断（温度传感器、风扇反馈等），仅保留唤醒信号（电源键、LID、RTC）；EC 可通过 `pm_state_force(PM_STATE_SUSPEND_TO_IDLE)` 进入浅睡眠模式。

## 系统服务速查

### 看门狗（WDT）

看门狗是 EC 系统稳定运行的安全机制，当系统长时间未"喂狗"时自动触发复位。Zephyr 提供统一接口（`<zephyr/drivers/watchdog.h>`），设备树中定义硬件实例：

```dts
iwdt: iwdt@48028000 {
    compatible = "chipsea,csce250x-iwdt";
    reg = <0x48028000 0x400>;
    status = "okay";
};
```

初始化与喂狗：

```c
#include <zephyr/drivers/watchdog.h>

const struct device *wdt = DEVICE_DT_GET(DT_NODELABEL(iwdt));

void wdt_init(void)
{
    struct wdt_timeout_cfg cfg = {
        .window.min = 0,
        .window.max = 2000,          // 超时时间：2000 ms
        .callback = NULL,
        .flags = WDT_FLAG_RESET_SOC,
    };
    wdt_install_timeout(wdt, &cfg);
    wdt_setup(wdt, WDT_OPT_PAUSE_HALTED_BY_DBG);  // 调试时暂停
}

void wdt_feed_task(void)
{
    static int channel_id = 0;
    wdt_feed(wdt, channel_id);
}
```

建议：每隔固定时间喂狗（如 500ms），集中在"系统健康任务"中统一管理。在进入深度睡眠前可适当延长超时时间。

### 定时器

k_timer——轻量、线程安全的定时调度机制，适合周期性任务：

```c
#include <zephyr/kernel.h>

K_TIMER_DEFINE(fan_timer, fan_timer_handler, NULL);

void fan_timer_handler(struct k_timer *timer_id)
{
    control_fan_speed();
}

// 首次延时1s，之后周期500ms
k_timer_start(&fan_timer, K_SECONDS(1), K_MSEC(500));
```

硬件定时器（counter）——提供比 k_timer 更精确的定时，适用于对时序要求严格的场景：

```c
#include <zephyr/drivers/counter.h>

const struct device *timer_dev = DEVICE_DT_GET(DT_NODELABEL(tim0));

struct counter_alarm_cfg alarm_cfg = {
    .ticks = counter_us_to_ticks(timer_dev, 1000000),  // 1s
    .callback = timer_callback,
};
counter_start(timer_dev);
counter_set_channel_alarm(timer_dev, 0, &alarm_cfg);
```

延时 API 速查：

| API | 用途 | 特点 |
|-----|------|------|
| `k_msleep(ms)` | 线程睡眠 | 释放 CPU，可在等待期间进入 idle |
| `k_busy_wait(us)` | 忙等待 | 不释放 CPU，适合微秒级短延时 |
| `k_sleep(K_MSEC(x))` | 线程睡眠 | 等价于 k_msleep |

### 内存布局

CSCE250X 的内存区域在设备树中定义：

| 区域 | 地址范围 | 大小 | 主要用途 |
|------|----------|------|----------|
| ITCM | 0x00000000 | 64 KB | 存放时间敏感的代码段（ISR、关键算法） |
| DTCM | 0x20000000 | 124 KB | 存放临时变量、栈、实时任务数据 |
| SRAM0 | 0x20020000 | 60 KB | 驱动层缓冲区、消息队列、日志缓存 |
| FLASH0 | 0x8012A00 | 约 437.5 KB | 固件代码、常量数据、配置区 |

内存分配策略：

| 策略 | 适用场景 | 示例 API |
|------|----------|----------|
| 静态分配 | 驱动缓冲区、线程栈、全局对象 | `K_THREAD_STACK_DEFINE`、`K_MSGQ_DEFINE` |
| 动态分配（Heap） | 临时通信缓冲、数据缓存 | `k_malloc()` / `k_free()` |
| 内存池（Slab） | 事件队列、USB 报文、采样缓存 | `K_MEM_SLAB_DEFINE` |

推荐：EC 固件优先使用静态分配 + 内存池，避免频繁堆分配导致的碎片化。

### 低功耗

Zephyr PM 框架会在系统空闲线程中自动决策进入低功耗。EC 应用在 `app/power_management/power_management.c` 的 `check_enter_deepsleep()` 中设定了进入 deepsleep 的条件，客户可按需修改。

关键 Kconfig 配置：

```
CONFIG_PM=y                  # 启用电源管理
CONFIG_TICKLESS_KERNEL=y     # Tickless 模式，空闲时关闭时钟中断
CONFIG_PM_DEVICE=y           # 启用设备级电源管理
```

系统进入低功耗的必要条件：无可运行任务（所有线程处于等待/阻塞状态）、无活动外设、近期无定时事件到期、系统策略允许进入。

## 调试与问题定位

### 日志系统

使用 Zephyr 结构化日志宏在代码中输出分级日志：

```c
#include <zephyr/logging/log.h>
LOG_MODULE_REGISTER(my_module, LOG_LEVEL_DBG);

LOG_ERR("Error: %d", errno);
LOG_WRN("Warning threshold reached");
LOG_INF("System started");
LOG_DBG("Debug value: 0x%x", val);
```

通过 Kconfig 控制日志级别：

```
CONFIG_LOG=y
CONFIG_LOG_MODE_MINIMAL=y        # 最小日志模式（节省空间）
CONFIG_LOG_DEFAULT_LEVEL=3       # 0=ERR, 1=WRN, 2=INF, 3=DBG
```

生产固件中建议使用 `CONFIG_LOG_MODE_MINIMAL=y` 并降低默认级别。

### 栈溢出检测

在 `prj.conf` 中启用以下保护：

```
CONFIG_STACK_SENTINEL=y          # 栈哨兵检测溢出
CONFIG_STACK_CANARIES=y          # 栈金丝雀保护
CONFIG_THREAD_STACK_INFO=y       # 保留线程栈信息供运行时查询
CONFIG_PRINTK=y
CONFIG_FATAL_ERROR_HANDLER=y
```

运行时通过 Shell 命令查看栈使用：

```
uart:~$ kernel stacks
uart:~$ kernel heap
```

使用 `k_thread_stack_space_get()` 在代码中查询未使用栈空间，建议每个线程保留 20-30% 余量。

### 性能分析

使用 `k_cycle_get_32()` 测量代码段耗时：

```c
uint32_t t0 = k_cycle_get_32();
critical_function();
uint32_t t1 = k_cycle_get_32();
uint32_t cycles = t1 - t0;
uint64_t us = cycles * 1000000ULL / sys_clock_hw_cycles_per_sec();
LOG_INF("critical_function took %llu us", us);
```

SystemView——通过 RTT/USB 将内核事件（线程切换、ISR、API 调用）导出到 PC 端可视化分析：

```
CONFIG_TRACING=y
CONFIG_SEGGER_SYSTEMVIEW=y
CONFIG_SEGGER_SYSVIEW_RTT_BUFFER_SIZE=20240
CONFIG_SEGGER_SYSTEMVIEW_BOOT_ENABLE=y
```

非常适合定位频繁调度的线程、ISR 抢占和优先级反转问题。

## 构建、烧录与验证

### 构建命令

```bash
# 完整构建
west build -b csce250x_evb app/ -p

# 仅构建指定配置
west build -b csce250x_evb app/ -- -DCONFIG_LOG=y

# 使用额外覆盖配置
west build -b csce250x_evb app/ -- -DOVERLAY_CONFIG=release.conf
```

### 资源分析

```bash
# 查看 RAM 占用（栈、堆、BSS）
west build -t ram_report

# 查看 Flash 占用（.text、.rodata、.data）
west build -t rom_report
```

建议在每次功能改动后运行这两个报告，建立资源使用基线，避免未经审视的增长。

### 验证清单

以 fuel gauge 模块为例的验证方法：

| 测试场景 | 验证方式 |
|---------|---------|
| 编译通过 | `west build` 零警告零错误 |
| 功能正确 | 满电（4.2V）→ 100%，低电（3.3V）→ ~5% |
| 异常处理 | ADC 读取失败返回 `-EIO`，不崩溃 |
| 内存影响 | `ram_report` / `rom_report` 增量在预期范围 |
| 长时间稳定性 | 100K 次循环调用无内存泄漏，栈水印无变化 |
| 电源状态 | S0 正常运行，S3 停止采样，S5 恢复后状态正确 |
| 看门狗 | 长时间运行无 WDT 误触发 |

手动测试方法：在 EVB 上烧录固件后，通过 Shell 命令直接调用模块接口，观察返回值。监控命令：`kernel stacks`（确认栈无溢出）、`kernel heap`（确认无内存泄漏）。

> 调试与验证的完整方法请参考 [调试与验证](ch6__xE8_xB0_x83_xE8_xAF_x95_xE4_xB8_x8E_xE9_xAA_x8C_xE8_xAF_x81.html) 章节。
