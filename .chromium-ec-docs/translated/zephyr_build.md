# 构建 Zephyr OS

Chromium OS EC 使用 `zmake` 工具来构建 Zephyr。

本节描述如何构建和使用 zmake。

## 环境搭建

按照 [Chromium OS Developer Guide](https://chromium.googlesource.com/chromiumos/docs/+/HEAD/developer_guide.md) 同步源码并设置 chroot 环境。

也可以在 Chromium OS chroot 之外构建，但需要额外的设置步骤。如果需要在 chroot 外构建，请参考相关文档。

### 关于源码同步的说明

Legacy EC 只需要一个仓库，因此开发者常用 `repo sync .` 来单独同步 EC 仓库。

由于 Zephyr 构建依赖多个仓库，这样做可能会导致状态不一致。更新源码时请务必执行完整同步。

## 构建

要为单个项目构建 EC，运行：

```bash
(chroot) $ zmake build "${PROJECT}"
```

其中 `${PROJECT}` 是项目名称。

### 从 Portage 构建

也可以通过 Portage 系统来构建 zmake：

```bash
(chroot) $ emerge <ec-package>
```

### 查看 Kconfig

要查看可用的 Kconfig 配置选项：

```bash
(chroot) $ zmake kconfig "${PROJECT}"
```

这将打开一个交互式配置界面，可以浏览和修改项目的 Kconfig 配置。
