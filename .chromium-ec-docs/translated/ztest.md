# Zephyr 测试

开始之前，开发者应阅读以下内容：

- [Zephyr 测试框架（ztest）](https://docs.zephyrproject.org/latest/develop/test/ztest.html)
- [Zephyr 测试运行器（Twister）](https://docs.zephyrproject.org/latest/develop/test/twister.html)

## 获取帮助

将 `zephyr-test-eng@google.com` 添加为 CL 的审阅者来获取测试方面的帮助。

提问渠道：

- Google 内部：使用 YAQS 标签 `zephyr-rtos-test`
- 外部贡献者：
    - 发送邮件至 `zephyr-test-eng@google.com`
    - 或加入 [Public Zephyr Discord](https://discord.com/invite/Ck7jw53nU2)，访问 `#testing` 频道

## 在哪里添加测试？

测试目前位于 `zephyr/test` 目录中。添加新测试时，可以创建包含 `testcase.yaml` 的新目录，或者如果测试是现有测试的轻微变体，可以在现有的 `testcase.yaml` 中添加新条目。

### 如何决定测试应放在哪里？

如果要添加新的编译单元，请检查依赖关系。该单元是否与现有的 Kconfig 关联？如果是，可能已有其他测试启用了它并链接了你的 `.c` 文件。最省时间的做法是直接向该现有测试二进制文件添加新的测试套件，或者至少通过在 `testcase.yaml` 文件中添加新条目来创建二进制文件的变体。

如果这不可行，可能需要从头创建新测试。首先，决定这是集成测试还是单元测试。集成测试会构建完整系统，因此有时更容易设置（因为它们看起来和感觉像一个应用程序）。但正因如此，缺少 Mock 会使强制执行特定代码路径变得更加困难。

对于集成测试，`zephyr/test` 下的任何测试都是好示例。单元测试的示例可在 `common/spi/flash_reg` 下找到。

## testcase.yaml 的结构

顶层 `testcase.yaml` 使用 `test:` 块定义每个测试用例的属性。可选的 `common:` 块使用与测试用例相同的属性，但应用于文件中的所有测试用例。

常用属性包括：

- `extra_configs` — 要添加到测试的 Kconfig 列表
- `extra_conf_files` — 指定要应用到构建的额外 Kconfig 文件的 YAML 列表
- `extra_overlay_confs` — 指定覆盖 Kconfig 文件的列表
- `extra_dtc_overlay_files` — 指定要应用到构建的额外设备树文件列表

`extra_args` 是一个字符串字段，允许向构建注入自由格式的 CMake 变量。很少需要，且在此指定 `CONF_FILE`、`OVERLAY_CONFIG` 或 `DTC_OVERLAY_FILE` 的做法已被弃用。

## 集成测试

集成测试构建完整的 EC。它们需要正确设置设备树和所有 Kconfig。要构建集成测试，使用以下 `CMakeLists.txt` 模板：

```cmake
cmake_minimum_required(VERSION 3.20.0)
find_package(Zephyr REQUIRED HINTS $ENV{ZEPHYR_BASE})
project(integration_test)
target_sources(app PRIVATE src/test.c)
```

## Mock

测试框架支持 Mock 功能，可以替换硬件相关的函数实现。Mock 允许在不依赖实际硬件的情况下测试特定代码路径。

## 运行 Twister

### 运行特定目录下的所有测试

```bash
twister -T <test_directory>
```

### 运行特定测试

```bash
twister -T <test_directory> -s <test_name>
```

### 运行所有测试并收集覆盖率

```bash
twister -T <test_directory> --coverage
```

### 获取更多 Twister 信息

```bash
twister --help
```

## 使用假设（Assumptions）

Zephyr 测试框架支持使用假设来跳过不适用于当前平台的测试。

## 调试

调试测试时，可以使用 GDB 附加到运行中的测试进程。

## 消除 Flaky 测试

对于不稳定的测试（Flaky Tests），应找出根本原因并修复，而不是简单地重试。
