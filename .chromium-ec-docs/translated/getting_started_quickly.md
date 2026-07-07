# 快速上手构建 EC 镜像

> **注意**：本文档基于 Chromium OS 开发环境。Chipsea Zephyr EC 的构建流程请参考第 2 章「开发环境准备」。

## 构建

以下是设置开发环境以在 Chromium OS chroot 中构建 EC 镜像的步骤：

1. 创建 chroot 目录：

```bash
mkdir chromiumos; cd chromiumos
```

2. 初始化 repo 仓库：

```bash
repo init -u https://chromium.googlesource.com/chromiumos/manifest.git
```

3. 同步源码：

```bash
repo sync
```

4. 进入 chroot 环境：

```bash
cros_sdk
```

5. 构建 EC 镜像：

```bash
(chroot) ~/trunk/src/platform/ec $ make BOARD=<board_name> -j
```

> **参考**：完整的 Chromium OS 开发指南请参阅 [Chromium OS Developer Guide](https://chromium.googlesource.com/chromiumos/docs/+/HEAD/developer_guide.md)。
