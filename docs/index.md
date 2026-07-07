---
hide:
  - navigation
  - toc
---

<div class="cyber-hero" markdown>

<span class="hero-chip-label">CSCE250X · Cortex-M33 · Zephyr 3.7.0</span>

# Chipsea Zephyr EC Manual

<div class="hero-divider"></div>

<p class="hero-tagline">嵌入式控制器固件开发指南</p>

为内部团队及 ODM 伙伴提供标准化的 EC 固件开发框架——从环境搭建、设备树配置、驱动开发到系统集成的最佳实践。

<div class="hero-stats" markdown>

<div class="hero-stat" markdown>
<span class="hero-stat-value">30</span>
<span class="hero-stat-label">分钟上手</span>
</div>

<div class="hero-stat" markdown>
<span class="hero-stat-value">13</span>
<span class="hero-stat-label">功能模块</span>
</div>

<div class="hero-stat" markdown>
<span class="hero-stat-value">18</span>
<span class="hero-stat-label">驱动</span>
</div>

<div class="hero-stat" markdown>
<span class="hero-stat-value">29</span>
<span class="hero-stat-label">示例</span>
</div>

</div>

</div>

---

## 快速入口

<div class="home-feature-grid">

<a href="quickstart/index.md" class="feature-card feature-quickstart">
  <div class="feature-icon">🚀</div>
  <div class="feature-body">
    <h3>快速上手</h3>
    <p>30 分钟完成环境搭建、编译并烧录第一个固件</p>
  </div>
</a>

<a href="dev/index.md" class="feature-card feature-dev">
  <div class="feature-icon">📖</div>
  <div class="feature-body">
    <h3>开发指南</h3>
    <p>架构设计、功能模块、驱动开发、调试验证 — 日常核心参考</p>
  </div>
</a>

<a href="ch7/index.md" class="feature-card feature-porting">
  <div class="feature-icon">🔧</div>
  <div class="feature-body">
    <h3>移植与定制</h3>
    <p>新平台移植、驱动开发、从传统 EC 迁移到 Zephyr</p>
  </div>
</a>

<a href="ref/index.md" class="feature-card feature-ref">
  <div class="feature-icon">📋</div>
  <div class="feature-body">
    <h3>参考手册</h3>
    <p>命令速查、术语表、硬件接口参考、开源资源链接</p>
  </div>
</a>

</div>

---

## 全部内容

<div class="home-sections">

<div class="section-group">

### 开发指南

<div class="section-links">

<a href="dev/architecture/index.md" class="section-link">
  <span class="sl-icon">🏛</span>
  <span class="sl-text">
    <strong>架构与配置</strong>
    <small>分层模型 · 目录结构 · DTS/Kconfig</small>
  </span>
</a>

<a href="dev/modules/index.md" class="section-link">
  <span class="sl-icon">🧩</span>
  <span class="sl-text">
    <strong>功能模块</strong>
    <small>电源 · 键盘 · 电池 · 热管理 · USB/PD 等 10 个模块</small>
  </span>
</a>

<a href="dev/appdev/index.md" class="section-link">
  <span class="sl-icon">💻</span>
  <span class="sl-text">
    <strong>应用开发</strong>
    <small>新增模块 · 外设驱动 · 任务模型 · 主机通信</small>
  </span>
</a>

<a href="dev/debug/index.md" class="section-link">
  <span class="sl-icon">🐛</span>
  <span class="sl-text">
    <strong>调试与验证</strong>
    <small>日志 · 单元测试 · 崩溃分析 · FAQ</small>
  </span>
</a>

</div>

</div>

<div class="section-group">

### 更多资源

<div class="section-links">

<a href="ch7/index.md" class="section-link">
  <span class="sl-icon">🔧</span>
  <span class="sl-text">
    <strong>移植与定制</strong>
    <small>BSP 创建 · 设备树适配 · 驱动开发 · 迁移指南</small>
  </span>
</a>

<a href="ch8/index.md" class="section-link">
  <span class="sl-icon">✨</span>
  <span class="sl-text">
    <strong>最佳实践</strong>
    <small>代码规范 · 功耗优化 · 安全加固 · 协作流程</small>
  </span>
</a>

<a href="ref/index.md" class="section-link">
  <span class="sl-icon">📋</span>
  <span class="sl-text">
    <strong>参考手册</strong>
    <small>命令速查 · 术语表 · 硬件接口 · 开源资源</small>
  </span>
</a>

</div>

</div>

</div>

---

<div class="home-meta">

| | |
|---|---|
| **版本** | V1.0 (2026-05-21) |
| **适用平台** | CSCE10X / CSCE201X / CSCE250X |
| **工具链** | VS Code + Zephyr 3.7.0 LTS |

</div>

<div class="page-footer">

**V1.0** · 基于 Zephyr 3.7.0 LTS

</div>
