<div class="chapter-header"><span class="chapter-num">03</span><span class="separator">/</span><a href="../index.md">首页</a><span class="separator">›</span><a href="index.md">开发包架构概述</a><span class="separator">›</span><span>Legacy EC 与 Zephyr EC 源码对照</span></div>

### Legacy EC 与 Zephyr EC 源码对照

Chromium EC 项目在 2021 年从 Legacy EC（裸机 RTOS）迁移到 Zephyr RTOS，两套代码在上游仓库中并行存在。了解两者的目录对应关系有助于阅读上游文档和参考代码。

#### 共享目录（Legacy 与 Zephyr 共用）

| 目录 | 职责 |
|------|------|
| `common/` | EC 核心逻辑——系统、主机命令、芯片无关的功能代码（电源管理、LED、充电策略等） |
| `driver/` | EC 硬件无关驱动——键盘矩阵扫描、温度传感器、BC1.2 等 |
| `include/` | 头文件——EC 代码使用的宏、类型、函数声明 |
| `baseboard/` | 底板系列定义——`baseboard.h/c`、`build.mk`、`usb_pd_policy.c` |
| `board/` | 单板定义——`board.h/c`、`build.mk`、`gpio.inc`、`ec.tasklist` |
| `chip/` | 芯片系列代码——芯片寄存器定义、芯片级驱动、初始化和中断处理 |
| `core/` | 核心运行时——启动、任务调度、中断处理、主机命令调度器、闪存更新 |
| `util/` | 独立工具——位操作、字节序、数学工具、控制台历史等 |

#### Zephyr 专属目录

| 目录 | 职责 |
|------|------|
| `zephyr/` | Zephyr shim 层——适配 Zephyr 框架的代码（board 目录、drivers、subsys、include 等） |
| `zephyr/boards/` | 硬件定义——board.h、板级 Kconfig、DTS overlay、devicetree 目录、代码片段、扇区布局 |
| `zephyr/drivers/` | 常用驱动——非芯片相关的 EC 驱动、信号驱动、IO 展开、用于模拟和测试的 fake 驱动 |
| `zephyr/subsys/` | 子系统——console、charger、thermal、USBC、firmware、debug 等 |
| `zephyr/test/` | 单元测试——基于 CMocka 的 host-based（native_posix）测试，通过 twister 运行 |
| `zephyr/tests/` | 集成测试——基于 Zephyr ztest 框架的板级测试 |
| `zephyr/lib/` | 通用库——thermal、math 工具、EC 信号模拟、getter/setter |
| `zephyr/include/` | Zephyr 专属头文件 |

#### Legacy EC 不再使用的目录

| 目录 | 说明 |
|------|------|
| `arch/` | CPU 架构代码，Zephyr 由 Zephyr 自身处理 |
| `core/` | Legacy 核心运行时，Zephyr 替代 |
| `chip/` | Legacy 芯片驱动，Zephyr 由 `chip/` + `soc/` + `dts/` 替代 |
| `common/` | Legacy 共享代码，Zephyr 由 `common/` + `zephyr/subsys/` 替代 |
| `driver/` | Legacy 共享驱动，Zephyr 由 `driver/` + `zephyr/drivers/` 替代 |
| `include/` | Legacy 头文件，Zephyr 由 `include/` + `zephyr/include/` 替代 |
| `util/` | Legacy 独立工具，Zephyr 由 `util/` + `zephyr/lib/` 替代 |

