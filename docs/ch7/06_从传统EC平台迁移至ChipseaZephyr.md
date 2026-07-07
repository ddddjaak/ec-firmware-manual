<div class="chapter-header"><span class="chapter-num">07</span><span class="separator">/</span><a href="../index.md">首页</a><span class="separator">›</span><a href="index.md">移植与定制</a><span class="separator">›</span><span>从传统 EC 平台迁移至 Chipsea Zephyr</span></div>

### 从传统 EC 平台迁移至 Chipsea Zephyr

前述章节介绍了在 Zephyr 生态内为新板卡创建 BSP 的标准流程。然而，芯海 EC 芯片的一个重要业务场景是芯片替代——客户希望用 CSCE250X 替换现有的 ITE（如 IT5571/IT5570）、Nuvoton（如 NPCX 系列）等传统 EC 芯片。这些传统平台的固件通常基于 C51 内核，运行在裸机或简易调度器上，与 Zephyr RTOS 的架构理念有根本性差异。

本章节以 ITE IT557x 系列的实际固件代码（ADL-N MRD 参考工程）为蓝本，提供从传统 EC 平台迁移到 Chipsea Zephyr 的实战指南。以下所有 ITE 侧代码示例均来源于真实工程文件，可直接对照查阅。

#### 迁移概述与核心挑战

从传统 EC 平台迁移并非简单的"代码翻译"，而是一次架构层面的重构，面临三重核心挑战：

1. 内核架构跃迁：C51 是 8 位哈佛架构 MCU，内存分为 CODE（Flash，含 Bank 切换，典型 128KB）、XDATA（外部 RAM，4-16KB）、DATA（内部 RAM，128-256 字节）三个独立地址空间，需要通过 `code`/`xdata`/`data` 关键字显式管理。ITE 固件进一步将 CODE 空间划分为 4 个 Bank（`L51_BANK.A51` 管理切换），每个 Bank 32KB，函数调用跨 Bank 需通过公共区域（Common Area）跳转。而 CSCE250X 基于 ARM Cortex-M33（32 位 Von Neumann 架构），拥有统一线性地址空间和 256+ KB SRAM，不再需要 Bank 切换和内存空间关键字。

2. 运行时模型转变：ITE 固件采用"服务标志位分发"（Service Flag Dispatch）模式——ISR 设置标志位（如 `F_Service_PCI`、`F_Service_KEY`、`F_Service_MS_1`），`main()` 中的 `main_service()` 函数按优先级轮询这些标志并调用对应处理函数。这种模式是协作式的——每个处理函数必须快速返回，不能阻塞。Zephyr 采用抢占式多线程模型，每个子系统作为独立线程运行，可阻塞等待，由调度器按优先级抢占。

3. 硬件描述方式革命：ITE 固件通过 `#define` 宏定义寄存器地址和引脚号，使用 `SET_MASK()`/`CLEAR_MASK()` 宏直接操作寄存器。所有外设配置散落在各模块代码中。Zephyr 将硬件描述从代码中分离到设备树（DTS）中，驱动通过标准 API 间接访问硬件。

#### 传统 EC 平台架构剖析（以 IT5571 为例）

理解源平台的架构特点，是制定迁移策略的前提。以下基于 ITE IT557x ADL-N MRD 参考工程（`IT557x_ADL_N_MRD-ec-v0.21-220914/`）的实际代码进行剖析。

ITE 固件采用四层代码组织：

| 层级 | 路径 | 职责 |
|------|------|------|
| CHIP | `Code/CHIP/` | 芯片寄存器地址定义（`CHIPREGS.H`、`CHIPSFR.H`） |
| CORE | `Code/CORE/` | 平台无关的 EC 核心框架（主循环、IRQ 分发、SMBus 协议、键盘扫描、ACPI 接口） |
| API | `Code/API/` | 外设抽象层（GPIO 表驱动、ADC、PWM、PECI、I2C） |
| OEM | `Code/OEM/` | 项目定制（电源序列、电池、风扇、GPIO 配置、键盘映射） |

构建系统使用 Keil C51 + A51 汇编器 + BL51 链接器 + NMAKE。功能裁剪通过 `OEM_PROJECT.H` 中的 `#define SUPPORT_XXX TRUE/FALSE` 开关实现（无 Kconfig）。

主循环代码位于 `Code/CORE/CORE_COMMON/CORE_MAIN.C:main()`，其核心流程如下：

```c
// CORE_MAIN.C:24 — ITE EC 固件入口
void main(void)
{
    // 栈指针设置、Bank 数据复位、Scratch SRAM 清零
    Core_Initialization();   // CORE_INIT.C:73 — 寄存器初始化、SMBus 初始化
    Oem_Initialization();    // OEM 模块初始化（GPIO、电源、电池等）
    InitEnableInterrupt();   // CORE_IRQ.C:2150 — 使能中断系统

    while (1) {
        main_service();      // CORE_MAIN.C:347 — 服务标志位分发（核心调度）
        // 现代待机状态机处理
    }
}

// CORE_MAIN.C:347 — 服务标志位分发（按优先级检查）
void main_service(void)
{
    if (F_Service_PCI)       { F_Service_PCI = 0;  service_pci();  }
    if (F_Service_PCI2)      { F_Service_PCI2 = 0; service_pci2(); }
    if (F_Service_MS_1)      { /* 1ms 定时器服务 */ }
    if (F_Service_KEY)       { F_Service_KEY = 0;   service_scan(); }
    if (F_Service_PCI3)      { F_Service_PCI3 = 0;  service_pci3(); }
    if (F_Service_ACPI)      { F_Service_ACPI = 0;  service_acpi(); }
    // ... 更多标志位
}
```

定时器系统通过 `service_1mS()`（`CORE_MAIN.C:600`）产生级联定时事件：1ms → 5ms → 10ms → 50ms → 100ms → 500ms → 1sec → 1min。每一个 tick 调用 `Hook_TimerXxxEvent()` 回调，OEM 层在这些回调中实现电池轮询、风扇控制、LED 更新等周期性逻辑。

外设访问采用两种 GPIO 控制方式并存。第一种是直接寄存器宏操作：

```c
// OEM_GPIO.H:241 — 命名 GPIO 宏
#define ALL_SYS_PWRGD_HI()       SET_MASK(GPDRA, BIT(2))
// OEM_GPIO.H:323
#define PM_PCH_PWROK_HI()        SET_MASK(GPDRA, BIT(1))
// OEM_GPIO.H:410
#define PCH_RSMRST_HI()          SET_MASK(GPDRH, BIT(1))
// OEM_GPIO.H:426
#define EC_PWR_LATCH_HI()        SET_MASK(GPDRH, BIT(4))
```

第二种是通过结构体表驱动的 API（`API_GPIO.C`），将所有 88 个 GPIO 引脚（A0-M7）映射到 `asGPIOConfReg[]` 数组，通过 `GPIO_Output_Ctrl(pin_index, level)` 和 `GPIO_Input_Status_Get(pin_index)` 统一访问。

ITE 的电源序列采用表驱动架构，定义在 `Code/OEM/OEM/OEM_BANK0/OEM_POWER.C` 中：

```c
// OEM_POWER.H:59-64 — 电源序列步骤结构体
typedef struct PowerSEQ {
    FUNCT_PTR_B_V func;      // 步骤执行函数指针
    WORD   delay;            // 执行后延时 (ms)
    BYTE   checkstatus;      // 0=无条件执行, 非0=需等待条件满足
} sPowerSEQ;

// OEM_POWER.C:979-1023 — S5→S0 上电序列（实际代码，22 个步骤）
const sPowerSEQ ADL_N_sSEQ_S5_to_S0[] = {
    { PF_PWR_LED_ON,           0, 0 },   // 亮电源灯
    { PF_ADP_PRESENT,          0, 0 },   // 检查适配器在位
    { PF_CHK_V3P3A_PGOOD_HI, 100, 1 },   // 等 3.3V 电源好（带条件检测）
    { PF_EC_PWR_LATCH_HI,      0, 0 },   // 锁存电源
    { PF_DSW_PWROK_R_HI,       0, 0 },   // DSW 电源好
    { PF_CHK_PM_SLP_SUS_HI,  100, 1 },   // 等 SLP_SUS 拉高
    { PF_CHK_RSMRST_PWRGD_HI,  0, 1 },   // 等 RSMRST 电源好
    { PF_RSMRST_HI,            0, 0 },   // 释放 RSMRST
    { PF_CHECK_SLP_S4_HI,      0, 1 },   // 等 SLP_S4 拉高
    { PF_CHECK_SLP_S3_HI,      0, 1 },   // 等 SLP_S3 拉高
    { PF_ALL_SYS_PWRGD_HI,     0, 0 },   // 所有系统电源好
    { PF_CHK_IMVP9_VR_READY_HI, 0, 1 },  // 等 VR 就绪
    { PF_PM_PCH_PWROK_HI,      0, 0 },   // 通知 PCH 电源就绪
    { PF_SYS_PWROK_HI,         0, 0 },   // 系统电源好
    { PF_TrggerSOCPwrBtn,      0, 0 },   // 触发 SoC 电源键（100ms 脉冲）
    // ... 后续步骤（共 22 步）
};

// OEM_POWER.C:1462 — 触发上电
void Oem_TriggerPowerOn(void)
{
    Set_SysPowState(_PST_S5_to_S0);  // 设置过渡状态，复位步骤计数器和延时
}
```

电池管理通过 SMBus 轮询表实现，定义在 `Code/OEM/OEM/OEM_BANK0/OEM_BATTERY.C` 中：

```c
// OEM_BATTERY.C:76 — 电池轮询命令表
const sSMB_CMD _SMB_BATT1_POLL_TBL[] = {
    { SMB_WORD_READ,  0x09,  &BATT1_VOLTAGE,     batt1_volt_success    },
    { SMB_WORD_READ,  0x0B,  &BATT1_RSOC,        batt1_rsoc_success    },
    { SMB_WORD_READ,  0x08,  &BATT1_TEMP,         batt1_temp_success    },
    { SMB_WORD_READ,  0x0A,  &BATT1_CURRENT,      batt1_current_success },
    { SMB_WORD_READ,  0x16,  &BATT1_BATTERYSTATUS, batt1_status_success },
    // ... 共 17 个轮询条目
};

// OEM_BATTERY.C:139 — SMBus 状态机轮询
void PollSmartBattery(void) {
    // 使用 bRWSMBus() 逐个执行轮询表中的 SMBus 命令
    // SMBus 通道定义在 CORE_SMBUS.C:asSMBus[] 寄存器映射表中
}
```

SMBus 通道通过寄存器映射表统一管理（`Code/CORE/CORE_COMMON/CORE_SMBUS.C:11`）：

```c
// CORE_SMBUS.C:11-21 — 6 通道 SMBus 寄存器映射
const sSMBus asSMBus[] = {
    // HOCTL, TRASLA, HOCMD, HOSTA, D0REG, D1REG, HOBDB, IER, ISR, PECERC
    { 0x40,  0x41,   0x42,  0x43,  0x44,  0x45,  0x46,  0x47, 0x48, 0x49 }, // Ch A
    { 0x50,  0x51,   0x52,  0x53,  0x54,  0x55,  0x56,  0x57, 0x58, 0x59 }, // Ch B
    // ... Ch C-F
};

// 上层调用 bRWSMBus(Channel, Protocol, Addr, Comd, Var, PECSupport)
```

中断系统基于 IVECT 寄存器分发（`Code/CORE/CORE_COMMON/CORE_IRQ.C`）。`Isr_Int1()` 读取 IVECT 确定中断源，在 `IRQ_Service[]` 函数指针表（176 个条目）中查找对应处理函数。每个 ISR 仅设置服务标志位：

```c
// CORE_IRQ.C:481 — KBC 输入缓冲满中断
void IRQ_INT24_KBCIBF(void)  { F_Service_PCI = 1; }

// CORE_IRQ.C:1788 — 1ms 定时器中断
void Isr_Tmr0(void)          { F_Service_MS_1 = 1; }

// CORE_IRQ.C:117 — 键盘扫描中断
void IRQ_INT11_KBMatrixScan(void) { F_Service_KEY = 1; }

// CORE_IRQ.C:1567 — eSPI Virtual Wire 中断（含 PLTRST 跟踪）
void IRQ_INT154_eSPI_VWINT(void) { /* VW 事件处理 + 标志位设置 */ }
```

#### 架构差异对比

| 维度 | ITE IT557x（C51） | Chipsea CSCE250X（Zephyr） |
|------|-------------------|---------------------------|
| CPU 内核 | 80390（C51 兼容），8 位，48-96 MHz | ARM Cortex-M33，32 位，120 MHz |
| 地址空间 | 哈佛架构，CODE/XDATA/DATA 分离 | Von Neumann 架构，统一线性地址空间 |
| 代码存储 | Bank 切换（4×32KB Common+Banks 1-3） | 统一 Flash（512KB），无 Bank 切换 |
| RAM | 4-16 KB XDATA + 256B DATA + 内部 SRAM | 256+ KB SRAM（ITCM+DTCM+SRAM0） |
| 运行时 | 服务标志位分发（协作式） | Zephyr RTOS 抢占式多线程 |
| 定时器 | 1ms 定时器 → 软件级联（1/5/10/50/100/500ms/1s/1min） | 内核 Tick + k_timer + 独立线程周期 |
| 外设访问 | `SET_MASK(GPDRx, BIT(n))` 直接寄存器 | 设备树 + 标准驱动 API |
| GPIO 管理 | `#define` 命名宏 + `asGPIOConfReg[]` 表 | pinctrl DTS + `gpio_dt_spec` |
| SMBus | `asSMBus[]` 寄存器映射表 + `bRWSMBus()` | Zephyr I2C API（`i2c_write_read()`） |
| 电源序列 | `sPowerSEQ{func_ptr, delay, checkstatus}` 数组 | `power_seq_struct` 数组 + `pwrseq_thread` |
| 电池管理 | SMBus 轮询表 + 100ms/500ms/1s tick 分支 | 独立 `battery_thread` + 7 状态状态机 |
| 风扇控制 | 温度查表 + 步进 PWM（`Fan1_Control()`） | `fan1_control()` 缓启/降算法 + 8 模式 ITS |
| 功能裁剪 | `OEM_PROJECT.H` 中 `SUPPORT_XXX TRUE/FALSE` | Kconfig 树形依赖 |
| 主机通信 | eSPI/LPC 寄存器 + KBC 端口 0x62/0x66 | eSPI 驱动（Peripheral/VW/OOB/Flash 四通道） |
| 中断分发 | IVECT 寄存器 → `IRQ_Service[]` 表（176 条） | ARM NVIC 向量表 |
| 调试手段 | GPIO 翻转 + 逻辑分析仪 | Shell + Logging + SystemView + GDB |
| 构建系统 | Keil C51 + NMAKE | CMake + west |

#### 功能模块逐一迁移映射

以下基于 ITE 实际代码与 Chipsea Zephyr 模块进行精确对照。

##### 电源序列：从 sPowerSEQ 函数指针表到 pwrseq 框架

ITE 侧：电源序列由 `sPowerSEQ{func_ptr, delay_ms, checkstatus}` 结构体数组定义，每个步骤调用一个 `PF_xxx` 函数指针，通过 `Set_SysPowState()` 触发状态转换（`OEM_POWER.C`）。系统状态枚举（`_SYSTEM_S0=0x01`、`_SYSTEM_S3=0x03`、`_SYSTEM_S5=0x05`、`_SYSTEM_G3=0x06`）和过渡状态（`_PST_G3_to_S5=0x80` 等）在 `OEM_POWER.H` 中定义。

Zephyr 侧：对应到 `app/power_sequencing/pwrplane.c` 中的 `power_seq_struct` 序列数组和 `pwrseq_thread`（1ms 周期），系统状态采用 ACPI 标准枚举（`SYSTEM_S0_STATE` 等 15 个状态），详细状态机见第 4 章电源管理部分。

迁移动作：
- ITE 的 `PF_xxx` 函数指针 → 重写为 Zephyr 序列表中的 `POWER_SIGNAL()` 宏引用
- ITE 的 `checkstatus=1` 等待条件 → Zephyr 的 `process_power_seq()` 内置超时轮询
- ITE 的 `delay` 字段 → 直接映射到 `power_seq_struct.delay_ms`
- ITE 的 `_PST_S5_to_S0` 等过渡状态 → `SYSTEM_S5_S0_STATE` 等对应过渡状态

##### 键盘扫描：从 KSO/KSI 寄存器到 Zephyr kscan 驱动

ITE 侧：`Code/CORE/CORE_BANK0/CORE_SCAN.C:scan_keys()` 通过写 KSO 输出寄存器（`Write_Strobe()`）逐列驱动扫描线，读取 KSI 输入寄存器获取行状态，经过去抖（`debounce_key()`）、make/break 检测（`cscfnd()`）后生成扫描码。键盘矩阵参数（行数、列数、去抖时间）在 `OEM_GPIO.H` 的 KSO/KSI 控制寄存器初始化值中硬编码。

Zephyr 侧：键盘矩阵的硬件参数在 DTS 的 `kbs_matrix` 节点中声明，扫描由硬件控制器或 `kscan` 驱动完成。键位映射在 `kbs_keymap.h`/`oem_keymap.h` 中定义。

迁移动作：
- ITE `OEM_GPIO.H` 中的 KSO/KSI 寄存器配置 → DTS `kbs_matrix` 节点的 `row-gpios`/`col-gpios` 属性
- ITE `CORE_SCAN.C` 的扫描码 → `oem_keymap.h` 键位映射表
- ITE 的 boot key 序列（如 F2→BIOS Setup）→ `kbs_boot_keyseq.h`
- Set2→Set1 转换由 `keyboard_utility.c` 自动完成

##### 电池与充电：从 SMBus 轮询表到 battery/charge 子系统

ITE 侧：电池管理通过 SMBus 轮询表（`_SMB_BATT1_POLL_TBL[]`）和定时回调（`Hook_Timer100msEvent()` 等）实现。`PollSmartBattery()`（`OEM_BATTERY.C:139`）串行执行轮询表中的 SMBus 命令，读取电压、电流、RSOC、温度、电池状态等。充电器通过 `_SMB_CHGRA_POLL_TBL[]` 和 `PollSmartCharger()` 管理。电池状态机逻辑分散在各个 tick 回调中。

Zephyr 侧：对应到 `app/battery/battery.c` 的 7 状态状态机（`bat_sts_machine[]`，20 条转换路径）和 `app/charge/charge.c` 的独立 `charge_thread`。详细状态转换见第 4 章电池与充电控制部分。

迁移动作：
- ITE `_SMB_BATT1_POLL_TBL[]`（17 条 SMBus 命令）→ `bat1_polling_tabdata[]`（含成功/失败回调）
- ITE `_SMB_CHGRA_POLL_TBL[]` → `charger` 子系统的轮询表
- ITE `bRWSMBus(Channel, Protocol, Addr, Comd, Var, PECSupport)` → `i2c_write_read()`
- ITE 分散的电池状态逻辑 → 集中到 7 状态状态机
- ITE `_SMB_BATT1_ADDR=0x16`、`_SMB_CHGRA_ADDR=0x12` → DTS 中对应 I2C 子节点的 `reg` 属性

##### 风扇与热管理：从 PWM 查表到 thermal 框架

ITE 侧：`OEM_FAN.C:Fan1_Control()` 通过 PECI 读取 CPU 温度，查 `_FAN1_DNT_TBL`/`_FAN1_UPT_TBL` 温度-占空比表，步进式调整 PWM 占空比。温度阈值和 PWM 值与硬件强绑定。

Zephyr 侧：对应到 `app/thermal_management/thermalfan.c` 的缓启动/缓降算法（含 RPMACC 容差）和 8 模式 ITS。详细见第 4 章风扇与热管理部分。

迁移动作：
- ITE `_FAN1_DNT_TBL`/`_FAN1_UPT_TBL` 温度-PWM 表 → ITS 各模式的 `fan_instance` 配置
- ITE PECI 温度读取 → Zephyr PECI 驱动（Intel 平台）或 I2C 传感器（AMD 平台）
- ITE `Fan1_Control()` 步进逻辑 → `fan1_control()` 缓启动/缓降算法

##### 主机通信：从 KBC 寄存器到 eSPI 驱动

ITE 侧：主机通信通过 eSPI Peripheral Channel 完成，但代码中仍以 KBC（Keyboard Controller）风格操作——`IRQ_INT24_KBCIBF()` 检测 IBF（输入缓冲满），读取命令字节分发给处理函数（`CORE_HOSTIF.C:22` 的 `Data_To_Host()` 写入 KBHIKDOR 寄存器）。eSPI Virtual Wire 中断由 `IRQ_INT154_eSPI_VWINT()` 处理（含 PLTRST 跟踪）。

Zephyr 侧：对应到 `app/smchost/` 的 `smchost_acpi_handler()`——eSPI Peripheral Channel 自动完成 I/O 周期到 ACPI 接口的转换，`smchost_cmd_handler()` 统一分发 ACPI 命令（0x80-0x84）。详细见第 4 章 SMC 主机接口部分。

迁移动作：
- ITE `IRQ_INT24_KBCIBF()` ISR → Zephyr eSPI 驱动的 IBF 事件 → `smchost_signal_request()`
- ITE `Data_To_Host()` → `smchost` 框架自动管理 OBF
- ITE `IRQ_INT154_eSPI_VWINT()` → Zephyr eSPI VW 中断处理
- ITE SCI 事件发送 → `smchost_queue_sci(code)` + Virtual Wire 自动触发

##### ACPI/SCI 事件：从分散调用到事件框架

ITE 侧：SCI 事件码和发送逻辑散落在各 OEM 模块中。电池模块在 `Update_ACPI_BST1()` 中检测状态变化后发送 SCI；热管理模块在温度超限时发送 SCI。

Zephyr 侧：40+ 个 SCI 码集中在 `scicodes.h` 定义。系统事件通过 `notify_subsystems()` 广播给所有子系统，SCI 生成由 `smchost` 模块集中管理。

迁移动作：
- ITE 各模块独立的 SCI 发送 → 统一由 `smchost_queue_sci()` 入队
- ITE ACPI 方法（BIF/BST 等）→ 对应 `smchost` 的 ACPI 读写处理
- ITE 分散的 SCI 码 → `scicodes.h` 集中维护

#### 从宏定义到设备树：硬件描述转换实战

以下以 ITE 固件中真实的 GPIO 定义为原型，展示到 Zephyr DTS 的完整转换。

ITE `OEM_GPIO.H` 中电源控制相关的引脚定义（ADL-N 平台的真实代码）：

```c
// OEM_GPIO.H — ITE 风格的 GPIO 定义
// 端口 C 引脚
#define ALL_SYS_PWRGD_HI()       SET_MASK(GPDRA, BIT(2))   // line 241
#define PM_PCH_PWROK_HI()        SET_MASK(GPDRA, BIT(1))   // line 323

// 端口 H 引脚
#define PCH_RSMRST_HI()          SET_MASK(GPDRH, BIT(1))   // line 410
#define EC_PWR_LATCH_HI()        SET_MASK(GPDRH, BIT(4))   // line 426
#define BATT_DET                  GPIOH4_IN                // line 430

// 端口 E 引脚
#define PM_SLP_SUS_N             GPIOE1_IN                 // line 307
#define EC_PROCHOT_LO()          CLEAR_MASK(GPDRE, BIT(0)) // line 285

// SMBus 通道寄存器（CORE_SMBUS.C:11）
// asSMBus[] — 每个通道一组寄存器地址：
// {HOCTL, TRASLA, HOCMD, HOSTA, D0REG, D1REG, HOBDB, IER, ISR, PECERC}
```

转换为 CSCE250X Zephyr 设备树：

```dts
// CSCE250X 板级 DTS — 等效硬件描述
&gpioa {   // 对应 ITE GPIOA（ALL_SYS_PWRGD 等）
    status = "okay";
};

&gpioh {   // 对应 ITE GPIOH（PCH_RSMRST、EC_PWR_LATCH 等）
    status = "okay";
};

// pinctrl 中集中定义引脚功能
&pinctrl {
    pwr_ctrl_default: pwr_ctrl_default {
        group1 {
            pinmux = <PA2_GPIO>,  // ALL_SYS_PWRGD
                     <PA1_GPIO>,  // PM_PCH_PWROK
                     <PH1_GPIO>,  // PCH_RSMRST
                     <PH4_GPIO>;  // EC_PWR_LATCH
            drive-strength = "medium";
        };
    };
};

// I2C 总线上的从设备
&i2c0 {
    status = "okay";
    clock-frequency = <I2C_BITRATE_STANDARD>;

    battery@16 {
        compatible = "smart-battery";
        reg = <0x16>;  // 对应 ITE _SMB_BATT1_ADDR
    };

    charger@12 {
        compatible = "renesas,bd99950";
        reg = <0x12>;  // 对应 ITE _SMB_CHGRA_ADDR
    };
};

// PWM 输出（对应 ITE PWM 通道）
&pwm0 {
    status = "okay";
    pinctrl-0 = <&pwm0_default>;
    pinctrl-names = "default";
};
```

转换的关键原则：

- ITE 的 `SET_MASK(GPDRx, BIT(n))` / `CLEAR_MASK(GPDRx, BIT(n))` 宏 → 不再需要，引脚操作由 Zephyr GPIO API（`gpio_pin_set_dt()` 等）完成
- ITE 的 `GPIOx_IN` 读取宏 → `gpio_pin_get_dt()`
- ITE `asSMBus[]` 寄存器映射表（`{HOCTL, TRASLA, ...}`） → 由 Zephyr I2C 驱动内部管理，上层只需 DTS 中声明设备地址
- ITE `OEM_PROJECT.H` 中的 `SUPPORT_XXX TRUE/FALSE` → 对应 Kconfig 项（如 `CONFIG_BATTERY=y`、`CONFIG_PWM=y`）

#### 分阶段迁移策略

将 ITE 固件一次性全部重写为 Zephyr 应用不仅风险高，而且难以调试。推荐采用渐进式迁移策略。

| 阶段 | 目标 | 从 ITE 提取的材料 | 验证方式 | 预计耗时 |
|------|------|-------------------|----------|----------|
| Phase 1：最小启动 | Zephyr 能运行，串口输出 | 原理图中的 UART 引脚 | 串口工具看到 `uart:~$` | 1-2 天 |
| Phase 2：GPIO 控制 | 逐引脚验证映射 | `OEM_GPIO.H` 中全部 ∼200 个引脚定义 → Excel 对照表 | Shell `gpio set/get` + 万用表 | 1-2 天 |
| Phase 3：I2C/SMBus | 读写电池/充电器寄存器 | `OEM_BATTERY.C` 中的 `_SMB_BATT1_POLL_TBL[]` 和 `_SMB_CHGRA_POLL_TBL[]` | `i2c scan` + `i2c read` 读取已知寄存器 | 1-2 天 |
| Phase 4：电源序列 | S5→S0 上电，主板亮机 | `OEM_POWER.C` 中的 `ADL_N_sSEQ_S5_to_S0[]`（22 步）和 `sSEQ_S0_to_S5[]`（18 步） | 逻辑分析仪捕获时序后接入主板 | 3-5 天 |
| Phase 5：键盘 + 主机通信 | 按键输入、SCI 事件 | `CORE_SCAN.C` 扫描码映射表 + SCI 码表 | 逐键验证 + `acpi_listen` | 3-5 天 |
| Phase 6：完整集成 | 全部 EC 功能，系统级测试 | `OEM_BATTERY.C` 电池逻辑、`OEM_FAN.C` 风扇逻辑 | 第 6 章功能验证清单 + 24h 压力测试 | 5-10 天 |

##### Phase 1：最小启动

这是迁移的起点，目标仅为验证 Zephyr 能在 CSCE250X 上成功运行。

1. 创建板级目录 `boards/chipsea/<customer_board>/`
2. 参考 `csce250x_evb` 的 BSP 文件，创建最小 DTS（仅含时钟、UART 控制台）
3. 在 `prj.conf` 中禁用所有可选功能（`CONFIG_EC_POWER_MGMT=n` 等），仅保留串口和 Shell
4. `west build` 编译，烧录，在串口终端看到 `uart:~$` 提示符即成功

##### Phase 2：GPIO 基础控制

这是迁移过程中工作量最大的非逻辑步骤——需要将 ITE 的 ∼200 个引脚定义逐一对齐到 CSCE250X。

1. 从 `OEM_GPIO.H` 提取所有 `#define xxx_HI()` / `#define xxx_LO()` 宏，整理为 Excel 表：ITE 信号名 → ITE 端口/引脚 → 原理图网络名 → CSCE250X 端口/引脚
2. 在 DTS 中添加目标平台的所有 GPIO 端口并配置 pinctrl
3. 通过 Shell 逐引脚验证电平（`gpio set` + 万用表，`gpio get` 读输入）
4. 特别注意：ITE 的某些 GPIO 在 eSPI/LPC 模式下的复用配置（Port M）需要在 CSCE250X 上等效配置

##### Phase 3：I2C/SMBus 通信

电池和充电器通常是 EC 最先需要对接的外设。

1. 从 ITE `CORE_SMBUS.C:asSMBus[]` 确定使用的 SMBus 通道，在 CSCE250X DTS 中使能对应的 I2C 控制器
2. 从 ITE `OEM_BATTERY.C` 的 `_SMB_BATT1_POLL_TBL[]` 和 `_SMB_CHGRA_POLL_TBL[]` 提取所有寄存器地址作为验证清单
3. 使用 Shell 的 `i2c scan` 确认总线上能扫描到设备地址（0x16、0x12）
4. 使用 `i2c read` 逐寄存器读取，与 ITE 平台的读取值对比（如制造商名、设计容量、电池状态字）

##### Phase 4：电源序列上电

这是整个迁移过程中最关键也最危险的阶段——错误的时序可能导致主板损坏。

1. 从 ITE `OEM_POWER.C` 的 `ADL_N_sSEQ_S5_to_S0[]`（22 步）和 `sSEQ_S0_to_S5[]`（18 步）提取完整时序表：步骤顺序、信号名、延时、依赖条件
2. 将所有 `PF_xxx` 函数指针映射为 CSCE250X 上对应的 GPIO 操作
3. 在 CSCE250X 板级 DTS 中定义所有电源控制 GPIO 信号节点
4. 在 `pwrplane.c` 中编写对应的 `power_seq_struct` 序列表
5. 先用逻辑分析仪挂接所有电源信号，在不连接真实主板的情况下验证时序波形
6. 波形正确后再接入主板测试，建议使用限流电源以保护电路
7. 推荐技巧：在 ITE 固件中添加辅助 GPIO 翻转标记，用逻辑分析仪同时捕获两个芯片的电源序列，逐步骤对齐时序

##### Phase 5：键盘 + 主机通信

1. 从 ITE `OEM_GPIO.H` 的 KSO/KSI 控制寄存器配置中提取矩阵尺寸和引脚映射
2. 在 DTS 中配置 `kbs_matrix` 节点
3. 从 ITE `CORE_SCAN.C` 的扫描码转换逻辑提取完整键位映射表，转换为 `oem_keymap.h`
4. 逐按键验证扫描码，特别注意 Fn 组合键和 ITE 特有的 FnLock 等行为
5. 配置 eSPI 通道（Peripheral、Virtual Wire、OOB）
6. 在主机端执行 `acpi_listen`，触发各种 EC 事件确认 SCI 正确到达

##### Phase 6：完整集成与调优

所有模块接入后，执行第 6 章的功能验证清单，重点关注：

- 完整电源状态转换（S0↔S3↔S5↔G3）的稳定性
- 电池充放电全周期行为正确性（对标 ITE `OEM_BATTERY.C` 的状态逻辑）
- 风扇在不同温度下的转速曲线（对标 ITE `_FAN1_DNT_TBL`/`_FAN1_UPT_TBL`）
- 长时间运行稳定性（至少 24 小时压力测试）
- OTA 升级流程的可靠性

#### 常见陷阱与注意事项

1. Bank 切换的思维惯性：ITE 固件中函数分布在 4 个 Bank 中，跨 Bank 调用需要经过公共区域跳转，这导致代码被人为拆分。迁移到 ARM 后无需 Bank 切换，应将原本分散在各 Bank 中的相关逻辑重新组织到同一模块中。

2. 内存模型的思维转变：ITE C51 下 `uint8_t` 是自然选择（XDATA 仅 4-16KB），ARM 下可放心使用 `uint32_t` 和标准数据结构。但注意结构体对齐差异——C51 结构体按 1 字节对齐，ARM 按 4 字节对齐，涉及 EEPROM 持久化数据的结构体需显式打包（`__attribute__((packed))`）。

3. 中断优先级重新分配：ITE 使用 IVECT 寄存器分发中断，所有中断优先级相同。ARM NVIC 支持最多 256 级优先级——应将 1ms 定时器和 eSPI VW 设为高优先级，GPIO 状态变化设为中优先级，SMBus/I2C 完成中断设为低优先级。

4. 服务标志位到事件对象的转换：ITE 的 `F_Service_PCI`/`F_Service_KEY` 等位标志是全局变量，无并发保护。Zephyr 中每个子系统使用独立的 `k_event` 对象，通过 `notify_subsystems()` 广播——这提供了更好的隔离性，但也意味着需要重新梳理模块间的事件依赖关系。

5. 时序假设的失效：ITE 裸机代码依赖确定性指令时序（如写 GPIO 后延时若干 `nop` 再读回），在 RTOS 多线程环境下不成立。电源序列等时序严格要求的功能应使用 `pwrseq` 框架或硬件定时器。

6. 寄存器位操作的原子性：C51 是 8 位处理器，位操作天然原子。ARM 上 Read-Modify-Write 序列可能被中断或高优先级线程打断，使用 `sys_set_bit()`/`sys_clear_bit()` 等原子操作函数。

7. `OEM_PROJECT.H` 到 Kconfig 的转换：将 ITE 的 `#define SUPPORT_XXX TRUE/FALSE` 逐项转换为 Kconfig 项时，注意依赖关系——如启用 `SUPPORT_SMART_BATTERY` 还需启用 I2C 和 SMBus 子系统。建议先启用最小集，再按依赖链逐步启用。

8. eSPI 配置的完整性：ITE 的 eSPI 在 `OEM_PROJECT.H`（`SUPPORT_INTERFACE_eSPI=TRUE`）和 `OEM_GPIO.H` 的 Port M 引脚复用处配置。CSCE250X 需在 DTS 和 Kconfig 中分别配置 eSPI 控制器和各虚拟通道，缺一不可。

9. 电池学习模式（Learn Mode）的差异：ITE 固件中电池学习模式通常通过特定的 SMBus 命令序列实现，逻辑深藏在 `OEM_BATTERY.C` 的 `Hook_Timer1SecEvent()` 等多处。迁移时需仔细追踪所有相关逻辑点，确保学习模式的状态机完整迁移。

