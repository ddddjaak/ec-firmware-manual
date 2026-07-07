# 最佳实践与建议


本章总结了基于 Chipsea OpenEC + Zephyr
平台的开发实践经验，从代码规范、能耗优化、安全加固到客户协同开发，提供一套体系化的工程标准。通过遵循这些最佳实践，开发团队可有效提升代码可维护性、降低功耗、增强系统安全性，并加快客户项目集成进度。

## 代码规范与提交流程（Coding Style / Commit / Doc）

### 代码风格与结构规范

Zephyr 作为一个跨平台实时操作系统，其代码风格遵循 Linux Kernel
Style。建议 EC 开发团队严格遵循统一规范，以确保可读性与协作性。

关键原则：

- 缩进：统一使用 4 个空格，不允许使用 Tab。

- 命名规则：

<!-- -->

- 全局变量、结构体：snake_case（如 power_state_t, bat_status）

- 宏与常量：ALL_CAPS_WITH_UNDERSCORE（如 EC_EVENT_LID_CLOSE）

- 函数名：模块前缀 + 动作，如 pwrseq_enter_s3(), kbd_scan_task()

<!-- -->

- 函数职责单一：函数逻辑应短小清晰，每个函数只负责一个功能。

- 头文件组织：禁止循环依赖，公共接口放入 include/，内部定义放入
  src/internal/。

```c
/\* 推荐写法 \*/

int fan_control_set_speed(uint8_t level)

{

if (level > FAN_MAX_LEVEL) {

LOG_ERR(\"Invalid fan level: %d\", level);

return -EINVAL;

}

pwm_set_duty_cycle(fan_pwm, fan_level_to_duty(level));

return 0;

}
```

### Commit 提交流程

在团队协作（尤其是多人维护同一 EC
项目）时，提交规范至关重要。建议遵循如下格式：

```
\<type>(\<module>): \<subject>

\<body>

\<footer>
```

示例：

```
  fix(power): correct deep sleep resume order

```

```
  feat(kbd): add backlight brightness shell command

```

```
  docs(pm): update low-power configuration guide

```

提交类型（type）说明：

- feat：新增功能

- fix：修复 bug

- docs：文档修改

- style：代码格式调整

- refactor：重构逻辑，无功能变更

- test：测试相关改动

- build：编译系统修改（CMake/Kconfig）

### 文档与注释要求

良好的文档是可维护性的保障。建议：

- 每个模块都应包含 README.md，说明功能、依赖、配置项。

- 每个函数应写明 输入参数、返回值、调用时机。

- 使用 Doxygen 风格注释，便于生成 API 文档。

```c
/\*\*

\* \@brief Set EC power state

\*

\* \@param state Target power state (S0/S3/S5)

\* \@return 0 if successful, negative errno otherwise

\*/

int ec_power_set_state(enum ec_power_state state);
```

## 功耗优化策略（System / Peripheral / Application）

### 系统级优化（System Level）

- 启用 Zephyr PM 模块：

```
CONFIG_PM=y

CONFIG_PM_DEVICE=y

CONFIG_PM_DEVICE_RUNTIME=y
```

- 利用 idle 线程 自动进入低功耗模式（例如 SLEEP、DEEP SLEEP）。

- 在电源状态切换（S0 → S3 → S5）时，动态关闭不必要的外设时钟（通过
  clock_control_off()）。

- 避免频繁中断唤醒系统，可通过 中断聚合（Interrupt Coalescing）
  降低唤醒频率。

### 外设级优化（Peripheral Level）

- 对 I²C/SPI/UART 等外设，启用 runtime suspend/resume：

```
  pm_device_action_run(dev, PM_DEVICE_ACTION_SUSPEND);

```

- 关闭未使用 GPIO 的上拉电阻与驱动输出。

- 使用 PWM 占空比调制 替代持续供电，如风扇或背光控制。

- 对 ADC、传感器采样，使用 k_work_delayable 周期调度，避免 busy-loop。

### 应用级优化（Application Level）

- 通过事件驱动机制（如 k_event）替代轮询任务。

- 合并多个周期性任务为一个统一调度线程。

- 使用低功耗策略表（Power Policy Table）定义各场景的外设使能状态。

- 定期分析 PM_STATS 和 thread analyzer，识别高负载线程。

## 安全加固与运行时防护（Security Hardening）

嵌入式控制器在系统安全中扮演"信任根"的角色。因此需要在固件层面进行多维度安全防护：

### 启动阶段安全（Secure Boot）

启用 Bootloader 校验机制：

该部分可通过配置打包工具设置安全启动，目录为ecfw-zephyr\\tools\\EC250XPacker。如何配置请参考4.9安全启动与验证。

### 运行时保护（Runtime Security）

- 启用 Zephyr 的内存保护：

```
CONFIG_USERSPACE=y

CONFIG_STACK_CANARIES=y

CONFIG_HW_STACK_PROTECTION=y
```

- 启用看门狗监控（WDT）防止死锁。

- 使用安全接口（如 secure_flash_write()）防止数据越界写入。

- 对主机命令接口（Host Command）进行权限校验与输入边界检查。

### 调试与生产阶段隔离

在生产模式（Release build）关闭以下特性：

```
CONFIG_LOG=n

CONFIG_SHELL=n

CONFIG_DEBUG=n
```

该部分在编译时加上ecfw-zephyr\\release.conf

## 与客户应用的集成与协作（Integration & Co-Development）

EC 通常作为系统的底层控制核心，需要与主机 BIOS、EC
GUI、工厂测试系统等配合。因此协作开发与接口定义尤为重要。

### 稳定的抽象接口（Abstraction Layer）

- 通过 API 层（如 ec_api_power.h, ec_api_sensor.h）提供稳定调用接口。

<!-- -->

- 对上层主机（Host）隐藏底层差异，如：

```c
  int ec_get_battery_status(struct ec_battery_info \*info);

```

- 保持接口的前向兼容性，新增字段应追加在结构体尾部。

### 配置管理协作 

- 使用统一的 Kconfig + DeviceTree 配置模板，方便客户二次裁剪。

- 对共享资源（如 I²C Bus、Flash、GPIO）定义仲裁策略。

- 提供多项目共用的 common/ 模块（如 charger、keyboard、thermal）。

### 联合调试与问题定位

- 在集成阶段启用 Shell 命令接口，实时查看模块状态：

```
uart:\~\$ power status

uart:\~\$ battery info
```

- 使用 LOG_MODULE_REGISTER(module, level) 进行模块化日志输出。

- 通过主机命令（Host Command）实现跨系统调试，例如 BIOS 调用 EC 调试
  API。

### 发布与版本管理

- 建立版本号规范：

```
  Vx.y.z-buildID

```

- 每次发布均附带：

<!-- -->

- 编译配置（prj.conf）

- 固件映像（.bin/.hex）

- 变更日志（CHANGELOG.md）

<!-- -->

- 支持 OTA 与安全回退机制，确保现场可维护性。
