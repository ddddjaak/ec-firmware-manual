# CLAUDE.md

本文件为 Claude Code (claude.ai/code) 在本仓库中工作时提供指引。

## 项目概述

双用途工作区：
- **Doxygen 文档**：`pages/` 下的 9 章 Markdown 编译为 Zephyr 风格 HTML 站点，通过 `doxygen Doxyfile` 构建
- **EC 固件**：基于 Zephyr RTOS 3.7.0 LTS 的 Chipsea CSCE250X EC 固件工程（位于 `EC-Zephyr/`）

Doxygen 输出样式参照 docs.zephyrproject.org 的 Zephyr 文档风格。

`EC-Zephyr/` 是一个**独立的 git 仓库**，拥有自己的提交历史。外层工作区（`ec-docs-workspace`）仅跟踪文档部分。

## 构建命令

```bash
doxygen Doxyfile          # 在仓库根目录运行；输出 → doxygen_output/html/index.html
```

固件构建（需要 Zephyr SDK 0.16.8 + west 环境）：

```bash
cd EC-Zephyr\ecfw-zephyr
build.bat                 # Windows 一键构建（配置环境、编译、打包 APROM + SPI flash 镜像）
west build -b csce250x_evb
west flash                # 烧录到设备
```

代码风格检查：
```bash
cd EC-Zephyr\ecfw-zephyr
scripts\checkpatch.pl     # Linux 风格检查
```

## 架构

```
pages/                          ← 9 个 Markdown 章节 + mainpage.md（源文件）
  mainpage.md                   ← \mainpage — 带卡片网格的首页
  ch1_引言.md … ch9_附录.md     ← \page 章节文件
Doxyfile                        ← Doxygen 配置（INPUT = pages, MARKDOWN_SUPPORT = YES）
doxygen_custom.css              ← Zephyr 风格覆盖 CSS
doxygen_output/html/            ← 构建产物（可安全删除后重新生成）
assets/media/                   ← 文档中嵌入的图片

EC-Zephyr/                      ← 独立 git 仓库
  ecfw-zephyr/                  ← 主应用工程
    app/                        ← 13 个功能模块（见下方）
    drivers/                    ← 18 个设备驱动模块（见下方）
    boards/                     ← 板级支持包（evb_e2509, chipsea/）
    prj.conf                    ← 主 Kconfig 配置
    debug.conf / release.conf   ← 构建变体
    west.yml                    ← West 工作区清单（Zephyr v3.2.0, CMSIS, HAL）
  ecfwwork/
    zephyr_modules_csce250x/    ← SoC BSP + HAL（厂商提供，很少修改）
    zephyr_fork/                ← Zephyr 内核源码（只读）
    modules/                    ← 第三方库（mbedtls, littlefs, cmsis）

IT557x_ADL_N_MRD-ec-v0.21-220914/  ← ITE IT557x 参考固件（Keil C51，用于 ch7 迁移指南）
```

### 应用模块（`ecfw-zephyr/app/`）

battery, charge, debug, dtt, kbchost, pd_management, peripheral_management, power_management, power_sequencing, smchost, soc_debug_awareness, system, thermal_management

### 驱动模块（`ecfw-zephyr/drivers/`）

acpi, eeprom, erpmc, espi, fan, flash, gpio, i2c, keyboard, led, mps, ota, peci, port80, ps2, spi_flash, usb, vci

## 页面文件格式

`pages/` 中每个 `.md` 文件必须以 Doxygen 指令开头：

```markdown
\page chX_slug 章节标题

# 章节标题
```

`mainpage.md` 使用 `\mainpage` 替代。`\page name` 会成为 HTML 文件名——请保持命名一致性。

## 章节间交叉链接

使用 Doxygen 生成的 HTML 文件名链接其他章节。文件名中的中文字符会被编码为十六进制 UTF-8，以下划线分隔。示例：

```markdown
[移植与定制](ch7__xE7_xA7_xBB_xE6_xA4_x8D_xE4_xB8_x8E_xE5_xAE_x9A_xE5_x88_xB6.html)
```

验证文件名请检查 `doxygen_output/html/` 中的构建产物。切勿猜测十六进制编码，应从已知正确的文件列表或现有链接中复制。

## 样式约定

- 目录/路径名：使用反引号（`` `ecfw-zephyr/` ``），不要使用粗体（`**zephyr_fork/**`）。粗体目录名在 HTML 输出中渲染效果差。
- 首页卡片：使用 `\htmlonly` 块配合 `<div class="landing-grid">`、`.persona-grid`、`.ref-grid`、`.chapter-grid`——CSS 类定义在 `doxygen_custom.css` 中。
- 侧边栏仅显示顶级章节；子节通过 `doxygen_output/css/custom.css` 中的 CSS 规则隐藏。

## 已知 Doxygen 警告（可安全忽略）

- `\ref` 无法解析中文命名的锚点——仅影响构建日志，不影响渲染页面
- `non supported language 'bit'`——源码注释中的 `~bit` 被 Doxygen 误解析
- `Unsupported xml/html tag <board_name>`——ch2 中的占位符被 Doxygen 误解释为 HTML 标签

## 文档与固件代码的关系

- 文档中的代码示例、DTS 片段、Kconfig 配置项均来源于 `EC-Zephyr/` 实际工程
- ch3（开发包架构）描述的结构对应 `ecfw-zephyr/` 和 `ecfwwork/` 目录
- ch4（固件功能模块）描述的 13 个应用模块对应 `ecfw-zephyr/app/` 源代码
- ch7（移植与定制）的 BSP/SoC 移植示例基于 `zephyr_modules_csce250x/soc/arm/chipsea/` 真实实现
- 固件代码变更需同步更新文档中的对应章节

## ITE EC 参考代码库（IT557x）

`IT557x_ADL_N_MRD-ec-v0.21-220914/` 是一个真实的传统 EC 固件，针对 ITE IT557x（C51 内核，Alder Lake 平台）。它作为 ch7 迁移指南的参考。

### 构建系统

- Keil C51（8051 编译器）+ A51 汇编器 + BL51 链接器 + NMAKE
- 构建目标：`B.BAT` → `Build.bat` → `ITEEC.mak`
- ROM 大小：128KB，使用 bank 切换（BANK0 公共区 + BANKS 1-3，共 4 个 bank）

### 代码组织（四层架构）

```
Code/CHIP/     → 硬件寄存器定义（CHIPREGS.H, CHIPSFR.H）
Code/CORE/     → 平台无关的 EC 框架（主循环、IRQ 调度、SMBus、KBC、定时器）
Code/API/      → 外设抽象层（GPIO, ADC, PWM, PECI, I2C）
Code/OEM/      → 项目相关（电源时序、电池、风扇、GPIO 配置、键盘映射）
```

### 关键架构模式

1. **服务标志调度**：ITE 固件使用协作式多任务。ISR 设置位标志（如 `F_Service_PCI`、`F_Service_KEY`、`F_Service_MS_1`），主 `while(1)` 循环在 `CORE_MAIN.C:main_service()` 中按优先级检查标志。这是类似状态机的轮询调度，不是抢占式线程。

2. **表驱动电源时序**：电源时序是 `sPowerSEQ {func_ptr, delay_ms, wait_condition}` 结构体数组。每步调用一个 `PF_xxx` 函数。定义在 `OEM_POWER.C` 中：`ADL_N_sSEQ_S5_to_S0[]`（22 步）、`sSEQ_S0_to_S5[]`（18 步）、`sSEQ_S0_to_S3[]`、`sSEQ_S3_to_S0[]`、`sSEQ_S5_to_G3[]`、`sSEQ_G3_to_S5[]`。

3. **双 GPIO 访问模式**：
   - 直接宏：`SET_MASK(GPDRA, BIT(0))`、`CLEAR_MASK(GPDRA, BIT(0))` + 命名辅助函数如 `PCH_RSMRST_HI()`、`ALL_SYS_PWRGD_HI()`——在 `OEM_GPIO.H` 中按引脚定义
   - 结构化 API：`asGPIOConfReg[]` 表将 88 个引脚映射到寄存器集；`GPIO_Output_Ctrl(pin_index, level)` / `GPIO_Input_Status_Get(pin_index)`

4. **SMBus 抽象**：`asSMBus[]` 结构体数组将 6 个 SMBus 通道（A-F）映射到各通道寄存器集（HOCTL、TRASLA、HOCMD、HOSTA、D0REG、D1REG、HOBDB、IER、ISR、PECERC）。OEM 代码调用 `bRWSMBus(Channel, Protocol, Addr, Comd, Var, PECSupport)`。

5. **功能配置**：集中在 `OEM_PROJECT.H` 中，通过 `#define SUPPORT_XXX TRUE/FALSE` 开关控制。没有 Kconfig——全部是编译时 #ifdef。

6. **定时器级联**：`CORE_MAIN.C:service_1mS()` 生成级联：1ms → 5ms → 10ms → 50ms → 100ms → 500ms → 1sec → 1min。每个节拍调用 `Hook_TimerXxxEvent()` 供 OEM 代码挂接。

7. **中断调度**：基于 IVECT 寄存器——`Isr_Int1()` 读取 IVECT 确定中断源，然后从 `IRQ_Service[]` 表（176 个条目）调用函数指针。每个 ISR 设置一个服务标志位。

8. **迁移相关关键文件**：
   - `Code/CORE/CORE_COMMON/CORE_MAIN.C` — 主循环和调度
   - `Code/OEM/OEM/OEM_BANK0/OEM_POWER.C` — 电源时序（3320 行）
   - `Code/OEM/OEM/OEM_BANK0/OEM_BATTERY.C` — 电池 + 充电器（1453 行）
   - `Code/OEM/OEM/OEM_BANK0/OEM_FAN.C` — 风扇控制（477 行）
   - `Code/OEM/OEM/INCLUDE/OEM_GPIO.H` — 所有 GPIO 引脚定义（约 700 行）
   - `Code/OEM/OEM/INCLUDE/OEM_PROJECT.H` — 功能配置（约 170 行）
   - `Code/CORE/CORE_COMMON/CORE_IRQ.C` — ISR 定义（2028 行）
   - `Code/CORE/CORE_BANK0/CORE_SCAN.C` — 键盘矩阵扫描（2163 行）
