# SPEC: 首页 PPT 感清理

**状态**: ✅ 已完成  
**创建**: 2026-07-09

---

## PPT 感诊断（按严重程度排序）

### 🔴 严重

| # | Section | PPT 套路 | 具体表现 |
|---|---------|---------|---------|
| 1 | **量化收益** | 信息图 | 6xl 琥珀色/紫色/绿色大数字 + 彩色图标背景 = 标准 PPT 统计卡片 |
| 2 | **支持平台** | 产品对比表 | 3 张规格卡 + 彩色标签 badge + Flash/SRAM 对比条 + 外设 tag cloud |
| 3 | **核心优势** | 功能卡片网格 | icon-in-box + 右上角 mono stat + 4 列 grid + 3D tilt 悬浮 |

### 🟡 中等

| # | Section | PPT 套路 | 具体表现 |
|---|---------|---------|---------|
| 4 | **开发全流程** | 流程图 | 编号圆圈 + 图标 + 连接线 = PPT 流程图示 |
| 5 | **交付能力** | 特性网格 | 3×2 卡片 + 底部 hover 强调线 = 产品特性介绍页 |

### 🟢 尚可

| # | Section | 评价 |
|---|---------|------|
| 6 | **典型应用场景** | 2×2 卡片 grid 略有 PPT 感，但灰度配色 + 无装饰线条，勉强可接受 |

---

## PPT 感的共同模式

所有这些 section 共享同一个结构模板：

```
[居中 eyebrow 标签]
[居中说明文字]
[卡片网格 — 3~6 张相同形状的卡片]
  ├── icon in colored box
  ├── stat / badge / tag
  ├── title (bold)
  └── description (gray)
```

这就是典型的 SaaS 落地页模板。Apple 的做法是**拒绝卡片网格**——改用排版层次、留白、有序列表。

---

## 重设计方案

### 核心原则

1. **去卡片化** — 不用 `rounded-2xl border bg-white` 容器
2. **去彩色** — 不用彩色图标、彩色 badge、彩色数字
3. **去图标网格** — 不用 icon-in-box 作视觉锚点
4. **用排版说话** — 大标题 + 小说明 + 留白 = 高级感
5. **信息密度降低** — 不是"一张卡片塞 4 个信息元素"，而是"一个信息点占一整行"

### 各 Section 改造

#### 1. 量化收益 → 三行大字

```
之前: 3 张卡片，每张有 icon(彩色) + 大数字(彩色) + title + desc
改为: 3 行大字，每行一个超大数字 + 一句话

    3 天
    新平台 bring-up 从数周压缩到 3 天出原型

    1 套代码
    一套驱动覆盖笔记本、平板、工控机全产品线

    0 锁定风险
    Apache 2.0 + Linux Foundation 托管，不受单一供应商绑定
```

- 不用卡片容器，直接文字排列
- 数字用 `text-neutral-900 dark:text-white`（非彩色）
- 不用图标
- 保留 GSAP 计数器动画但去掉弹性缓动（太俏皮）

#### 2. 支持平台 → 简洁规格表

```
之前: 3 张彩色标签卡片 + spec bars + 外设 tag cloud + badge
改为: 3 列文字 + 分隔竖线

    CSCE250X           │  CSCE2010           │  CSCE2520
    Cortex-M33 120MHz  │  Cortex-M0+ 24MHz   │  Cortex-M33 120MHz
    512KB / 256+KB     │  256KB / 64KB       │  512KB / 256+KB
    USB PD · eSPI      │  I²C · SPI · UART   │  USB PD · eSPI · TrustZone
    当前主力           │  低功耗优选          │  即将推出

    跨平台统一驱动 — 应用代码零修改即可迁移
```

- 不用卡片，用纯文字表格
- 芯片名用大号 mono 字体
- 规格用小号灰色文字
- 保留 "一套代码三款芯片" 横幅但简化

#### 3. 核心优势 → 四行要点

```
之前: 4 张图标卡片
改为: 4 行大标题 + 说明

    架构现代化
    Zephyr RTOS + Device Tree + 统一驱动模型。3 天出原型。

    按需选型
    CSCE2010 / CSCE250X / CSCE2520 阶梯覆盖。不为不需要的功能买单。

    安全合规
    内置 MCUboot 安全启动。满足企业客户安全审计。

    量产验证
    笔记本、平板、工控机多品类已通过产线验证。
```

- 不用图标、不用卡片、不用 stat
- 大号 bold 标题 + 一行说明
- 行间距大，留白充足

#### 4. 开发全流程 → 保留但简化

```
之前: 编号圆圈 + 图标 + 连接线 + 文字（PPT 流程图）
改为: 去掉图标，只保留编号 + 文字，连接线换成简单竖线

    01  环境搭建
        安装 Zephyr SDK、Python 依赖、交叉编译工具链...

    02  板级适配
        编写 Device Tree、Kconfig 配置...

    ...
```

- 或者直接保留当前设计（中等 PPT 感，但流程类内容天然需要视觉引导）
- 如果保留：去掉图标圆圈，只留编号 + 标题

#### 5. 交付能力 → 单列列表

```
之前: 3×2 卡片网格
改为: 单列 6 行要点

    79 页技术文档
    从环境搭建、架构原理到量产部署 — 覆盖全生命周期

    三芯片统一平台
    CSCE250X / CSCE2010 / CSCE2520 共享驱动模型

    ...
```

- 单列布局，不用卡片
- 标题 bold + 说明 gray
- 大量留白

---

## 涉及文件

| 文件 | 改动 |
|------|------|
| `app/(home)/_sections/metrics-section.tsx` | 去卡片 + 去彩色 + 去图标 |
| `app/(home)/_sections/platforms-section.tsx` | 去卡片 + 去 badge + 去 spec bars |
| `app/(home)/_sections/advantages-section.tsx` | 去卡片 + 去图标 + 去 stat |
| `app/(home)/_sections/dev-flow-section.tsx` | 去图标圆圈（可选） |
| `app/(home)/_sections/delivery-section.tsx` | 去卡片网格 → 单列列表 |
| `app/(home)/_sections/use-cases-section.tsx` | 去卡片网格 → 列表 |

## 不变

- Hero section — 已经干净
- Pain→Solution section — 已重设计好
- 光球背景
- 双主题
- GSAP 动画基础设施

## 验收

- [ ] `npm run build` 通过
- [ ] 首页不再有"卡片网格"布局
- [ ] 不再有彩色 icon/stat/badge
- [ ] 页面以排版层次为主导（大标题 + 说明 + 留白）
- [ ] 亮色/暗色均好看
