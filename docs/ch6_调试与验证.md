# 调试与验证


EC（Embedded
Controller）固件通常运行在一个无显示、无操作系统支持的实时环境中。在这种系统中，日志输出
与 命令行调试接口（Shell） 是开发与验证阶段最重要的调试手段。Zephyr RTOS
提供了灵活的 Logging 框架 与 Shell
模块，两者可独立使用，也可联动输出日志，实现强大的在线诊断能力。

## 日志与调试接口 (Zephyr logging, Shell)

EC
固件运行在实时环境中，通常缺少显示接口，因此日志输出和命令行接口是开发调试的主要手段。Zephyr
RTOS 提供了轻量、灵活的调试框架，可直接集成到 EC 系统中。

### Zephyr Logging 框架

Zephyr 的 Logging 框架提供了一个轻量但功能完善的
分级日志系统，可在不同模块间统一输出格式化的调试信息。

其核心目标是：

- 帮助开发者快速定位系统运行状态；

- 支持多通道输出（UART、RTT、Memory、File 等）；

- 可动态调整日志级别与输出策略；

- 具备线程安全与低延迟特性，适合 EC 场景下的实时调试。

#### 配置方式

Logging 模块通过 Kconfig 配置启用，主要配置项位于 prj.conf 或
overlay.conf 中。

基本启用：

```
\# 启用日志系统

CONFIG_LOG=y

\# 启用运行时日志级别控制

CONFIG_LOG_RUNTIME_FILTERING=y

\# 启用时间戳与上下文

CONFIG_LOG_TIMESTAMP_SOURCE_RTOS=y

CONFIG_LOG_PROCESS_THREAD=y

\# 设置默认日志级别（0=NONE, 1=ERR, 2=WRN, 3=INF, 4=DBG）

CONFIG_LOG_DEFAULT_LEVEL=3
```

后端输出配置（选一或多选）（默认输出到RTT，因为串口引脚可能用作其他用途）：

```
\# 输出到串口控制台（常用）

CONFIG_LOG_BACKEND_UART=y

\# 输出到 Segger RTT

CONFIG_LOG_BACKEND_RTT=y

\# 输出到内存缓冲区（可用于异常时抓取日志）

CONFIG_LOG_BACKEND_RAM=y
```

模块日志级别单独控制：

```
\# POST CODE

CONFIG_POSTCODE_MANAGEMENT=y

#CONFIG_POSTCODE_LOG_LEVEL=2

\# POWER SEQUENCE AND POWER MANAGEMENT

\# CONFIG_PWRMGMT_DEEPSX_LOG_LEVEL=4

\# Battery

CONFIG_BATTERY_LOG_LEVEL=4

\# Charge

CONFIG_CHARGE_LOG_LEVEL=4
```

#### 代码中使用 Logging 宏

在 Zephyr 中，每个 C
文件（或模块）可以注册一个独立的日志模块，通过以下宏定义：

```c
#include \<zephyr/logging/log.h>

LOG_MODULE_REGISTER(pwrmgmt, CONFIG_PWRMGT_LOG_LEVEL);
```

然后使用标准日志输出接口：

```
LOG_ERR(\"Critical error: power rail failure\");

LOG_WRN(\"Low battery warning\");

LOG_INF(\"System entered S0 state\");

LOG_DBG(\"Fan duty = %d%%\", duty);
```

#### 日志运行机制

Logging 模块采用 异步输出：

- 日志先写入内存缓冲区；

- 后台线程（log processing thread）周期性处理输出；

- 可避免实时任务因串口 I/O 阻塞。

也支持同步模式（直接输出），但会牺牲实时性：

```
  CONFIG_LOG_MODE_IMMEDIATE=y

```

#### 日志查看方式

  --------------------------- -------------------------------------------
           输出后端                            查看方式

             UART                     打开串口终端（115200 8N1）

              RTT                       使用 SEGGER RTT Viewer

          RAM buffer                 通过 Shell 命令或调试接口导出

             Shell                     输入 log 命令查看实时日志
  --------------------------- -------------------------------------------

#### 调试建议

- 对实时性要求高的任务中只使用 LOG_DBG() 或宏控编译；

- 对关键路径（如 ISR）禁止打印，使用事件通知机制替代；

- 日志输出串口应与 EC 主机通信通道分离；

- 可通过 Shell 动态修改日志级别：

```
log enable \<module_name>

log disable \<module_name>

log level set \<module_name> \<level>
```

### Shell 命令行接口

Zephyr Shell 模块 提供了一个统一的命令行接口，可通过 UART、USB CDC 或
RTT 控制台
访问。它允许开发者在不修改固件的情况下直接执行命令、查看状态、验证功能，是
EC 调试的核心工具之一。

#### 配置方法

在 prj.conf 中启用 Shell 支持：

```
\# 启用 Shell 框架

CONFIG_SHELL=y

\# 选择控制台接口（UART / RTT）

CONFIG_SHELL_BACKEND_SERIAL=y

\# 或 CONFIG_SHELL_BACKEND_RTT=y

\# 设置行缓冲区长度与历史命令缓存

CONFIG_SHELL_CMD_BUFF_SIZE=128

CONFIG_SHELL_HISTORY=y

CONFIG_SHELL_HISTORY_BUFFER=512

\# 可选：启用日志与 shell 联动

CONFIG_LOG_BACKEND_SHELL=y
```

启用后，系统会在控制台自动进入 Shell 环境，例如：

```
  uart:\~\$

```

#### 自定义命令注册

应用层可通过 SHELL_CMD_REGISTER() 宏定义自定义命令（举例）：

```c
#include \<zephyr/shell/shell.h>

static int cmd_show_battery(const struct shell \*sh, size_t argc,
char \*\*argv)

{

shell_print(sh, \"Battery: %d%%, Voltage: %dmV\",
get_battery_level(), get_bat_voltage());

return 0;

}

SHELL_CMD_REGISTER(battery, NULL, \"Show battery status\",
cmd_show_battery);
```

运行效果：

```
uart:\~\$ battery

Battery: 89%, Voltage: 11400mV
```

#### 与 Logging 框架联动

启用 CONFIG_LOG_BACKEND_SHELL=y 后，日志可直接显示在 Shell 控制台：

```
uart:\~\$ log enable all

uart:\~\$ log

\[00:00:12.345,678\] \<inf> pwrmgmt: System enter S0

\[00:00:15.111,222\] \<wrn> fan: Fan overspeed detected
```

#### 调试建议

- 对高频调试命令可设置短命令别名；

- 在安全场景中限制 Shell 接口访问（关闭 USB shell）；

- 对关键命令添加确认机制（如强制断电、重启类操作）；

- 配合 CONFIG_SHELL_CMDS_SELECT 选项，仅编译必要命令，减小固件体积。

## 单元测试与仿真环境（Unit Test）

### 测试的重要性与目标

对于 EC 固件而言，测试不是可有可无的"加分项"，而是保障系统可靠性的基石。EC 负责电源管理、热控制、键盘扫描等安全关键功能，一个逻辑错误可能导致过热、意外断电甚至硬件损坏。具体来说，测试的核心目标包括：

1. 安全性与可靠性的最后防线：在电源和热管理路径上，任何边界条件错误都可能在量产设备上被放大，自动化测试能在合入代码前捕获这些缺陷。

2. 回归预防：EC 固件迭代频繁，一个看似无关的修改可能破坏已有功能。持续运行的测试套件可以即时发现回归，避免退行性缺陷流入固件发布。

3. OTA 更新的信心保障：EC 固件通过 OTA 推送时，一旦出现问题，修复成本极高（可能需要物理返修）。充分的单元测试和集成测试是决定能否安全推送的决策依据。

Zephyr 推崇"在仿真环境中做单元测试，在真实硬件上做集成测试"的分层测试策略：逻辑密集型代码（算法、状态机、协议解析）在 `native_sim` 上以 Linux 进程形式运行并验证；需要真实时序和硬件特性的代码则通过 HIL 测试在目标板卡上验收。这种策略兼顾了开发迭代速度与测试置信度。

### Zephyr 的 ztest 测试框架

Zephyr 内置了 `ztest` 单元测试框架，专为嵌入式场景设计，支持在仿真环境或真实硬件上运行测试用例。其 API 简洁直观，与 Zephyr 内核深度集成。

核心 API： `ZTEST(suite_name, test_name)` 宏用于定义测试用例，`zassert_*()` 系列宏用于断言验证。常用断言包括 `zassert_equal()`、`zassert_true()`、`zassert_within()` 等。以下是测试电池充电百分比计算的完整示例：

```c
#include &lt;zephyr/ztest.h&gt;

ZTEST(battery_test, test_charge_percent)
{
    uint8_t result = battery_calc_percent(3800, 4200, 3000);
    zassert_equal(result, 50, "expected 50%% got %d", result);
}

ZTEST_SUITE(battery_test, NULL, NULL, NULL, NULL, NULL);
```

构建与运行： 在 `tests/` 目录下创建测试子目录并添加 `CMakeLists.txt`，通过以下命令编译并运行：

```bash
west build -b native_sim tests/battery
west build -t run
```

测试套件管理： `ztest_test_suite()` 或 `ZTEST_SUITE()` 将多个测试用例组织为套件，并支持设置 `setup` / `teardown` 回调函数，用于初始化和清理测试环境。`before` / `after` 参数可在每个测试用例前后执行公共逻辑，避免重复代码。

### 仿真与虚拟运行环境

Zephyr 支持多种仿真运行模式，开发者可根据测试目标灵活选择：

- `native_sim`（推荐首选）：将 Zephyr 固件编译为 Linux 原生可执行文件，在宿主机上直接运行。无需任何硬件或模拟器，编译和启动速度极快（秒级），非常适合在 CI 流水线中批量运行。缺点是无法模拟 ARM 特定指令（如 CMSIS 操作）和真实外设时序。对于 EC 固件中纯算法逻辑的测试（电池电量估算、热策略决策、键盘矩阵解码），`native_sim` 是最高效的选择。

- QEMU： 模拟完整的 ARM Cortex-M 处理器，可执行真实的 ARM 二进制指令。比 `native_sim` 更接近真实硬件，能捕获 ARM 架构相关的问题（如 MPU 配置、中断优先级分组），但运行速度较慢。适合测试底层驱动逻辑和中断处理流程。

构建与运行命令：

```bash
# native_sim — 最快，适合算法与逻辑测试
west build -b native_sim -t run

# QEMU (ARM Cortex-M) — 更接近真实硬件
west build -b mps2_an385 -t run
```

对于 EC 固件开发，推荐策略是：日常开发和 CI 使用 `native_sim` 覆盖算法层测试，在发版前用 QEMU 或真实硬件做一轮补充验证。

### 模拟外设与输入事件

在仿真环境中，没有真实的外设硬件，需要通过 Mock / Stub 技术模拟外设行为，让上层逻辑在"以为硬件正常"的前提下运行。

Mock 外设驱动： 在 `native_sim` 环境中，可以编写桩（stub）驱动程序，替代真实的 I2C / GPIO / ADC 驱动。桩驱动不操作硬件寄存器，而是直接返回预设值。以下示例展示如何模拟一个始终返回 45 °C 的温度传感器：

```c
// 模拟温度传感器：始终返回 45.0°C
int mock_temp_read(const struct device *dev, uint16_t *val)
{
    *val = 450;  // 45.0°C，单位为 0.1°C
    return 0;
}
```

模拟输入事件： 测试中可注入虚拟的外部事件——键盘扫描码、GPIO 电平变化、定时器触发等。例如，测试键盘矩阵解码逻辑时，可以在测试用例中直接调用 `keyboard_scan_inject(row, col, pressed)` 来模拟按键动作，无需真实的键盘硬件。

测试装置 (Fixture)： 使用 `ztest_rule_fixture` 宏可以在每个测试用例前后自动设置和清理 Mock 环境，确保测试之间互不污染：

```c
static void mock_setup(void *fixture) {
    /* 注册桩驱动、初始化 Mock 数据 */
}
static void mock_teardown(void *fixture) {
    /* 清理状态、恢复默认值 */
}
```

将 Mock 代码统一放置在 `tests/mocks/` 目录下，多个测试模块可以复用同一套桩驱动，减少重复工作。

### 硬件在环测试（HIL）与混合仿真

硬件在环（Hardware-in-the-Loop, HIL）测试是将真实 EC 板卡接入自动化测试平台，由上位机通过 I2C / SPI / UART 等接口驱动测试流程。它是发现时序问题、外设兼容性缺陷和功耗异常的"终极手段"。

典型 HIL 测试流程：

1. 连接测试硬件： 将 EC 开发板通过调试器和串口连接到测试主机，外设总线（I2C、SPI）连接至逻辑分析仪或总线模拟器。

2. 自动化脚本驱动： 使用 Python 脚本通过 `pyserial` 发送 Shell 命令或自定义测试协议，并校验返回结果。示例：
   ```python
   import serial
   ser = serial.Serial('/dev/ttyACM0', 115200)
   ser.write(b'charger set_current 2000\n')
   resp = ser.readline().decode()
   assert 'current: 2000mA' in resp
   ```

3. 固件自动烧录： 结合 `west flash` 实现一键烧录与测试：
   ```bash
   west flash && python tests/hil/battery_test.py
   ```

Twister 硬件映射： Zephyr 的测试工具 Twister 支持硬件映射文件 (`hardware-map.yaml`)，可将测试用例自动分发到指定的真实板卡上执行：

```bash
west twister --device-testing --hardware-map map.yaml -T tests/
```

HIL 测试是发版前的必检环节——纯仿真无法暴露的时序竞态、DMA 冲突、电源域切换等问题，只有真实硬件才能捕获。建议每次固件发版标签前，至少完成一轮全量 HIL 测试。

### 与持续集成（CI）结合

将测试嵌入 CI 流水线是实现质量持续可控的关键。典型的 EC 固件 CI 流程如下：

流程设计： 每次 Pull Request 提交后自动触发流水线——先运行 `native_sim` 单元测试（最快，分钟级）、再通过 Twister 运行集成测试、最后对目标板卡执行编译检查（确保代码能通过实际工具链编译）。

GitHub Actions 示例：

```yaml
name: EC Firmware CI
on: [pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    container: zephyrprojectrtos/ci:latest
    steps:
      - uses: actions/checkout@v4
      - name: Run unit tests
        run: |
          west twister -T tests/ --platform native_sim
      - name: Build for target
        run: |
          west build -b csce250x_evb
```

测试报告与可追溯性： Twister 支持输出 JUnit XML 格式的测试报告，可直接导入 CI 看板或测试管理平台，实现每次构建的测试结果对比和趋势分析。

回归测试策略： 核心原则是"每一个 Bug 修复必须附带一个对应的测试用例"。这确保同一个问题不会出现两次，随着时间推移，测试套件自然覆盖所有已知风险点。即使某些目标板卡在 CI 中不可用，也至少应执行编译检查（`west build -b [target]`），保证代码的构建完整性。

### 最佳实践与建议

结合 EC 固件的特殊性（安全关键、实时性要求、外设密集），推荐以下测试实践：

1. 测试与编码同步进行： 不要等到功能完成后补写测试。边写代码边写测试（TDD 或同步测试），能更早发现接口设计问题，测试本身也是对 API 设计合理性的验证。

2. 每个 Bug 修复 = 一个新测试用例： 修复 Bug 后必须添加对应的回归测试，这是构建长期可靠性的最低成本策略。

3. 每次提交都跑 `native_sim` 测试： 使用 `west build -b native_sim -t run` 在数秒内完成全量单元测试验证，作为 pre-commit hook 或 CI 第一道防线。

4. 发版标签前运行完整 HIL 测试： 真实硬件上的 HIL 测试是发版的准入门槛，尤其要覆盖各电源状态间的转换（S0→S3→S5→S0），这些场景在仿真中极难验证。

5. 关注覆盖率趋势： 启用 `CONFIG_COVERAGE=y`，使用 `west build -t coverage` 生成覆盖率报告，追踪覆盖率变化。覆盖率下降应视为 PR 审查的"红灯信号"。

6. 保持测试用例独立性： 不要依赖共享全局状态或测试执行顺序。每个测试用例应该能单独运行并通过，使用 fixture 的 setup/teardown 管理状态。

7. EC 特定：始终测试电源状态转换： 电源状态切换是 EC 最复杂且最危险的场景，必须在 HIL 测试中覆盖所有合法的状态转换路径。

8. 善用 Twister 批量执行与报告： `west twister` 支持并行执行、平台筛选、JUnit XML 报告输出，是管理大规模测试套件的核心工具：

   ```bash
   west twister -T tests/ --platform native_sim --platform qemu_cortex_m3 \
     --inline-logs --xml-report report.xml
   ```

## 异常监控与奔溃分析（Fatal Error / Assert / Dump）

在嵌入式控制器（EC）固件中，系统可靠性至关重要。由于固件通常运行在无操作系统保护、无显示界面的实时环境中，一旦出现异常（如栈溢出、非法访问、断言失败等），若无法有效捕获与分析，将严重影响系统稳定性与可维护性。

Zephyr
提供了完善的异常处理机制与崩溃分析框架，可在系统出错时输出上下文信息，帮助开发者快速定位问题。

### 异常类型与触发机制

Zephyr 中的异常主要分为三类：

  -------------- ------------------------------------------------ ------------------------------------------------------
       类型                            说明                                              常见原因

   Fatal Error                      由 Zephyr                      空指针访问、栈溢出、非法中断上下文调用、任务异常退出
                  内核捕获的严重错误，通常导致系统进入崩溃状态。  

  Assert Failure     调用 \_\_ASSERT() 或 \_\_ASSERT_NO_MSG()                参数非法、逻辑不一致、状态机异常
                               宏时触发的断言错误。               

   CPU Fault /     由 CPU 硬件异常引发，如总线错误或非法指令。        访问无效地址、除 0 操作、栈破坏、ISR 嵌套溢出
    HardFault                                                     
  -------------- ------------------------------------------------ ------------------------------------------------------

### Fatal Error 处理流程

Zephyr 在检测到致命错误时，会调用内核错误处理函数：

```c
  void k_sys_fatal_error_handler(unsigned int reason, const struct
  arch_esf \*esf);

```

其中：

- reason：错误类型，如 K_ERR_CPU_EXCEPTION、K_ERR_STACK_CHK_FAIL；

- esf：异常堆栈帧结构（Exception Stack Frame），包含寄存器内容。

默认行为：

- 关闭调度；

- 打印错误信息；

- 若配置允许，可进入死循环或自动重启系统。

  可通过 CONFIG_KERNEL_FATAL_HOOK
  注册用户自定义的异常钩子，用于自定义处理逻辑：

```c
void k_sys_fatal_error_handler(unsigned int reason, const struct
arch_esf \*esf)

{

LOG_ERR(\"Fatal error: reason=%d\", reason);

dump_esf_registers(esf);

system_reset(); // 可选择重启或进入安全模式

}
```

### 断言机制（Assert Framework）

断言是开发阶段最重要的防护手段之一，用于在运行时验证条件是否成立：

```
  \_\_ASSERT(cond, \"Condition failed: %d\", cond);

```

如果 cond 为假，则系统会输出错误信息并触发 k_sys_fatal_error_handler()。

可通过配置项启用或禁用断言：

  --------------------------- -------------------------------------------
            配置项                               说明

        CONFIG_ASSERT=y              启用断言机制（推荐开发阶段）

    CONFIG_ASSERT_VERBOSE=y    输出更详细的断言信息（包含函数名与行号）

   CONFIG_NO_OPTIMIZATIONS=y        保留调试符号，便于定位断言位置
  --------------------------- -------------------------------------------

示例：

```
  \_\_ASSERT(sensor_value >= 0 && sensor_value \<= 100, \"Sensor out of
  range!\");

```

### 崩溃转储（Crash Dump / Stack Dump）

当系统崩溃时，Zephyr 可以自动打印寄存器与栈内容，辅助分析：

输出示例：

```
\*\*\*\*\* HARD FAULT \*\*\*\*\*

Faulting instruction address = 0x00001234

r0: 0x2000abcd r1: 0x00000002 r2: 0x00000000 r3: 0x00000000

r12: 0x00000000 lr: 0x00001a5d pc: 0x00001234 psr: 0x61000000

Fatal fault in thread main! Aborting.
```

配制方法：

```
CONFIG_PRINTK=y #允许内核在崩溃时输出打印信息

CONFIG_LOG=y #启用日志系统，以便输出调试信息

CONFIG_FATAL_ERROR_LOG_LEVEL=3 #控制错误输出等级

CONFIG_THREAD_STACK_INFO=y #启用栈信息打印

CONFIG_EXCEPTION_STACK_TRACE=y #打印完整的堆栈回溯
```

若希望在异常时保存转储信息以供后续分析，可启用：

```
CONFIG_DEBUG_COREDUMP=y #生成内存转储（Core Dump）

CONFIG_DEBUG_COREDUMP_BACKEND_LOGGING=y #通过日志输出转储信息

CONFIG_DEBUG_COREDUMP_MEMORY_DUMP_MIN=y #仅转储必要信息，节省空间
```

这些选项常用于 EC 系统中，当崩溃发生时，可通过串口或 RTT 收集 dump
数据，后续导入符号文件进行解析。

### 实践案例

例如，风扇控制线程中如果访问空指针：

```c
void fan_task(void)

{

struct fan_dev \*dev = NULL;

\_\_ASSERT(dev != NULL, \"Fan device not initialized!\");

fan_update_speed(dev); // 将触发断言

}
```

输出：

```
ASSERTION FAIL \[dev != NULL\] @ fan.c:42

Fan device not initialized!

Fatal error in thread fan_task (reason 4)
```

开发者可根据打印内容定位函数、行号与触发线程。

## 功能验证方法 (电源、按键、风扇等)

功能验证阶段是 EC
固件开发中最关键的环节。其目标不仅是验证各模块功能正确性，还需确保在各种电源状态、交互场景与异常条件下，系统能稳定、可恢复地运行。

EC 的特性决定了验证应涵盖 主机交互、外设控制、电源联动、异常容错
等全生命周期。

### 功能验证总体策略

EC 功能验证采用分层策略，从底层单元到顶层系统逐级验证，确保各模块在集成前达到质量要求。

三层验证体系：

1. 单元级验证（Unit Level）：基于 Zephyr ztest 框架，对每个驱动模块（如 PWM、ADC、GPIO、I2C 等）编写独立测试用例，在仿真环境或开发板上验证 API 行为正确性。

2. 集成级验证（Integration Level）：在 HIL（Hardware-In-the-Loop）或仿真平台上，验证多个模块的交互行为，如电源状态切换时风扇、键盘、LED 的联动响应。

3. 系统级验证（System Level）：在真实硬件上运行完整固件，由测试人员手动操作，覆盖完整的用户场景（开机、休眠、唤醒、电池充放电、热保护等）。

标准验证流程：`west build` 编译固件 → `west flash` 烧录到目标板 → 通过 Shell 命令逐项验证功能 → 填写验证报告记录结果与偏差。

### 电源管理功能验证

电源管理是 EC 最核心的功能之一，需验证 S0/S3/S4/S5 各状态的进入、退出及状态转换的正确性，以及电源上电时序、唤醒源配置。

验证步骤：

1. 编译与烧录：`west build -b csce250x_evb` 编译固件，`west flash` 烧录后重启系统，确认进入 S0 状态。

2. 状态切换验证：通过 Shell 命令 `power info` 查看当前电源状态；通过主机侧发起 S3/S5 请求或 Shell 命令 `power suspend` 触发状态切换，用 `dmesg | grep -i "power state"` 查看 PM 日志确认状态迁移（S0 → S3 → S0 → S5 → S0）。

3. 电源时序验证：使用逻辑分析仪捕获各电源轨（VCC_CORE、VCC_IO 等）的上电/下电时序，与时序图对比，确认 `t_on`、`t_off`、`t_rise` 等参数符合硬件规格。

4. 唤醒源验证：分别测试各唤醒源（LID open、Power Button、AC attach、RTC alarm、键盘按键），执行 `power wake_source` 命令查看唤醒原因寄存器，确认唤醒后系统恢复到 S0。

5. 功耗测量：在各状态下用精密电流表测量功耗，记录 S0 运行功耗、S3 挂起功耗、S5 关机功耗，与基线数据对比。

### 按键与输入系统验证

EC 负责键盘矩阵扫描、电源按键检测、LID 开关检测等输入功能，验证需覆盖按键响应时间、组合键、长按/短按等场景。

验证步骤：

1. 键盘矩阵扫描：使用 Shell 命令 `kscan` 或 `kscan_stat` 查看按键扫描状态，依次按下每个按键，确认键码（scancode）正确映射，无漏键、串键现象。

2. 电源按键时序：使用示波器测量电源按键引脚，确认短按（< 4s）触发开机/关机事件，长按（> 4s）触发强制关机，通过 `gpioget [pin]` 读取按键引脚电平验证。

3. LID 开关检测：闭合/打开笔记本上盖，通过 Shell 命令 `lid` 或 `gpioget LID_PIN` 确认 LID 状态变化，验证合盖睡眠（S3）和开盖唤醒的功能联动。

4. 按键矩阵压力测试：连续快速按键 200 次以上，通过 `kscan` 命令查看按键缓冲区，确认无丢键、无重复键事件，中断响应时间 &lt; 5ms。

5. 去抖配置验证：修改按键去抖时间参数（debounce-down-ms / debounce-up-ms），用示波器模拟按键抖动波形，确认去抖机制生效。

### 风扇与热管理验证

风扇与热管理验证需确认 PWM 调速线性度、转速反馈精度、温度阈值触发策略和风扇异常保护等。

验证步骤：

1. PWM 调速验证：使用 Shell 命令 `pwm` 手动设置占空比（0%、25%、50%、75%、100%），用示波器测量风扇 PWM 引脚，确认波形周期和占空比与设定值一致。

2. 风扇转速读取：执行 `fan` 或 `fan_speed` Shell 命令读取当前转速（RPM），与外部转速计读数对比，误差应 &lt; 5%。还可执行 `fan duty set 50` 手动调速后验证转速表反馈。

3. 热策略测试：使用热风枪或加热台逐步升温，监测温度传感器读数（`sensor read temp`），确认风扇启停阈值（T_on / T_off）、转速档位切换符合热策略表定义。

4. 温度传感器校准：在各温度点（25°C、40°C、60°C、80°C）用 `sensor read temp` 读取温度值，与校准过的热电偶对比，误差 < ±2°C。

5. 风扇异常保护：人为断开风扇反馈信号线，确认系统能检测到风扇堵转/断线异常（`fan fault`），并触发保护策略（如全速运行备选风扇、降频或告警）。

### 主机接口与通信验证

EC 通过 LPC/eSPI 总线与主机（x86/ARM SoC）通信，验证需覆盖主机命令响应、ACPI 通知、内存共享访问等。

验证步骤：

1. LPC/eSPI 通信链路：使用逻辑分析仪挂接 LPC/eSPI 总线（LAD/IO、LFRAME/CS、LCLK），捕获主机命令帧，验证协议时序（周期类型、地址对齐、数据方向）符合规范。

2. 主机命令测试：通过 Shell 命令 `hostcmd` 或 `host_command` 手动发送/回显主机命令（如 EC_CMD_GET_PROTOCOL_INFO），确认 EC 正确响应，响应时间 &lt; 10ms。

3. ACPI 通知验证：在主机端（Linux）执行 `acpi_listen` 监听 ACPI 事件，同时在 EC 端触发各 SCI 事件（AC 插拔、电池阈值、热事件），确认主机收到对应的 ACPI 通知。

4. 共享内存访问：通过 `hostcmd memmap` 查看 EC 共享内存区域内容，验证主机端 `/sys/kernel/debug/ec/` 读取的数据与 EC 端一致。

5. 压力测试：连续发送 1000 条主机命令，确认无超时、无丢包，主机命令队列不溢出。

### 异常与容错场景验证

EC 必须能在异常条件下安全恢复，验证需模拟各类故障场景并确认系统行为符合预期。

验证步骤：

1. 看门狗超时测试：使用 Shell 命令 `wdt` 或 `wdt info` 查看看门狗配置，在测试线程中进入死循环不喂狗，确认系统在预设超时后自动复位，复位后能正常启动。

2. 电源跌落验证：使用可编程电源逐步降低供电电压，确认 Brown-out Reset (BOR) 在阈值电压下触发，系统复位后 RTC 时间不丢失、NV 存储数据完整。

3. HardFault 注入测试：在 Shell 中注册测试命令 `crash_test null_ptr` 故意访问空指针，确认系统进入 `k_sys_fatal_error_handler()`，打印寄存器 dump 与调用栈后执行复位，不复位循环挂死。

4. 栈溢出检测：启用 `CONFIG_STACK_SENTINEL=y`，在测试函数中递归调用耗尽栈空间，确认系统检测到栈哨兵破坏并触发错误处理，打印栈使用信息。

5. I2C/SPI 设备异常：人为断开外设 I2C/SPI 线路，确认驱动程序能检测到通信超时/NACK，不会导致系统死锁或崩溃，错误计数正确上报。

### 自动化与回归测试

自动化测试是保证固件质量长期稳定的关键，通过 CI（持续集成）流水线自动运行测试用例，在每次代码提交后快速发现回归问题。

验证步骤：

1. Twister 测试框架：Zephyr 内置 Twister 测试工具，支持自动发现、编译并运行测试用例。使用 `west twister -T tests/drivers/pwm/` 运行指定测试目录的用例，`west twister --coverage` 启用覆盖率统计。

2. 编写 ztest 测试用例：为每个驱动模块编写 ztest 测试用例（见单元测试章节），通过 `west twister -s tests/drivers/adc/adc_api` 运行单个测试套件，验证 API 行为。

3. CI 集成：在 GitHub Actions 或 Jenkins 中配置 CI 流水线，每次 push 触发自动编译与测试，`build.yml` 中定义 `west build` 与 `west twister` 步骤，测试结果通过邮件/Slack 通知。

4. 回归测试策略：维护一份 `regression_test_list.txt` 列出关键测试用例，每次发布前运行 `west twister --testcase-report=report.xml` 生成 XML 报告，对比基线确保无退化。

5. 硬件在环自动化：通过 Python 脚本（pyOCD / OpenOCD）控制编程器自动烧录固件，结合 Shell 命令脚本自动执行验证步骤，实现无人值守的硬件测试。

### 验证报告与指标追踪

验证完成后需输出标准化报告，为项目决策和发布评审提供量化依据。

报告关键指标：

1. 测试覆盖率：`west twister --coverage` 生成 lcov 覆盖率报告，目标为函数覆盖率 > 80%、分支覆盖率 > 60%（EC 固件标准）。

2. 通过/失败统计：列出各模块的测试用例总数、通过数、失败数，计算通过率，失败的用例标记为已知问题（附 Jira/GitHub Issue 编号）。

3. 性能指标：
   - 启动时间：从复位释放到 `main()` 入口的时间（< 50ms），到 Shell ready 的时间（< 200ms）。
   - ISR 延迟：用 GPIO toggle + 示波器测量从硬件中断触发到 ISR 入口的延迟（< 5us）。
   - 主机命令响应时间：从接收命令到返回响应的时间（< 10ms）。

4. 内存资源指标：使用 `west build -t ram_report` 和 `west build -t rom_report` 生成 RAM/ROM 使用报告，确认 Free RAM > 20% 余量，Flash 使用率 &lt; 85%。

5. 功耗指标：记录 S0、S3、S5 各状态功耗（mW），与上一版本基线对比，功耗增幅 > 10% 时标记为异常。

6. 验证结论：基于以上指标给出通过/有条件通过/不通过结论，附带问题清单和修正责任人。

## 常见问题排查 (FAQ)

本章整理了在 OpenEC + Zephyr
开发过程中常见的系统级、驱动级与调试级问题。通过定位思路、命令工具与参考日志分析，帮助开发者快速识别故障根因并制定修复方案。

### 工程编译与配置问题

问题 1：CONFIG_XXX 配置项无效，修改 .conf 不生效

诊断方法：
- 执行 `west build -t menuconfig` 进入 Kconfig 图形界面，搜索目标配置项查看其依赖链（Depends on / Selects），确认所有前置依赖已满足。
- 对比 `prj.conf`（手动配置）与 `build/zephyr/.config`（最终生效配置），确认配置项未被板级 `defconfig` 或 overlay 覆盖。
- 使用 `west build -t guiconfig` 可视化查看配置项的当前值、提示信息和依赖关系。

解决方案：
- 在 `prj.conf` 中补全缺失的前置依赖 Kconfig 项。
- 若配置项被板级默认配置覆盖，在 `prj.conf` 中重新赋值或在 overlay 中覆盖。
- 检查 `Kconfig` 文件的 `depends on` 链，逐级向上确认每一级依赖均已启用。
- 对于模块化配置，确认对应模块的 `CONFIG_[MODULE]=y` 已设置。

验证步骤：
- 重新执行 `west build -t menuconfig`，确认目标配置项显示为 `[*]`（已选中）或正确的值。
- 检查 `build/zephyr/.config` 文件，确认 `CONFIG_XXX=y` 已出现且值为预期。
- 编译后检查固件尺寸变化，确认对应模块已被链接。

问题 2：编译时提示 "undefined reference" 或 "multiple definition"

诊断方法：
- 检查对应功能的 Kconfig 是否已启用：`grep CONFIG_[MODULE] build/zephyr/.config`，若未启用，说明驱动/库未编译进固件。
- 使用 `nm` 工具查看目标文件中的符号：`arm-zephyr-eabi-nm build/zephyr/[module].o | grep [symbol]` 确认符号是否存在。
- 检查 `CMakeLists.txt` 中是否通过 `target_sources()` 包含了对应的 `.c` 源文件。

解决方案：
- "undefined reference"：启用对应的 Kconfig 项使驱动/库参与编译；或在 `CMakeLists.txt` 中补充源文件路径。
- "multiple definition"：检查是否有两处定义了同名函数（如应用层与 Zephyr 库重复实现同一 driver API），删除重复定义或用 `#ifndef` 保护。
- 检查链接脚本和 `zephyr_linker_sources()`，确认没有重复链接同一个 `.o` 文件。

验证步骤：
- 重新编译 `west build`，确认链接阶段无错误。
- 使用 `arm-zephyr-eabi-nm build/zephyr/zephyr.elf | grep [symbol]` 确认符号正确解析且仅出现一次。
- 在目标板上运行并通过 Shell 命令调用对应功能，确认运行时正常。

问题 3：设备树节点不生效 / 驱动未绑定

诊断方法：
- 检查 DTS 中对应节点的 `status = "okay"` 是否设置（区分大小写），`disabled` 或 `reserved` 会导致驱动不加载。
- 使用 `west build -t devicetree` 导出最终合并后的设备树头文件，确认节点存在且属性值正确。
- 检查驱动的 compatible string 是否与 Zephyr binding 文件中定义的 `compatible` 一致（binding 文件路径：`dts/bindings/[vendor]/[device].yaml`）。

解决方案：
- 在 `.dts` 或 overlay 中将节点 `status` 改为 `"okay"`。
- 若 compatible 不匹配，修改 DTS 节点或 binding 文件使二者一致。
- 确认设备树 include 路径正确：`.dts` 文件应正确包含 SoC/板级 DTS 头文件引用。
- 对于 I2C/SPI 子节点，确认 `reg` 属性地址正确且在父总线的地址范围内。

验证步骤：
- `west build -t devicetree` 后检查 `build/zephyr/include/generated/devicetree_generated.h`，搜索设备节点的宏定义确认存在。
- 启动后在 Shell 中执行 `device list` 查看已注册设备列表，确认目标设备出现在输出中。
- 在应用代码中调用 `device_get_binding("DEVICE_NAME")` 检查返回值，非 NULL 即绑定成功。

### 驱动与外设初始化问题

问题 1：设备初始化失败 (device not ready)

诊断方法：
- 在 Shell 中执行 `device list` 查看所有设备状态，确认目标设备的初始化状态（READY/FAILED/OFF）。
- 在应用代码中检查 `device_get_binding("DEVICE_NAME")` 的返回值：返回 NULL 表示设备未找到；返回非 NULL 但后续调用 `device_is_ready()` 返回 false 表示初始化失败。
- 检查设备初始化日志：启用 `CONFIG_DEVICE_LOG_LEVEL=4`，查看 `LOG_ERR` 输出中的初始化失败原因（如时钟未开、电源域未供电、引脚冲突）。

解决方案：
- 电源/时钟问题：检查 DTS 中设备是否配置了 `clocks` / `power-domain` 属性，确认对应时钟控制器驱动已启用。
- Pinmux 问题：检查 DTS 中 `pinctrl-0` 属性是否正确配置，使用 `west build -t pinctrl` 检查引脚分配，确保无冲突。
- I2C/SPI 设备：检查总线驱动是否已初始化成功（`device list` 中先确认 I2C/SPI 控制器为 READY 状态），再检查子设备地址是否正确。

验证步骤：
- Shell 中执行 `device list`，确认目标设备状态为 "READY"。
- 调用设备的初始化 API（如 `i2c_configure()`）确认返回 0。
- 执行设备相关功能（如读取传感器数据）确认功能正常。

问题 2：UART 无输出 / LOG 不显示

诊断方法：
- 确认 Kconfig：`grep -E "CONFIG_LOG|CONFIG_UART_CONSOLE|CONFIG_SERIAL" build/zephyr/.config`，LOG 和串口控制台相关配置是否启用。
- 使用逻辑分析仪或示波器挂接 UART TX 引脚，上电后观察是否有波形输出：有波形 → 问题在串口工具或波特率；无波形 → 软件未初始化 UART 或引脚配置错误。
- 检查 DTS 中 `chosen` 节点：`zephyr,console` 和 `zephyr,shell-uart` 是否指向正确的 UART 实例。

解决方案：
- 波特率不匹配：检查 DTS 中 `current-speed` 属性与串口工具设置一致（通常 115200 8N1）。
- UART 引脚被占用：检查 `pinctrl-0` 是否将 UART TX/RX 引脚配置为其他功能，使用 `west build -t pinctrl` 确认。
- LOG 后端未启用：确认 `CONFIG_LOG_BACKEND_UART=y` 或 `CONFIG_LOG_BACKEND_RTT=y`。
- 置一个最小化测试：在 `main()` 第一行调用 `printk("Hello\n")`，排除日志框架本身的问题。

验证步骤：
- 用示波器确认 TX 引脚在启动后能输出数据波形，波特率测量值匹配设定值（±2%）。
- 串口终端（如 PuTTY、Tera Term、minicom）正确配置后能收到 `uart:~$ ` Shell 提示符。
- 输入 `log enable all` 后能看到各模块日志输出。

问题 3：I²C/SPI 通讯异常

诊断方法：
- 使用逻辑分析仪捕获 I2C/SPI 总线波形，检查：起始条件/停止条件、设备地址（含 R/W 位）、ACK/NACK 响应、时钟频率是否与配置一致。
- 对于 I2C：检查 SDA/SCL 上是否有上拉电阻（通常 2.2k~4.7k），用万用表测量空闲时两线是否均为高电平。
- 在 Shell 中执行 `i2c scan` 或 `spi` 相关命令，扫描总线上的设备地址，确认设备是否响应。

解决方案：
- I2C 无 ACK：检查设备地址是否正确（注意 7bit/8bit 地址差异，Zephyr 使用 7bit 地址），确认从设备已上电且复位完成。
- 总线速度不匹配：在 DTS 中调整 `clock-frequency`（I2C 100kHz/400kHz）或 `spi-max-frequency` 属性。
- 引脚配置问题：检查 DTS 中 `pinctrl-0` 是否正确配置了 I2C SDA/SCL 或 SPI MOSI/MISO/SCK/CS 引脚功能。
- 时序问题：读取设备数据手册确认 t_SU、t_HD、t_LOW 等时序参数，在 DTS 中调整 timing 相关属性。

验证步骤：
- `i2c scan` 命令输出中看到目标设备地址，且无通信错误计数。
- 逻辑分析仪波形解码正确，各帧 ACK 正常。
- 对已知寄存器（如 WHO_AM_I / Chip ID）读取验证，返回值与数据手册一致。

### 电源与低功耗问题

问题 1：系统无法进入 DEEP SLEEP

诊断方法：
- 执行 Shell 命令 `power info` 查看当前电源状态和驻留时间，确认系统是否尝试进入低功耗模式。
- 执行 `pm` 命令查看 wakelock 列表，确认是否有活跃的唤醒锁阻止睡眠。常见来源：未关闭的外设、活跃的定时器、主机通信未完成。
- 检查是否有线程处于 RUNNABLE 状态：`kernel stacks` 查看各线程调用栈，`kernel cycles` 查看 CPU 占用，确认没有线程持续占用 CPU 导致 idle 线程无法休眠。

解决方案：
- 开启 tickless idle：确认 `CONFIG_TICKLESS_KERNEL=y`，减少不必要的时钟中断唤醒。
- 释放 wakelock：在外设不再需要时调用 `pm_device_runtime_put()` 释放设备电源引用。
- 禁用调试选项：`CONFIG_LOG`、`CONFIG_SHELL` 等调试功能会阻止深度睡眠，发布版本中可关闭。
- 检查 `CONFIG_PM_DEVICE=y` 是否启用，确保外设驱动支持运行时电源管理，可在空闲时自动挂起。

验证步骤：
- 去除所有 wakelock 后，用 `power info` 确认系统驻留在 DEEP SLEEP 的时间占比 > 90%。
- 电流表测量功耗，确认 DEEP SLEEP 状态下功耗接近数据手册标称值。
- 通过外部中断（GPIO、RTC）唤醒系统，确认能正常恢复运行。

问题 2：功耗过高

诊断方法：
- 使用精密电流表或功率分析仪串联到供电回路，测量各工作状态（S0/S3/S5）下的电流消耗。
- 执行 `west build -t ram_report` 和 `west build -t rom_report` 检查内存使用情况，过高的 SRAM 活动会增加静态功耗。
- 在 Shell 中执行 `pm` 命令查看各设备电源状态，确认不用的外设处于 SUSPEND/OFF 状态。

解决方案：
- 在 Kconfig 中禁用未使用的外设驱动（`CONFIG_XXX=n`），减少不必要的外设时钟和供电。
- 启用时钟门控：确认 SoC 的 `CONFIG_CLOCK_CONTROL=y`，使能各外设时钟的独立开关。
- 启用设备级电源管理：`CONFIG_PM_DEVICE=y` 允许外设驱动在空闲时自动进入低功耗状态。
- 降低系统时钟频率：在不需要高性能时，通过 DTS 或 Kconfig 降低 CPU 和外设总线时钟频率。
- 配置 GPIO 为模拟模式或禁用未使用的引脚，避免浮空输入引脚产生额外漏电流。

验证步骤：
- 逐一禁用外设后重新测量功耗，定位主要功耗来源。
- 对比数据手册中该模式下各电源域的理论功耗值，差值 &lt; 10% 为正常。
- 记录优化前后的功耗对比，确认改善效果。

### 内存与栈问题

问题 1：系统异常重启 / HardFault

诊断方法：
- 启用栈溢出检测：`CONFIG_STACK_SENTINEL=y`、`CONFIG_THREAD_STACK_INFO=y`，死机时会在日志中输出栈溢出信息。
- 使用 `west debug` 启动 GDB 调试会话，运行 `bt` (backtrace) 查看调用栈，`info registers` 查看寄存器，定位崩溃点。
- 对于 HardFault，读取 CFSR/UFSR/DFSR/MMFSR 寄存器（ARMv7-M 专有），判断故障类型：`monitor info` 在 GDB 中查看。
- 从崩溃日志中提取 PC 和 LR 值，使用 `arm-zephyr-eabi-addr2line -e build/zephyr/zephyr.elf [PC_ADDR]` 将地址转换为源码行号。

解决方案：
- 栈溢出：增大线程栈大小（`Kconfig` 中 `CONFIG_MAIN_STACK_SIZE` 或线程创建时的 `stack_size` 参数），或优化函数局部变量（大数组改为动态分配）。
- 空指针/野指针访问：检查代码中所有指针解引用前是否有 NULL 检查，特别注意设备获取失败后的使用。
- MPU 违规：确认 `CONFIG_MPU_STACK_GUARD=y` 已启用，检查是否有跨 MPU 区域的非法访问。
- 使用 GDB 反向调试（`reverse-step`）定位崩溃前的代码路径。

验证步骤：
- 修复后重新运行压力测试（长时间运行、快速状态切换），确认不再触发 HardFault。
- 使用 `kernel stacks` 命令查看各线程栈使用率，确认无线程栈使用率超过 80%。
- 启用 `CONFIG_DEBUG_COREDUMP=y`，系统崩溃时生成 core dump 供事后分析。

问题 2：内存分配失败（malloc/k_malloc 返回 NULL）

诊断方法：
- 在 Shell 中执行 `kernel heap` 查看堆使用情况（空闲/已用/最大连续块），确认堆空间是否已耗尽。
- 执行 `west build -t ram_report` 查看 RAM 使用分布，定位内存占用大户（.data、.bss、heap、各线程栈）。
- 使用 `kernel memory` 或 `pool` 命令查看内核内存池状态，确认是否有内存泄漏（空闲空间持续减少）。

解决方案：
- 增大堆空间：在 Kconfig 中设置 `CONFIG_HEAP_MEM_POOL_SIZE`，根据 RAM 总量预留足够余量。
- 检查代码中的内存管理：确认每次 `k_malloc()` 都有对应的 `k_free()`，避免泄漏；对于固定大小分配，优先使用内存池（`k_mem_slab`）替代动态分配。
- 使用 `CONFIG_MEM_SLAB_TRACE_MAX_UTILIZATION=y` 追踪内存块的最大使用量，优化分配策略。
- 对大数据缓冲区考虑使用静态分配代替动态分配，减少堆碎片和不确定的分配失败。

验证步骤：
- 运行 `kernel heap` 定期监控堆使用率，确认无持续增长趋势（表明无泄漏）。
- 执行压力测试（反复分配/释放内存），确认堆无碎片化导致的分配失败。
- 使用 `west build -t ram_report` 确认优化后 Free RAM > 20% 以上。

### OTA 升级与 Flash 问题

问题 1：OTA 传输失败 / CRC 校验错误

诊断方法：
- 检查传输日志中每包的序号、长度、CRC 值，确认是否有丢包或乱序。使用 `dmesg | grep -i ota` 查看 OTA 模块日志。
- 测量通讯接口（UART/I2C/SPI）的波形质量：边沿抖动、信号完整性、是否存在电磁干扰导致的误码。
- 分别计算源端和目标端的 CRC32，对比二者是否一致，确认 CRC 算法实现（多项式、初始值、输出异或值）相同。

解决方案：
- 引入包重传机制：接收方检测到 CRC 错误后发送 NAK，发送方重传当前包，最大重传次数设为 3。
- 检查 Flash 写入对齐：确认写入地址与 Flash 页边界对齐，写入长度是 Flash 编程单元（通常 4 或 8 字节）的整数倍。
- 降低传输速率或增加包间延迟，避免接收缓冲区溢出导致丢包。
- 增加传输完整性校验：在 OTA 完成后对全镜像计算 SHA256 哈希，与服务器端哈希比对。

验证步骤：
- 通过注入错误（人为翻转一包数据）验证重传和校验机制工作正常。
- 完整 OTA 升级 10 次，确认每次升级后 CRC/SHA256 校验通过，系统正常启动。
- 使用逻辑分析仪捕获完整传输过程，确认无丢包和时序违规。

问题 2：Flash 写入失败

诊断方法：
- 在 Shell 中执行 `flash info` 查看 Flash 设备信息和扇区布局，执行 `flash read [offset] [len]` 读取当前 Flash 内容确认写入前已擦除。
- 检查写入函数的返回值：`flash_write()` 返回 -EINVAL 通常为对齐/长度问题，返回 -EACCES 为写保护或区域锁定。
- 查看 `build/zephyr/.config` 中 `CONFIG_FLASH` 相关配置，确认 Flash 驱动和 Map 分区正确配置。

解决方案：
- 写入前确保已擦除：Flash 写入只能将 1→0，需先调用 `flash_erase()` 将目标区域恢复为全 1（0xFF）。
- 检查对齐要求：写入地址必须对齐到 Flash 编程单元大小（用 `flash_get_write_block_size()` 查询），长度须为编程单元的整数倍。
- 检查写保护：某些 MCU 默认启用 Flash 写保护（FWP），需在初始化时解锁：`flash_write_protection_set(dev, false)`。
- 确保写入区域不与运行代码重叠：使用 `zephyr,code-partition` 和 `storage_partition` 正确分区，避免覆盖正在执行的代码。

验证步骤：
- 在 Shell 中执行 `flash erase [offset] [len]` → `flash write [offset] [data]` → `flash read [offset] [len]` 确认回读值与写入一致。
- 执行系统复位后重新读取，确认数据持久化保存。
- 遍历写入地址范围，确认无写入异常（返回值均为 0）。

### 调试与分析工具问题

问题 1：无法连接 JTAG/SWD

诊断方法：
- 检查硬件连接：确认 SWDIO、SWCLK、GND 三根线正确连接且线序无误，VTref/Uref 连接到目标板 VCC（用于电平匹配）。
- 使用万用表测量调试接口各引脚电平：SWDIO/SWCLK 空闲时应为高电平（内部上拉），VCC 电压与调试器参考电压匹配（通常 3.3V）。
- 使用 J-Link Commander (`JLinkExe`) 或 `pyocd commander` 尝试连接：`JLinkExe -device [CHIP] -if SWD -speed 4000 -autoconnect 1`，查看具体错误信息。

解决方案：
- 降低调试时钟频率：在连接参数中添加 `-speed 100` (100kHz)，高速 SWD 在长线缆或恶劣环境下易失败。
- 检查芯片是否被锁定：某些 MCU 在量产时熔断 DEBUGEN 熔丝位，导致调试接口永久禁用，需通过芯片解锁序列恢复。
- RESET 线连接（推荐）：连接 nRESET 线到调试器，允许调试器在连接前复位芯片，恢复调试接口的可用状态。
- 检查电源：确认目标板已上电且 VCORE 稳定，部分调试器需要目标板供电才能工作。

验证步骤：
- `JLinkExe -device [CHIP] -if SWD -speed 4000 -autoconnect 1` 成功连接并能读取芯片 ID。
- GDB 通过 `target remote :2331` 成功 attach。
- 可正常执行 Flash 下载、单步、断点等调试操作。

问题 2：SystemView / RTT 无输出

诊断方法：
- 确认 Kconfig 已启用：`CONFIG_SEGGER_SYSTEMVIEW=y`、`CONFIG_USE_SEGGER_RTT=y`，对应驱动已编译进固件。
- 检查 RTT 控制块（Control Block）地址：在 `.map` 文件或 GDB 中查找 `_SEGGER_RTT` 符号地址，确认 SystemView 客户端配置的搜索地址范围包含该地址。
- 使用 `JLinkRTTClient` 或 `JLinkRTTViewer` 独立测试 RTT 通道，确认 RTT 本身工作正常后再排查 SystemView 层。

解决方案：
- 增大 RTT 缓冲区大小：`CONFIG_SEGGER_RTT_BUFFER_SIZE_UP=1024`（默认 1024），大数据量时可能溢出导致数据丢失。
- 确认 RTT 控制块搜索范围：在 SystemView 连接设置中，手动输入 `_SEGGER_RTT` 的 RAM 地址（从 `.map` 文件提取），而非使用自动搜索。
- 若使用 J-Link，确认 J-Link 软件版本 > V6.70（较旧版本对 RTT 支持不完整）。
- 在代码中添加 `SEGGER_RTT_printf(0, "RTT init ok\n")` 确认 RTT 通道正常。
- 启用 `CONFIG_SEGGER_SYSTEMVIEW_BOOT_ENABLE=y` 允许从启动阶段开始记录事件。

验证步骤：
- `JLinkRTTClient` 能收到 RTT 终端输出。
- SystemView 软件连接后能看到时间线事件和任务切换。
- RTOS 信息（线程列表、定时器、ISR）在 SystemView 中显示完整。
