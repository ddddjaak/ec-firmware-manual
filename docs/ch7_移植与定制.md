<div class="chapter-header"><span class="chapter-num">07</span><span class="separator">/</span><a href="index.md">首页</a><span class="separator">›</span><span>移植与定制</span></div>

# 移植与定制


将 Zephyr EC 框架移植到新的硬件平台，或为现有平台进行深度功能定制，是嵌入式开发者的高阶技能。本章将系统性地阐述从零开始构建一个新硬件平台支持包的完整过程，涵盖从最基础的工程创建、芯片架构初始化，到设备树配置、驱动适配，最终进行系统级的资源与功能优化。通过本章的学习，开发者将掌握在 Zephyr 体系下进行平台移植与定制的核心方法论。

## 新平台移植流程（Porting Guide）

移植工作并非一蹴而就，而是需要从前期评估到分阶段验证的系统化工程。本节介绍移植前的准备工作、BSP 创建流程以及推荐的分阶段移植策略。

### 移植前期准备与评估

在动手编写代码之前，必须先对目标平台和现有资源进行全面评估。充分的准备可以避免后期反复修改架构配置。

- 硬件资料准备：芯片数据手册（Datasheet）、参考原理图（Reference Schematic）、引脚分配表（Pin Assignment Table）是移植工作的三大基础文档。

- 软件环境确认：确保已安装 Zephyr 3.7.0 SDK、west 工具和 ARM Cortex-M 编译工具链。请参考2章开发环境准备。

- 选择参考 BSP：从 ecfw-zephyr/boards 目录中选择与目标芯片架构最接近的已有板级作为模板，可以大幅减少工作量。

- 调试工具到位：J-Link 或 DAP-Link 调试器、逻辑分析仪和串口工具是移植验证的必备硬件。

- 芯片启动方式确认：了解目标芯片的 boot ROM 行为、默认时钟配置和内部 flash 分区布局。

| 类别 | 内容 | 获取方式 |
|------|------|----------|
| 硬件 | 芯片数据手册、参考原理图、引脚分配表 | 原厂提供 |
| 软件 | Zephyr 3.7.0 SDK、west、ARM 工具链 | Zephyr 官方下载 |
| 参考 | 同架构已有 BSP（如 NPCX、ITE 系列） | ecfw-zephyr/boards |
| 调试 | J-Link/DAP-Link、逻辑分析仪、串口工具 | 外购/团队配备 |

### 创建新板级支持包（Board Support Package, BSP）

BSP 是 Zephyr 对特定硬件板的完整描述集合。Zephyr 3.7.0 采用 Hardware Model v2，板级目录结构已从 `boards/<ARCH>/<board>` 变为 `boards/<VENDOR>/<board>`。

一个完整的 BSP 目录包含以下文件：

```
boards/chipsea/csce250x_evb/
├── board.yml                         # 必需：板级元数据
├── Kconfig.csce250x_evb              # 必需：SoC 选择
├── Kconfig.defconfig                 # 可选：板级默认 Kconfig 值
├── csce250x_evb_csce2501_defconfig   # 必需：合并到 .config 的默认配置
├── csce250x_evb_csce2501.dts         # 必需：板级设备树
├── csce250x_evb-pinctrl.dtsi         # 必需：引脚控制配置
├── board.cmake                       # 可选：flash/debug runner
└── csce250x_evb_csce2501.yaml        # 可选：twister 测试元数据
```

`board.yml` 定义板级名称和关联 SoC：

```yaml
board:
  name: csce250x_evb
  full_name: Chipsea CSCE250X Evaluation Board
  vendor: chipsea
  socs:
    - name: csce2501
```

`Kconfig.csce250x_evb` 选择对应 SoC：

```kconfig
config BOARD_CSCE250X_EVB
    select SOC_CSCE2501
```

`csce250x_evb_csce2501_defconfig` 设置基础硬件配置：

```
CONFIG_SOC_CSCE2501=y
CONFIG_BOARD_CSCE250X_EVB=y
CONFIG_SERIAL=y
CONFIG_CONSOLE=y
CONFIG_UART_CONSOLE=y
CONFIG_GPIO=y
CONFIG_PINCTRL=y
CONFIG_HW_STACK_PROTECTION=y
```

板级 DTS 文件的编写详见本章3.2节，Kconfig 配置体系详见3.5节。

### 分阶段移植策略

移植不应一步到位，而应采用渐进式策略，每个阶段都有明确的产物和验证手段：

1. Phase 1：最小启动（Minimal Boot）——完成 SoC 初始化、时钟配置、串口输出和 LED 点亮。验证方式：串口工具观察到 hello world 输出。

2. Phase 2：控制台与 Shell——启用 UART console 和 Zephyr Shell，验证调度器和基本驱动框架。验证方式：输入 `kernel version` 和 `device list` 命令。

3. Phase 3：基础驱动适配——逐个适配 GPIO、I2C、SPI、ADC、PWM、pin control 等基础外设驱动。验证方式：逻辑分析仪或万用表验证引脚电平。

4. Phase 4：完整 EC 功能——接入电源时序、键盘扫描、eSPI 主机通信、热管理、电池管理等 EC 专有模块。验证方式：接入实际主板联调。

| 阶段 | 产物 | 验证方式 |
|------|------|----------|
| Phase 1 | 固件可启动，串口输出 hello world | 串口工具观察输出 |
| Phase 2 | Shell 命令可交互 | 输入 kernel version / device list |
| Phase 3 | 外设可读写 | 逻辑分析仪 / 万用表验证 |
| Phase 4 | 完整 EC 功能运行 | 接入主板联调 |

每个阶段失败时，应停留在当前阶段排查问题，切勿跳到下一阶段。请参考6章调试与验证中关于日志和 Shell 的使用方法。

## 板级初始化（Board Init / PinMux / Clock）

板级初始化是从复位到应用层启动的桥梁，涉及启动流程、链接脚本、时钟树、引脚控制和板级特定代码。

### 启动流程与链接脚本（Linker Script）

ARM Cortex-M 的启动流程遵循 Zephyr 标准序列：

1. 复位向量（Reset Vector）——从 flash 首地址加载初始栈指针和 reset handler 地址。

2. Reset handler——调用 `SystemInit()`，完成时钟配置和 FPU 使能。

3. 数据段复制——将 data 段从 flash 复制到 SRAM，BSS 段清零。

4. `PRE_KERNEL_1` 阶段——初始化基本硬件驱动（时钟、pin control）。

5. `PRE_KERNEL_2` 阶段——初始化通信驱动（UART、I2C）。

6. 内核启动——调度器开始运行，创建 idle 纶程和系统工作队列。

7. POST_KERNEL / APPLICATION 阶段——执行 `SYS_INIT` 注册的板级和应用初始化函数。

8. main()——应用层入口，开始 EC 业务逻辑。

Zephyr 自动提供 Cortex-M 的链接脚本（`include/zephyr/arch/arm/cortex_m/scripts/linker.ld`），内存区域由设备树 chosen 节点决定，无需手动编写 MEMORY 段。

flash 分区通过 DTS 定义：

```c
&flash0 {
    partitions {
        compatible = "fixed-partitions";
        #address-cells = <1>;
        #size-cells = <1>;

        boot_partition: partition@0 {
            label = "mcuboot";
            reg = <0x00000000 0x00010000>;
        };
        slot0_partition: partition@10000 {
            label = "image-0";
            reg = <0x00010000 0x00040000>;
        };
        slot1_partition: partition@50000 {
            label = "image-1";
            reg = <0x00050000 0x00040000>;
        };
        storage_partition: partition@D0000 {
            label = "storage";
            reg = <0x000D0000 0x00030000>;
        };
    };
};
```

注意事项

- chosen 节点中的 `zephyr,code-partition` 决定固件链接地址，必须指向正确的 slot0_partition。

- EC 固件在 flash 写/擦除期间 CPU 不能执行来自 flash 的代码，需要将 flash 操作函数放入 RAM（使用 `__soc_ram_code` 属性）并在操作期间 `irq_lock()` 禁止中断。这是 EC 与通用 MCU 的关键区别。

###  时钟树（Clock Tree）配置

CSCE250X 系列的时钟树以内部高速 RC 振荡器（HRC，16 MHz）或外部高速晶振（HSE，典型 12 MHz）为源，经 PLL 倍频后产生系统主时钟（SYSCLK，默认 120 MHz），再分频为各外设总线时钟。

芯片默认使用 HRC/2 作为 PLL 时钟源（8 MHz → PLL ×15 → 120 MHz PLL_HF），无需外部晶振即可运行。使用外部 HSE 时可获得更好的频率精度。

时钟配置在板级 DTS 中声明：

```c
&rcc {
    clocks = <&clk_hse &pll>;
    clock-frequency = <DT_FREQ_M(120)>;  // SYSCLK = 120 MHz
    clk_hse: clk-hse {
        compatible = "chipsea,csce250x-hse-clock";
        clock-frequency = <DT_FREQ_M(12)>;  // 外部晶振 12 MHz
        status = "okay";
    };
    pll: pll {
        compatible = "chipsea,csce250x-pll-clock";
        clock-output-names = "pll_lf", "pll_hf";  // PLL_LF=60MHz, PLL_HF=120MHz
        status = "okay";
    };
};
```

对应的 Kconfig 指定系统时钟频率：

```kconfig
config SYS_CLOCK_HW_CYCLES_PER_SEC
    default 120000000
```

实际 PLL 配置在 HAL 层初始化代码 `system_csce250x.c` 中完成：`HRC/2 → PLLMUL=15 → PLL_HF=120MHz`。

设计要点

- PLL 配置参数（mult/div）必须与芯片数据手册中的 PLL 倍频系数表一致，错误的倍频可能导致芯片运行在超出规格的频率。

- 未使用的外设时钟应在 Kconfig 中禁用（`CONFIG_CLOCK_CONTROL_<PERIPH>=n`），以降低功耗。

- 在 Phase 1 最小启动阶段，建议先使用芯片默认时钟配置（boot ROM 设置），确认串口输出后再切换到 PLL 高速模式。

### 引脚控制（Pin Control）与复用

Zephyr 3.7 的 Hardware Model v2 强制要求使用 pinctrl 机制管理引脚复用。每个外设的引脚配置不再硬编码在驱动中，而是在板级 `*-pinctrl.dtsi` 文件中集中定义。

板级 pinctrl 配置文件示例：

```c
&pinctrl {
    uart0_default: uart0_default {
        group1 {
            pinmux = <PB6_UART0_TX>, <PB7_UART0_RX>;
            drive-strength = "medium";
        };
    };
    i2c0_default: i2c0_default {
        group1 {
            pinmux = <PB8_I2C0_SCL>, <PB9_I2C0_SDA>;
            bias-pull-up;
            drive-open-drain;
        };
    };
    spi0_default: spi0_default {
        group1 {
            pinmux = <PA4_SPI0_MOSI>, <PA5_SPI0_MISO>,
                     <PA6_SPI0_SCLK>, <PA7_SPI0_CS>;
        };
    };
};
```

外设节点通过 `pinctrl-0` 属性引用对应的引脚状态：

```c
&uart0 {
    pinctrl-0 = <&uart0_default>;
    pinctrl-names = "default";
    status = "okay";
    current-speed = <115200>;
};
```

驱动端使用宏获取 pinctrl 配置：

```c
PINCTRL_DT_DEFINE(DT_NODELABEL(uart0));

static int uart_csce250x_init(const struct device *dev)
{
    const struct pinctrl_dev_config *pcfg =
        PINCTRL_DT_DEV_CONFIG_GET(DT_NODELABEL(uart0));
    pinctrl_apply_state(pcfg, PINCTRL_STATE_DEFAULT);
    /* ...后续初始化... */
    return 0;
}
```

设计要点

- 所有引脚复用配置必须集中在 pinctrl.dtsi 文件中，严禁在驱动代码中直接操作引脚复用寄存器。

- EC 板级通常需要几十组 pinmux 配置（UART、I2C、SPI、eSPI、Keyboard Scan、ADC 等），建议按外设功能分 group 组织，便于后续维护和板级差异切换。

- 空闲引脚应配置为 GPIO 输入下拉模式，避免浮空引起的功耗和干扰问题。

### 板级特定初始化代码

部分 EC 特定的初始化逻辑无法通过 DTS/Kconfig 表达，需要在 C 代码中实现。Zephyr 提供多个初始化级别和优先级供板级代码介入。

板级初始化函数示例：

```c
#include <zephyr/device.h>
#include <zephyr/drivers/gpio.h>
#include <zephyr/init.h>

/* EC 电源轨监控 GPIO */
static const struct gpio_dt_spec pwr_good =
    GPIO_DT_SPEC_GET(DT_NODELABEL(pwr_good), gpios);

static int board_csce250x_init(void)
{
    /* 检查 EC 电源就绪信号 */
    if (gpio_pin_configure_dt(&pwr_good, GPIO_INPUT) < 0) {
        return -EIO;
    }

    /* EC 特定：电池检测初始化 */
    battery_detect_init();

    /* EC 特定：风扇曲线预加载 */
    thermal_load_default_curve();

    return 0;
}

/* POST_KERNEL 级别，优先级低于驱动初始化 */
SYS_INIT(board_csce250x_init, POST_KERNEL,
         CONFIG_BOARD_INIT_PRIORITY);
```

对于更早的初始化需求，可以使用 `soc_early_reset_hook()` 在 reset handler 之后立即执行：

```c
void soc_early_reset_hook(void)
{
    /* 极早期：配置 EC 看门狗超时，防止启动卡死 */
    CSCE250X_WDT->CTRL = WDT_CTRL_TIMEOUT_8S | WDT_CTRL_ENABLE;
}
```

注意事项

- `SYS_INIT` 的级别（PRE_KERNEL_1 / PRE_KERNEL_2 / POST_KERNEL / APPLICATION）决定了执行顺序。板级初始化通常放在 POST_KERNEL 或 APPLICATION 级别。

- 需要在 SoC 初始化之前执行的极早期代码放在 `soc_early_reset_hook()` 中，但此时大部分驱动尚未就绪，只能操作寄存器级别。

## 设备树与驱动适配（Devicetree / Binding / Driver）

设备树（Devicetree）和驱动绑定（Binding）是 Zephyr 硬件描述和驱动匹配的核心机制。本节从基础概念出发，逐步讲解 DTS 编写、驱动绑定启用和裁剪适配。

### 设备树（Devicetree）基础概念

设备树是一种描述硬件拓扑的数据结构，以树形节点组织外设信息。Zephyr 在编译时解析 DTS，将硬件描述转化为 C 宏和 Kconfig 符号，供驱动代码使用。

DTS 的核心语法元素：

| 关键字 | 含义 | 示例 |
|--------|------|------|
| `compatible` | 驱动匹配字符串 | `"chipsea,csce250x-gpio"` |
| `reg` | 寄存器基址与长度 | `<0x40000000 0x400>` |
| `status` | 节点启用状态 | `"okay"` 或 `"disabled"` |
| `interrupts` | 中断号与触发方式 | `<15 0>` (IRQ 15, level) |
| `clocks` | 时钟源依赖 | `<&rcc 0x10>` |
| `#address-cells` / `#size-cells` | 子节点地址编码方式 | `<1>`, `<1>` |

DTS 与 Kconfig 的职责分工是移植者必须理解的核心理念：

| 配置项 | 用 DTS | 用 Kconfig |
|--------|--------|------------|
| 外设基地址 | ✓ 描述硬件存在 | ✗ |
| I2C 从设备地址 | ✓ 描述硬件拓扑 | ✗ |
| GPIO 引脚分配 | ✓ pinctrl 定义 | ✗ |
| 中断线分配 | ✓ 描述硬件连接 | ✗ |
| 功能是否启用 | ✗ | ✓ 软件策略开关 |
| 缓冲区大小 | ✗ | ✓ 运行时参数 |
| 线程优先级 | ✗ | ✓ 软件调度策略 |
| 日志级别 | ✗ | ✓ 开发调试选项 |

核心规则：硬件存在性用 DTS，软件策略用 Kconfig。 详见3.2驱动、设备树与Kconfig的关系。

### 编写板级设备树源文件（.dts）

板级 DTS 文件是 BSP 的核心，描述了具体的硬件连接和配置。编写流程如下：

1. 声明 DTS 版本和引用 SoC 级 DTSI。

2. 定义根节点 `/`，设置 `model` 和 `compatible`。

3. 配置 `chosen` 节点——决定 Zephyr 使用哪些硬件资源。

4. 定义 `aliases`——为常用设备提供短名称。

5. 逐个外设节点设置 `status = "okay"` 并配置板级参数。

完整的板级 DTS 示例：

```c
/dts-v1/;

#include <chipsea/csce2501.dtsi>

/ {
    model = "Chipsea CSCE250X Evaluation Board";
    compatible = "chipsea,csce250x_evb";

    chosen {
        zephyr,sram = &sram0;
        zephyr,flash = &flash0;
        zephyr,console = &uart0;
        zephyr,shell-uart = &uart0;
        zephyr,code-partition = &slot0_partition;
    };

    aliases {
        led0 = &green_led;
        sw0 = &user_button;
    };

    leds {
        compatible = "gpio-leds";
        green_led: led_0 {
            gpios = <&gpioa 5 GPIO_ACTIVE_HIGH>;
        };
    };

    buttons {
        compatible = "gpio-keys";
        user_button: button_0 {
            gpios = <&gpioa 0 (GPIO_ACTIVE_LOW | GPIO_PULL_UP)>;
        };
    };
};

/* 使能外设 */
&uart0 {
    pinctrl-0 = <&uart0_default>;
    pinctrl-names = "default";
    status = "okay";
    current-speed = <115200>;
};

&i2c0 {
    pinctrl-0 = <&i2c0_default>;
    pinctrl-names = "default";
    status = "okay";
    clock-frequency = <I2C_BITRATE_FAST>;
};

&gpioa {
    status = "okay";
};
```

注意事项

- `chosen` 节点中的 `zephyr,console` 和 `zephyr,shell-uart` 通常指向同一个 UART，这是 Shell 交互的基础。

- `aliases` 中的 `led0` 和 `sw0` 是 Zephyr 示例程序（如 Blinky）约定使用的别名名称，必须提供以兼容标准 sample。

- SoC 级 DTSI 中所有外设默认 `status = "disabled"`，板级 DTS 中仅使能实际使用的设备。

###  驱动绑定与启用

驱动绑定是设备树节点与驱动代码之间的桥梁。完整流程如下：

1. 设备树节点声明 compatible：`compatible = "vendor,device"` 是驱动匹配的唯一标识。

2. Zephyr 构建系统扫描 bindings 目录：匹配 `dts/bindings/*/vendor,device.yaml`。

3. Binding YAML 定义属性约束：指定哪些属性是 required、可选，以及类型约束。

4. 自动生成 Kconfig 符号：构建时 `scripts/dts/gen_driver_kconfig_dts.py` 为每个 compatible 生成 `DT_HAS_VENDOR_DEVICE_ENABLED` 宏。

5. Kconfig 中使用 DT_HAS_* 依赖：驱动 Kconfig 以 `depends on DT_HAS_*` 控制默认启用。

6. 驱动代码中宏注册：使用 `DEVICE_DT_DEFINE` 或 `DT_FOREACH_STATUS_OKAY` 实例化驱动。

Binding YAML 示例：

```yaml
description: Chipsea CSCE250X GPIO controller

compatible: "chipsea,csce250x-gpio"

include: [gpio-controller.yaml, base.yaml]

properties:
  reg:
    required: true
  interrupts:
    required: true
  clocks:
    required: true
  ngpios:
    type: int
    required: true
    description: Number of GPIO pins available
```

驱动注册代码示例：

```c
#define DT_DRV_COMPAT chipsea_csce250x_gpio

static int gpio_csce250x_init(const struct device *dev)
{
    /* 使用 DTS 中定义的寄存器基地址 */
    const struct gpio_csce250x_config *cfg = dev->config;
    /* ...初始化逻辑... */
    return 0;
}

DEVICE_DT_INST_DEFINE(
    gpio_csce250x_init,
    NULL,
    NULL,
    NULL,
    NULL,
    PRE_KERNEL_1,
    CONFIG_GPIO_INIT_PRIORITY,
    &gpio_api);
```

请参考3.2驱动、设备树与Kconfig的关系中关于 binding 生成流程的详细说明。

### 驱动裁剪与适配

不同板级对外设的需求差异很大，驱动裁剪和适配是定制化的核心环节。

功能说明

- 驱动裁剪：根据板级实际外设，选择性启用或禁用驱动模块。未使用的外设驱动应在 defconfig 中显式禁用（`CONFIG_I2C=n` 等）。

- 配置覆盖：通过 overlay 文件或 `Kconfig.defconfig` 覆盖驱动默认参数，如 I2C 时钟频率、UART 波特率、ADC 采样精度等。

- 参数适配：调整驱动缓冲区大小、中断优先级、DMA 通道分配等运行时参数，以匹配 EC 板级的资源约束。

- 引脚重映射：不同板级可复用同一驱动代码，仅需修改 pinctrl.dtsi 中的引脚配置。驱动代码本身不应包含任何硬编码的引脚号。

设计要点

- 裁剪时需注意驱动间的依赖关系——例如 I2C 依赖 GPIO 和 pinctrl，禁用 I2C 时应确认无其他驱动依赖 I2C 总线。

- 禁用驱动时同步关闭对应外设时钟，否则未使用的时钟会持续消耗功耗。Zephyr 的 clock control API 可在驱动 init 中申请和释放时钟。

- 硬件特性（如 GPIO 中断边沿类型、I2C 地址）应在 DTS 中描述，严禁在驱动代码中硬编码。驱动通过 `DT_PROP` 宏读取 DTS 属性。

## 功能与资源裁剪（Kconfig / Memory Optimization）

EC 固件运行在资源极为受限的 MCU 上（典型配置：256-512 KB Flash、64-256 KB SRAM）。系统化的裁剪和优化是量产固件的必经环节。

### 系统功能裁剪（通过Kconfig）

Kconfig 是 Zephyr 的功能裁剪核心工具。通过 `prj.conf` 或 `_defconfig` 文件，可以精确控制每个子系统是否参与编译。

关闭不需要的外设子系统：

```kconfig
CONFIG_SPI=n
CONFIG_CAN=n
CONFIG_USB=n
```

关闭 Shell（生产固件通常不需要交互 Shell）：

```kconfig
CONFIG_SHELL=n
CONFIG_SHELL_BACKEND_SERIAL=n
```

裁剪日志系统（从完整日志切换到最小日志）：

```kconfig
CONFIG_LOG=y
CONFIG_LOG_MODE_MINIMAL=y
CONFIG_LOG_DEFAULT_LEVEL=1
```

关闭文件系统（EC 通常不需要持久化存储）：

```kconfig
CONFIG_FILE_SYSTEM=n
CONFIG_FCB=n
```

裁剪网络栈（EC 不涉及以太网/Wi-Fi）：

```kconfig
CONFIG_NETWORKING=n
CONFIG_NET_L2_ETHERNET=n
```

请参考3.5 Kconfig与配置系统中关于配置生效流程的说明。

### 内存资源优化

EC 的 SRAM 通常只有 64-256 KB，每字节都很珍贵。内存优化的第一步是量化当前使用量。

Zephyr 提供内置工具分析内存占用：

```bash
west build -t ram_report
```

线程栈是 SRAM 的主要消费者。合理缩减栈大小：

```kconfig
CONFIG_MAIN_STACK_SIZE=1024
CONFIG_IDLE_STACK_SIZE=256
CONFIG_SYSTEM_WORKQUEUE_STACK_SIZE=512
CONFIG_ISR_STACK_SIZE=2048
```

注意事项

- 栈大小不可盲目缩减——栈溢出是最常见的隐性 crash 原因。建议在开发阶段使用 `CONFIG_THREAD_STACK_INFO=y` 和 `CONFIG_STACK_SENTINEL=y` 检测栈溢出。

- EC 中 1ms 周期任务（如 pwrseq_thread）的栈通常需要 2048 字节以容纳嵌套调用，而 100ms 低频任务可缩减到 512-1024 字节。

Heap 内存池控制：

```kconfig
CONFIG_HEAP_MEM_POOL_SIZE=4096
```

EC 固件中 heap 主要用于动态分配临时缓冲区（如 eSPI 共享内存窗口），通常 4-8 KB 足够。

### 代码大小优化（Compiler Flags）

Flash 空间同样受限（典型 256-512 KB），代码体积优化直接影响功能容纳能力。

编译器体积优化：

```kconfig
CONFIG_SIZE_OPTIMIZATIONS=y
```

该选项使 Zephyr 使用 `-Os` 编译优化级别（优化体积而非速度）。

链接时优化（LTO）——跨模块死代码消除：

```kconfig
CONFIG_LTO=y
```

LTO 可减小 10-20% 的 .text 段体积，但会增加编译时间约 2-3 倍。建议仅在 release 构建时启用。

断言和调试信息移除：

```kconfig
CONFIG_ASSERT=n
CONFIG_DEBUG=n
CONFIG_PRINTK=n
```

使用 `west build -t rom_report` 量化优化效果，输出各模块的 .text / .rodata / .data 段大小。

设计要点

- 建议维护两个配置文件：`prj_debug.conf`（保留日志、Shell、断言）用于开发调试；`prj_release.conf`（启用 -Os、LTO、关闭调试）用于量产发布。

- `rom_report` 和 `ram_report` 是量化优化的唯一可靠手段，凭直觉调整 CONFIG 项往往适得其反。

### 性能与资源的平衡

每项优化决策都涉及性能与资源的权衡，不存在绝对最优方案——只有最适合目标产品约束的方案。

功能说明

- 编译器优化级别：`-Os` 减小体积但可能降低循环密集型代码的执行速度；`-O2` 提升速度但增加体积。EC 的 1ms 周期任务对速度敏感，但大部分时间处于等待状态，`-Os` 是合理默认。

- LTO 优化：显著减小体积（10-20%），但编译时间增加 2-3 倍。CI 环境可承受，本地频繁编译可能影响开发效率。

- 驱动裁剪：禁用未使用的外设驱动（如 SPI、CAN）可节省 Flash 和 SRAM，但裁剪前必须确认无依赖链。

- 缓冲区调优：I2C/SPI/UART 缓冲区大小直接影响 SRAM 占用。EC 的 I2C 通信通常只需 32-64 字节缓冲区，而非默认的 256 字节。

- 频率权衡：降低 SYSCLK 频率可显著降低功耗（动态功耗 ∝ f·V²），但 eSPI 通信需要最低 48 MHz 保证时序合规。

设计要点

- 建议使用 `menuconfig` 交互式审查所有 CONFIG 项的选中状态，避免遗漏隐式依赖。

- 使用 `west build -t ram_report` 和 `west build -t rom_report` 建立资源使用基线，每次裁剪后重新量化对比。

- 在 Phase 3 驱动适配阶段就开始关注资源占用，而非等到 Phase 4 才优化——早期发现问题调整成本更低。

## 新驱动开发流程（New Driver Development）

当现有驱动无法覆盖 CSCE250X 的特定外设时，需要开发新驱动。Zephyr 的驱动模型提供了一套标准化的开发流程。

### 新驱动开发流程

新驱动开发遵循五个步骤，每步都有明确的产物和验证方式：

1. 定义 Kconfig 配置项——为新驱动创建编译开关。

   ```kconfig
   config SENSOR_CHIPSEA_CSCE_ADC
       bool "Chipsea CSCE250X ADC sensor driver"
       default y
       depends on DT_HAS_CHIPSEA_CSCE250X_ADC_ENABLED
       select ADC
       help
         Enable Chipsea CSCE250X internal ADC driver.
   ```

   验证：在 `menuconfig` 中可见并可切换该选项。

2. 编写设备树绑定文件——YAML binding 定义 compatible 和属性约束。

   在 `dts/bindings/sensor/chipsea,csce250x-adc.yaml` 中：

   ```yaml
   description: Chipsea CSCE250X internal ADC

   compatible: "chipsea,csce250x-adc"

   include: [sensor.yaml]

   properties:
     reg:
       required: true
     interrupts:
       required: true
     clocks:
       required: true
     resolution:
       type: int
       default: 12
       description: ADC resolution in bits
     sample-rate:
       type: int
       default: 1000
       description: Default sampling rate in Hz
   ```

   验证：`west build -t dt_bindings_check` 通过。

3. 实现驱动 API——遵循 Zephyr device driver model 编写驱动代码。

   ```c
   #define DT_DRV_COMPAT chipsea_csce250x_adc

   static int adc_csce250x_init(const struct device *dev)
   {
       const struct adc_csce250x_config *cfg = dev->config;

       /* 使能 ADC 时钟 */
       clock_control_on(cfg->clock_dev, cfg->clock_subsys);

       /* 配置 ADC 分辨率和参考电压 */
       CSCE250X_ADC->CFG = ADC_CFG_RES_12BIT | ADC_CFG_REF_INTERNAL;

       return 0;
   }

   static const struct adc_driver_api adc_csce250x_api = {
       .channel_setup = adc_csce250x_channel_setup,
       .read = adc_csce250x_read,
   };

   DEVICE_DT_INST_DEFINE(
       adc_csce250x_init,
       NULL,
       NULL,
       NULL,
       NULL,
       POST_KERNEL,
       CONFIG_ADC_INIT_PRIORITY,
       &adc_csce250x_api);
   ```

   验证：`west build` 编译通过，无链接错误。

4. 注册驱动到构建系统——在 `CMakeLists.txt` 中添加驱动源文件。

   ```cmake
   zephyr_library_sources(
       adc_csce250x.c
   )
   ```

   验证：`west build` 成功，驱动 .o 文件出现在编译产物中。

5. 编写测试用例验证——使用最小应用测试驱动功能。

   ```c
   #include <zephyr/drivers/adc.h>

   void main(void)
   {
       const struct device *adc_dev =
           DEVICE_DT_GET(DT_NODELABEL(adc0));

       if (!device_is_ready(adc_dev)) {
           printk("ADC device not ready\n");
           return;
       }

       struct adc_sequence seq = {
           .channels = BIT(0),
           .buffer = &sample_value,
           .buffer_size = sizeof(sample_value),
           .resolution = 12,
       };

       adc_read(adc_dev, &seq);
       printk("ADC value: %d\n", sample_value);
   }
   ```

   验证：在目标板级上运行，串口输出 ADC 读数。

| 步骤 | 产物 | 验证方式 |
|------|------|----------|
| 1. Kconfig | Kconfig 配置项 | menuconfig 可见 |
| 2. Binding | YAML binding 文件 | dt_bindings_check |
| 3. 驱动实现 | driver.c | west build 编译通过 |
| 4. 注册 | CMakeLists.txt | 链接成功 |
| 5. 测试 | test 应用 | 硬件实测读数 |

注意事项

- 驱动 API 必须遵循 Zephyr 标准接口（如 `adc_driver_api`、`gpio_driver_api`），不要自定义与标准 API 不兼容的接口。

- 新驱动的初始化级别应匹配其依赖——ADC 需要时钟，因此放在 POST_KERNEL 级别；纯 GPIO 可在 PRE_KERNEL_1 级别。

## 从传统 EC 平台迁移至 Chipsea Zephyr

前述章节介绍了在 Zephyr 生态内为新板卡创建 BSP 的标准流程。然而，芯海 EC 芯片的一个重要业务场景是芯片替代——客户希望用 CSCE250X 替换现有的 ITE（如 IT5571/IT5570）、Nuvoton（如 NPCX 系列）等传统 EC 芯片。这些传统平台的固件通常基于 C51 内核，运行在裸机或简易调度器上，与 Zephyr RTOS 的架构理念有根本性差异。

本章节以 ITE IT557x 系列的实际固件代码（ADL-N MRD 参考工程）为蓝本，提供从传统 EC 平台迁移到 Chipsea Zephyr 的实战指南。以下所有 ITE 侧代码示例均来源于真实工程文件，可直接对照查阅。

### 迁移概述与核心挑战

从传统 EC 平台迁移并非简单的"代码翻译"，而是一次架构层面的重构，面临三重核心挑战：

1. 内核架构跃迁：C51 是 8 位哈佛架构 MCU，内存分为 CODE（Flash，含 Bank 切换，典型 128KB）、XDATA（外部 RAM，4-16KB）、DATA（内部 RAM，128-256 字节）三个独立地址空间，需要通过 `code`/`xdata`/`data` 关键字显式管理。ITE 固件进一步将 CODE 空间划分为 4 个 Bank（`L51_BANK.A51` 管理切换），每个 Bank 32KB，函数调用跨 Bank 需通过公共区域（Common Area）跳转。而 CSCE250X 基于 ARM Cortex-M33（32 位 Von Neumann 架构），拥有统一线性地址空间和 256+ KB SRAM，不再需要 Bank 切换和内存空间关键字。

2. 运行时模型转变：ITE 固件采用"服务标志位分发"（Service Flag Dispatch）模式——ISR 设置标志位（如 `F_Service_PCI`、`F_Service_KEY`、`F_Service_MS_1`），`main()` 中的 `main_service()` 函数按优先级轮询这些标志并调用对应处理函数。这种模式是协作式的——每个处理函数必须快速返回，不能阻塞。Zephyr 采用抢占式多线程模型，每个子系统作为独立线程运行，可阻塞等待，由调度器按优先级抢占。

3. 硬件描述方式革命：ITE 固件通过 `#define` 宏定义寄存器地址和引脚号，使用 `SET_MASK()`/`CLEAR_MASK()` 宏直接操作寄存器。所有外设配置散落在各模块代码中。Zephyr 将硬件描述从代码中分离到设备树（DTS）中，驱动通过标准 API 间接访问硬件。

### 传统 EC 平台架构剖析（以 IT5571 为例）

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

### 架构差异对比

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

### 功能模块逐一迁移映射

以下基于 ITE 实际代码与 Chipsea Zephyr 模块进行精确对照。

#### 电源序列：从 sPowerSEQ 函数指针表到 pwrseq 框架

ITE 侧：电源序列由 `sPowerSEQ{func_ptr, delay_ms, checkstatus}` 结构体数组定义，每个步骤调用一个 `PF_xxx` 函数指针，通过 `Set_SysPowState()` 触发状态转换（`OEM_POWER.C`）。系统状态枚举（`_SYSTEM_S0=0x01`、`_SYSTEM_S3=0x03`、`_SYSTEM_S5=0x05`、`_SYSTEM_G3=0x06`）和过渡状态（`_PST_G3_to_S5=0x80` 等）在 `OEM_POWER.H` 中定义。

Zephyr 侧：对应到 `app/power_sequencing/pwrplane.c` 中的 `power_seq_struct` 序列数组和 `pwrseq_thread`（1ms 周期），系统状态采用 ACPI 标准枚举（`SYSTEM_S0_STATE` 等 15 个状态），详细状态机见第 4 章电源管理部分。

迁移动作：
- ITE 的 `PF_xxx` 函数指针 → 重写为 Zephyr 序列表中的 `POWER_SIGNAL()` 宏引用
- ITE 的 `checkstatus=1` 等待条件 → Zephyr 的 `process_power_seq()` 内置超时轮询
- ITE 的 `delay` 字段 → 直接映射到 `power_seq_struct.delay_ms`
- ITE 的 `_PST_S5_to_S0` 等过渡状态 → `SYSTEM_S5_S0_STATE` 等对应过渡状态

#### 键盘扫描：从 KSO/KSI 寄存器到 Zephyr kscan 驱动

ITE 侧：`Code/CORE/CORE_BANK0/CORE_SCAN.C:scan_keys()` 通过写 KSO 输出寄存器（`Write_Strobe()`）逐列驱动扫描线，读取 KSI 输入寄存器获取行状态，经过去抖（`debounce_key()`）、make/break 检测（`cscfnd()`）后生成扫描码。键盘矩阵参数（行数、列数、去抖时间）在 `OEM_GPIO.H` 的 KSO/KSI 控制寄存器初始化值中硬编码。

Zephyr 侧：键盘矩阵的硬件参数在 DTS 的 `kbs_matrix` 节点中声明，扫描由硬件控制器或 `kscan` 驱动完成。键位映射在 `kbs_keymap.h`/`oem_keymap.h` 中定义。

迁移动作：
- ITE `OEM_GPIO.H` 中的 KSO/KSI 寄存器配置 → DTS `kbs_matrix` 节点的 `row-gpios`/`col-gpios` 属性
- ITE `CORE_SCAN.C` 的扫描码 → `oem_keymap.h` 键位映射表
- ITE 的 boot key 序列（如 F2→BIOS Setup）→ `kbs_boot_keyseq.h`
- Set2→Set1 转换由 `keyboard_utility.c` 自动完成

#### 电池与充电：从 SMBus 轮询表到 battery/charge 子系统

ITE 侧：电池管理通过 SMBus 轮询表（`_SMB_BATT1_POLL_TBL[]`）和定时回调（`Hook_Timer100msEvent()` 等）实现。`PollSmartBattery()`（`OEM_BATTERY.C:139`）串行执行轮询表中的 SMBus 命令，读取电压、电流、RSOC、温度、电池状态等。充电器通过 `_SMB_CHGRA_POLL_TBL[]` 和 `PollSmartCharger()` 管理。电池状态机逻辑分散在各个 tick 回调中。

Zephyr 侧：对应到 `app/battery/battery.c` 的 7 状态状态机（`bat_sts_machine[]`，20 条转换路径）和 `app/charge/charge.c` 的独立 `charge_thread`。详细状态转换见第 4 章电池与充电控制部分。

迁移动作：
- ITE `_SMB_BATT1_POLL_TBL[]`（17 条 SMBus 命令）→ `bat1_polling_tabdata[]`（含成功/失败回调）
- ITE `_SMB_CHGRA_POLL_TBL[]` → `charger` 子系统的轮询表
- ITE `bRWSMBus(Channel, Protocol, Addr, Comd, Var, PECSupport)` → `i2c_write_read()`
- ITE 分散的电池状态逻辑 → 集中到 7 状态状态机
- ITE `_SMB_BATT1_ADDR=0x16`、`_SMB_CHGRA_ADDR=0x12` → DTS 中对应 I2C 子节点的 `reg` 属性

#### 风扇与热管理：从 PWM 查表到 thermal 框架

ITE 侧：`OEM_FAN.C:Fan1_Control()` 通过 PECI 读取 CPU 温度，查 `_FAN1_DNT_TBL`/`_FAN1_UPT_TBL` 温度-占空比表，步进式调整 PWM 占空比。温度阈值和 PWM 值与硬件强绑定。

Zephyr 侧：对应到 `app/thermal_management/thermalfan.c` 的缓启动/缓降算法（含 RPMACC 容差）和 8 模式 ITS。详细见第 4 章风扇与热管理部分。

迁移动作：
- ITE `_FAN1_DNT_TBL`/`_FAN1_UPT_TBL` 温度-PWM 表 → ITS 各模式的 `fan_instance` 配置
- ITE PECI 温度读取 → Zephyr PECI 驱动（Intel 平台）或 I2C 传感器（AMD 平台）
- ITE `Fan1_Control()` 步进逻辑 → `fan1_control()` 缓启动/缓降算法

#### 主机通信：从 KBC 寄存器到 eSPI 驱动

ITE 侧：主机通信通过 eSPI Peripheral Channel 完成，但代码中仍以 KBC（Keyboard Controller）风格操作——`IRQ_INT24_KBCIBF()` 检测 IBF（输入缓冲满），读取命令字节分发给处理函数（`CORE_HOSTIF.C:22` 的 `Data_To_Host()` 写入 KBHIKDOR 寄存器）。eSPI Virtual Wire 中断由 `IRQ_INT154_eSPI_VWINT()` 处理（含 PLTRST 跟踪）。

Zephyr 侧：对应到 `app/smchost/` 的 `smchost_acpi_handler()`——eSPI Peripheral Channel 自动完成 I/O 周期到 ACPI 接口的转换，`smchost_cmd_handler()` 统一分发 ACPI 命令（0x80-0x84）。详细见第 4 章 SMC 主机接口部分。

迁移动作：
- ITE `IRQ_INT24_KBCIBF()` ISR → Zephyr eSPI 驱动的 IBF 事件 → `smchost_signal_request()`
- ITE `Data_To_Host()` → `smchost` 框架自动管理 OBF
- ITE `IRQ_INT154_eSPI_VWINT()` → Zephyr eSPI VW 中断处理
- ITE SCI 事件发送 → `smchost_queue_sci(code)` + Virtual Wire 自动触发

#### ACPI/SCI 事件：从分散调用到事件框架

ITE 侧：SCI 事件码和发送逻辑散落在各 OEM 模块中。电池模块在 `Update_ACPI_BST1()` 中检测状态变化后发送 SCI；热管理模块在温度超限时发送 SCI。

Zephyr 侧：40+ 个 SCI 码集中在 `scicodes.h` 定义。系统事件通过 `notify_subsystems()` 广播给所有子系统，SCI 生成由 `smchost` 模块集中管理。

迁移动作：
- ITE 各模块独立的 SCI 发送 → 统一由 `smchost_queue_sci()` 入队
- ITE ACPI 方法（BIF/BST 等）→ 对应 `smchost` 的 ACPI 读写处理
- ITE 分散的 SCI 码 → `scicodes.h` 集中维护

### 从宏定义到设备树：硬件描述转换实战

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

### 分阶段迁移策略

将 ITE 固件一次性全部重写为 Zephyr 应用不仅风险高，而且难以调试。推荐采用渐进式迁移策略。

| 阶段 | 目标 | 从 ITE 提取的材料 | 验证方式 | 预计耗时 |
|------|------|-------------------|----------|----------|
| Phase 1：最小启动 | Zephyr 能运行，串口输出 | 原理图中的 UART 引脚 | 串口工具看到 `uart:~$` | 1-2 天 |
| Phase 2：GPIO 控制 | 逐引脚验证映射 | `OEM_GPIO.H` 中全部 ∼200 个引脚定义 → Excel 对照表 | Shell `gpio set/get` + 万用表 | 1-2 天 |
| Phase 3：I2C/SMBus | 读写电池/充电器寄存器 | `OEM_BATTERY.C` 中的 `_SMB_BATT1_POLL_TBL[]` 和 `_SMB_CHGRA_POLL_TBL[]` | `i2c scan` + `i2c read` 读取已知寄存器 | 1-2 天 |
| Phase 4：电源序列 | S5→S0 上电，主板亮机 | `OEM_POWER.C` 中的 `ADL_N_sSEQ_S5_to_S0[]`（22 步）和 `sSEQ_S0_to_S5[]`（18 步） | 逻辑分析仪捕获时序后接入主板 | 3-5 天 |
| Phase 5：键盘 + 主机通信 | 按键输入、SCI 事件 | `CORE_SCAN.C` 扫描码映射表 + SCI 码表 | 逐键验证 + `acpi_listen` | 3-5 天 |
| Phase 6：完整集成 | 全部 EC 功能，系统级测试 | `OEM_BATTERY.C` 电池逻辑、`OEM_FAN.C` 风扇逻辑 | 第 6 章功能验证清单 + 24h 压力测试 | 5-10 天 |

#### Phase 1：最小启动

这是迁移的起点，目标仅为验证 Zephyr 能在 CSCE250X 上成功运行。

1. 创建板级目录 `boards/chipsea/<customer_board>/`
2. 参考 `csce250x_evb` 的 BSP 文件，创建最小 DTS（仅含时钟、UART 控制台）
3. 在 `prj.conf` 中禁用所有可选功能（`CONFIG_EC_POWER_MGMT=n` 等），仅保留串口和 Shell
4. `west build` 编译，烧录，在串口终端看到 `uart:~$` 提示符即成功

#### Phase 2：GPIO 基础控制

这是迁移过程中工作量最大的非逻辑步骤——需要将 ITE 的 ∼200 个引脚定义逐一对齐到 CSCE250X。

1. 从 `OEM_GPIO.H` 提取所有 `#define xxx_HI()` / `#define xxx_LO()` 宏，整理为 Excel 表：ITE 信号名 → ITE 端口/引脚 → 原理图网络名 → CSCE250X 端口/引脚
2. 在 DTS 中添加目标平台的所有 GPIO 端口并配置 pinctrl
3. 通过 Shell 逐引脚验证电平（`gpio set` + 万用表，`gpio get` 读输入）
4. 特别注意：ITE 的某些 GPIO 在 eSPI/LPC 模式下的复用配置（Port M）需要在 CSCE250X 上等效配置

#### Phase 3：I2C/SMBus 通信

电池和充电器通常是 EC 最先需要对接的外设。

1. 从 ITE `CORE_SMBUS.C:asSMBus[]` 确定使用的 SMBus 通道，在 CSCE250X DTS 中使能对应的 I2C 控制器
2. 从 ITE `OEM_BATTERY.C` 的 `_SMB_BATT1_POLL_TBL[]` 和 `_SMB_CHGRA_POLL_TBL[]` 提取所有寄存器地址作为验证清单
3. 使用 Shell 的 `i2c scan` 确认总线上能扫描到设备地址（0x16、0x12）
4. 使用 `i2c read` 逐寄存器读取，与 ITE 平台的读取值对比（如制造商名、设计容量、电池状态字）

#### Phase 4：电源序列上电

这是整个迁移过程中最关键也最危险的阶段——错误的时序可能导致主板损坏。

1. 从 ITE `OEM_POWER.C` 的 `ADL_N_sSEQ_S5_to_S0[]`（22 步）和 `sSEQ_S0_to_S5[]`（18 步）提取完整时序表：步骤顺序、信号名、延时、依赖条件
2. 将所有 `PF_xxx` 函数指针映射为 CSCE250X 上对应的 GPIO 操作
3. 在 CSCE250X 板级 DTS 中定义所有电源控制 GPIO 信号节点
4. 在 `pwrplane.c` 中编写对应的 `power_seq_struct` 序列表
5. 先用逻辑分析仪挂接所有电源信号，在不连接真实主板的情况下验证时序波形
6. 波形正确后再接入主板测试，建议使用限流电源以保护电路
7. 推荐技巧：在 ITE 固件中添加辅助 GPIO 翻转标记，用逻辑分析仪同时捕获两个芯片的电源序列，逐步骤对齐时序

#### Phase 5：键盘 + 主机通信

1. 从 ITE `OEM_GPIO.H` 的 KSO/KSI 控制寄存器配置中提取矩阵尺寸和引脚映射
2. 在 DTS 中配置 `kbs_matrix` 节点
3. 从 ITE `CORE_SCAN.C` 的扫描码转换逻辑提取完整键位映射表，转换为 `oem_keymap.h`
4. 逐按键验证扫描码，特别注意 Fn 组合键和 ITE 特有的 FnLock 等行为
5. 配置 eSPI 通道（Peripheral、Virtual Wire、OOB）
6. 在主机端执行 `acpi_listen`，触发各种 EC 事件确认 SCI 正确到达

#### Phase 6：完整集成与调优

所有模块接入后，执行第 6 章的功能验证清单，重点关注：

- 完整电源状态转换（S0↔S3↔S5↔G3）的稳定性
- 电池充放电全周期行为正确性（对标 ITE `OEM_BATTERY.C` 的状态逻辑）
- 风扇在不同温度下的转速曲线（对标 ITE `_FAN1_DNT_TBL`/`_FAN1_UPT_TBL`）
- 长时间运行稳定性（至少 24 小时压力测试）
- OTA 升级流程的可靠性

### 常见陷阱与注意事项

1. Bank 切换的思维惯性：ITE 固件中函数分布在 4 个 Bank 中，跨 Bank 调用需要经过公共区域跳转，这导致代码被人为拆分。迁移到 ARM 后无需 Bank 切换，应将原本分散在各 Bank 中的相关逻辑重新组织到同一模块中。

2. 内存模型的思维转变：ITE C51 下 `uint8_t` 是自然选择（XDATA 仅 4-16KB），ARM 下可放心使用 `uint32_t` 和标准数据结构。但注意结构体对齐差异——C51 结构体按 1 字节对齐，ARM 按 4 字节对齐，涉及 EEPROM 持久化数据的结构体需显式打包（`__attribute__((packed))`）。

3. 中断优先级重新分配：ITE 使用 IVECT 寄存器分发中断，所有中断优先级相同。ARM NVIC 支持最多 256 级优先级——应将 1ms 定时器和 eSPI VW 设为高优先级，GPIO 状态变化设为中优先级，SMBus/I2C 完成中断设为低优先级。

4. 服务标志位到事件对象的转换：ITE 的 `F_Service_PCI`/`F_Service_KEY` 等位标志是全局变量，无并发保护。Zephyr 中每个子系统使用独立的 `k_event` 对象，通过 `notify_subsystems()` 广播——这提供了更好的隔离性，但也意味着需要重新梳理模块间的事件依赖关系。

5. 时序假设的失效：ITE 裸机代码依赖确定性指令时序（如写 GPIO 后延时若干 `nop` 再读回），在 RTOS 多线程环境下不成立。电源序列等时序严格要求的功能应使用 `pwrseq` 框架或硬件定时器。

6. 寄存器位操作的原子性：C51 是 8 位处理器，位操作天然原子。ARM 上 Read-Modify-Write 序列可能被中断或高优先级线程打断，使用 `sys_set_bit()`/`sys_clear_bit()` 等原子操作函数。

7. `OEM_PROJECT.H` 到 Kconfig 的转换：将 ITE 的 `#define SUPPORT_XXX TRUE/FALSE` 逐项转换为 Kconfig 项时，注意依赖关系——如启用 `SUPPORT_SMART_BATTERY` 还需启用 I2C 和 SMBus 子系统。建议先启用最小集，再按依赖链逐步启用。

8. eSPI 配置的完整性：ITE 的 eSPI 在 `OEM_PROJECT.H`（`SUPPORT_INTERFACE_eSPI=TRUE`）和 `OEM_GPIO.H` 的 Port M 引脚复用处配置。CSCE250X 需在 DTS 和 Kconfig 中分别配置 eSPI 控制器和各虚拟通道，缺一不可。

9. 电池学习模式（Learn Mode）的差异：ITE 固件中电池学习模式通常通过特定的 SMBus 命令序列实现，逻辑深藏在 `OEM_BATTERY.C` 的 `Hook_Timer1SecEvent()` 等多处。迁移时需仔细追踪所有相关逻辑点，确保学习模式的状态机完整迁移。

## Zephyr 新板 Bringup 清单

本节介绍为 Zephyr EC 创建新板级的完整流程，基于 Chromium EC 上游的 Baseboard/Board 目录结构。

### 目录结构

Zephyr EC 采用 **Baseboard + Board** 两级目录结构：

| 目录 | 内容 | 说明 |
|------|------|------|
| `zephyr/boards/<vendor>/<baseboard>/` | 底板定义 | 同一系列板级共享的 DTS、Kconfig、代码片段 |
| `zephyr/boards/<vendor>/<board>/` | 单板定义 | 单个板级特有的配置和硬件描述 |

Baseboard 目录中的 `baseboard.overlay` 定义底板系列共用的硬件描述，Board 目录中的 `board.overlay` 定义单板特有的硬件配置。

### 关键文件

| 文件 | 位置 | 用途 |
|------|------|------|
| `board.h` | Board 目录 | 板级配置宏定义（如 GPIO 映射、外设使能） |
| `board.c` | Board 目录 | 板级初始化代码 |
| `ec.tasklist` | Board 目录 | 板级启用的任务列表 |
| `gpio.inc` | Board 目录 | GPIO 引脚定义（中断、GPIO、复用功能） |
| `board.overlay` | Board 目录 | 板级设备树 overlay |
| `baseboard.overlay` | Baseboard 目录 | 底板系列设备树 overlay |
| `Kconfig` | 两处 | 板级 Kconfig 配置 |

### GPIO 命名规范

通用 EC 代码中的驱动依赖板级定义精确的 GPIO 信号名称。最佳实践是：

1. 在 `gpio.inc` 中使用**原理图网络名称**定义 GPIO
2. 在 `board.h` 中创建 `#define` 宏将网络名称映射到 EC 通用名称

```c
/* gpio.inc — 使用原理图网络名称 */
GPIO_INT(EC_RST_ODL, PIN(0, 2), GPIO_INT_BOTH, signal_interrupt)

/* board.h — 映射到 EC 通用名称 */
#define GPIO_SYS_RESET_L GPIO_EC_RST_ODL
```

### ec.tasklist

`ec.tasklist` 定义板级启用的任务列表。每个任务通过 `DECLARE_TASK` 宏注册：

```c
/* ec.tasklist */
DECLARE_TASK(thermal_task)
DECLARE_TASK(battery_task)
DECLARE_TASK(keyboard_task)
```

### Bringup 步骤清单

以下是新板 bringup 的关键步骤，按优先级排列：

| 步骤 | 配置项 | 上电必需 |
|------|--------|----------|
| 1 | 配置 EC 芯片组（时钟、Flash、电源） | 是 |
| 2 | 配置 AP 与 EC 通信（eSPI/LPC） | 是 |
| 3 | 配置 AP 电源阈值和时序 | 是 |
| 4 | 配置 GPIO 引脚映射 | 是 |
| 5 | 配置 I2C 总线 | 是 |
| 6 | 配置 USB-C（TCPC、PPC） | 是 |
| 7 | 配置充电器 | 是 |
| 8 | 配置 USB-A | 否 |
| 9 | 配置休眠/唤醒 | 否 |
| 10 | 配置电池 | 否 |
| 11 | 配置 CBI（板级信息） | 否 |
| 12 | 配置键盘 | 否 |
| 13 | 配置 LED | 否 |
| 14 | 配置运动传感器 | 否 |
| 15 | 配置 BC1.2 充电检测 | 否 |
| 16 | 配置 ADC | 否 |
| 17 | 配置温度传感器 | 否 |

> **提示**：前 7 步是上电必需的最小集，完成这些配置后 EC 应能正常启动并与 AP 建立通信。其余步骤可按需逐步添加。
