# 固件写保护

> 这是一个比较复杂的话题，因为不同芯片的写保护实现可能不同，且硬件写保护机制随时间有所变化。如有不清楚的地方，请编辑或提交 Issue。

## 术语

## RO 与 RW

运行 EC 代码的 MCU 具有只读（RO）和读写（RW）固件区域。复位后，MCU 从 RO 固件启动。

对于 EC，RO 固件启动宿主并要求其验证 RW 固件的哈希值（软件同步）。如果 RW 固件无效，则从宿主 RW 固件中的副本进行更新。

对于 FPMCU，RO 固件使用嵌入其中的公钥来验证 RW 固件的签名。如果 RW 固件无效，则不会跳转到 RW 固件。

一旦 RW 固件验证通过，MCU 跳转到 RW 固件（无需重启）。RO 固件在工厂锁定后永远不会更改。RW 固件可以通过推送包含更新 RW 区域的新系统固件来更新。

注意：开启写保护后，RO 和 RW 固件区域通常都受到保护。

对于 EC，RW 区域在 MCU 启动时未受保护，直到宿主验证完成。在 Linux 内核加载之前，RW 区域会被保护。

对于 FPMCU，RW 区域在 RO 固件跳转到 RW 之前就受到保护。

## 硬件写保护 {#hw_wp}

在现代 Chrome OS 设备上，Cr50（又称 GSC / TPM）提供一个"硬件写保护"GPIO，通过 GPIO 连接到 AP SPI Flash、EC SPI Flash、EEPROM 和 FPMCU。此"硬件写保护"只能通过 Servo 或 SuzyQ（"CCD open"）禁用，并对应 CCD 中的 `OverrideWP`。禁用此写保护会禁用连接到该信号的所有设备的写保护。

对于 FPMCU，硬件写保护 GPIO 连接到 STM32 的 `BOOT0` 引脚，该引脚告诉 MCU 进入 STM32 引导加载程序模式。

你可能会在文档中看到关于写保护螺丝的说明。旧款 Chrome OS 设备有一个需要物理移除的写保护螺丝。

另一种禁用硬件写保护的方法是移除电池；此方法主要用于 bringup 阶段。

参考：https://chromium.googlesource.com/chromiumos/docs/+/HEAD/write_protection.md

## 更改硬件写保护

如果已完成 "CCD open" 过程，则可以修改硬件写保护状态（通过 Cr50 GPIO）。

!!! note
    `servod` 必须正在运行，`dut-control` 才能工作。详见 Servo 文档。

### 启用硬件写保护

```bash
(chroot)$ dut-control fw_wp_state:force_on
```

### 禁用硬件写保护

```bash
(chroot)$ dut-control fw_wp_state:force_off
```

### 通过 Cr50 控制台启用/禁用硬件写保护

也可以通过 Cr50 控制台直接操作写保护状态。

## 软件写保护

软件写保护是通过 SPI Flash 的状态寄存器实现的。与硬件写保护不同，软件写保护可以独立于硬件写保护进行控制。

## 更改软件写保护

### 使用 ectool 更改软件写保护

```bash
# 读取当前软件写保护状态
ectool flashprotect

# 启用软件写保护
ectool flashprotect enable

# 禁用软件写保护（需要硬件写保护已禁用）
ectool flashprotect disable
```

## system_is_locked()

`system_is_locked()` 函数返回系统的锁定状态。当系统锁定时，某些功能（如通过 Host Command 访问 Flash）将受到限制。

## RDP1

RDP1（Readout Protection Level 1）是 STM32 MCU 的一种读出保护机制。启用 RDP1 后，通过调试接口无法读取 Flash 内容。

### 参考资料

- [Chromium OS 写保护文档](https://chromium.googlesource.com/chromiumos/docs/+/HEAD/write_protection.md)

## EC Flash 读/写命令的写保护检查

EC Flash 读写命令会检查写保护状态。当写保护启用时：

- **RO 区域**：始终受保护，无法通过 Host Command 写入
- **RW 区域**：在软件同步完成前可写，之后被保护
- **整个 Flash**：硬件写保护启用后，所有区域都无法通过 Host Command 写入
