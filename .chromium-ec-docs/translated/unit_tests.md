# 单元测试

概述如何在 EC 代码库中编写和运行单元测试。

## 运行单元测试

单元测试在宿主机上运行，使用 `host` 板级配置。

列出可用的单元测试：

```bash
(chroot) ~/trunk/src/platform/ec $ make print-host-tests
```

运行所有单元测试：

```bash
(chroot) ~/trunk/src/platform/ec $ make runhosttests -j
```

运行单个单元测试：

```bash
(chroot) ~/trunk/src/platform/ec $ make BOARD=host run-<test_name>
```

## 调试单元测试

可以使用 GDB 调试单元测试：

```bash
(chroot) ~/trunk/src/platform/ec $ make BOARD=host run-<test_name> GDB=1
```

## 编写单元测试

### 文件头

每个单元测试文件应包含标准的 Chromium OS 版权头。

### 测试用例

测试用例使用 `test_case` 结构体定义，包含测试名称和函数指针。

### 指定要运行的测试用例

使用 `--test-filter` 参数可以过滤运行特定测试用例。

### 任务列表

如果测试需要模拟多任务环境，需要定义 `ec.tasklist` 文件。

### Makefile

每个测试目录需要一个 `build.mk` 文件来指定编译的源文件。

### 测试配置文件

测试配置文件 `test_config.h` 用于定义测试环境的宏和配置。

### 构建和运行

```bash
# 构建测试
make BOARD=host BUILD=<test_name>

# 运行测试
make BOARD=host run-<test_name>
```

## Mock

单元测试框架支持 Mock 功能，可以替换硬件相关的函数实现。

### Mock Time

可以使用 mock time 来模拟时间流逝，而不需要实际等待。
