# AGENTS — Chipsea EC Doxygen 文档 & 固件工作区

## 这是什么
双用途工作区：
1. **Doxygen 文档**：将 `pages/` 下的 9 章 Markdown 编译为 Zephyr 风格 HTML 站
2. **EC 固件代码**：基于 Zephyr RTOS 3.7.0 LTS 的 Chipsea CSCE250X EC 固件工程

参考设计：https://docs.zephyrproject.org/latest/index.html

## 目录结构
```
Doxyfile                    ← Doxygen 配置（必须从工作区根目录运行）
doxygen_custom.css          ← 自定义 Zephyr 风格 CSS
pages/
  mainpage.md               ← \mainpage 首页 + \subpage 章节目录
  ch1_引言.md               ← 各章，以 \page 开头
  ch2_开发环境准备.md
  ...
  ch9_附录.md
assets/
  logo.png                  ← 红色 logo
  media/                    ← 文档内嵌图片
doxygen_output/html/        ← 构建产物（可删除重生成）

EC-Zephyr/                  ← EC 固件工程（Zephyr RTOS 3.7.0 LTS + Chipsea CSCE250X）
  ecfw-zephyr/              ← 主应用工程
    app/                    ← 应用模块（13 个功能子模块）
    boards/                 ← 板级支持包（BSP）
    drivers/                ← 设备驱动
    include/                ← 公共头文件
    prj.conf                ← 基础 Kconfig 配置
    west.yml                ← west 工作区清单
    build.bat               ← 构建脚本
    configure-build.bat     ← 配置构建环境
  ecfwwork/                 ← 工作区扩展
    zephyr_modules_csce250x/← SoC BSP 与 HAL 驱动模块
      soc/arm/chipsea/      ← SoC 级支持（soc.yml, Kconfig, linker.ld, CMakeLists.txt）
      hal/csce250x/         ← CSCE250X 硬件抽象层（35+ 外设驱动）
    zephyr_fork/            ← Zephyr fork 代码（如需要）
    modules/                ← CMSIS 等第三方模块
  build/                    ← 构建产物（可删除重生成）
```

## 构建命令

### 文档构建
```bash
doxygen Doxyfile
```
必须在工作区根目录下执行。产物在 `doxygen_output/html/index.html`。

### 固件构建（需要 Zephyr SDK + west 环境）
```bash
cd EC-Zephyr\ecfw-zephyr
build.bat                    # Windows 一键构建
# 或手动：
west build -b csce250x_evb  # 构建指定 board
west flash                   # 烧录
```

固件构建需要 west 和 Zephyr 3.7.0 SDK 环境，详见文档第2章。

## CSS 定制要点（不要改错）
- **侧边栏导航**：子节全部隐藏，只显示 9 个章节名和首页入口（`.children_ul .children_ul` / `.arrow` / `.arrowhead` 已隐藏）
- **标题栏**：白色底（`#titlearea { background: #fff }`），仅显示 logo
- **链接色**：红色 `#c0392b`
- **搜索框**：浅灰底 `#f0f0f0`，深灰文字 `#333`（白底标题栏下可见）
- **首页卡片**：`.landing-grid` / `.landing-card`（2×2 布局），`.persona-grid`（3 色主题），`.ref-grid`（5 色图标），`.info-box`，`.chapter-grid`

## Page 文件格式
每章 `.md` 文件第一行必须是 Doxygen `\page` 指令：
```markdown
\page chX_slug 章节标题

# 章节标题
```

`mainpage.md` 使用 `\mainpage` 开头。

## 已知 Warning（可忽略）
- `\ref` 无法解析到中文锚点 — mainpage.md 中的目录链接，不影响最终页面
- `non supported language 'bit'` — 源码注释中的 `~bit` 被 Doxygen 误解析
- `Unsupported xml/html tag <board_name>` — ch2 中 `<board_name>` 占位符被 Doxygen 误解释为 HTML 标签
- ch6（调试与验证）和 ch9（附录）现已完成全部内容撰写，不再产生 TBD 占位相关 warning

## 扩写章节
直接编辑 `pages/chX_*.md`，改完后运行 `doxygen Doxyfile` 即可刷新。

## 固件代码与文档的关系
- 文档中的代码示例、DTS 片段、Kconfig 配置项均来源于 `EC-Zephyr/` 实际工程
- ch3（开发包架构）描述的结构对应 `ecfw-zephyr/` 和 `ecfwwork/` 目录
- ch4（固件功能模块）描述的 13 个应用模块对应 `ecfw-zephyr/app/` 源代码
- ch6（调试与验证）现已完成，涵盖功能验证方法（电源/按键/风扇/主机接口）、FAQ 常见问题排查、单元测试与仿真环境（ztest/native_sim/QEMU/HIL/CI）等完整内容
- ch7（移植与定制）的 BSP/SoC 移植示例基于 `zephyr_modules_csce250x/soc/arm/chipsea/` 真实实现
- ch9（附录）现已完成，包含常用命令速查表（West/Zephyr/调试/版本控制）、相关开源资源链接（Zephyr 上游/开发工具/参考设计/芯海相关）、硬件接口参考设计（外设地址映射/中断向量/eSPI 通道/GPIO 配置/SMBus 引脚映射）等完整内容
- 固件代码变更需同步更新文档中的对应章节