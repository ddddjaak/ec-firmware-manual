\mainpage

# 芯海 EC 固件开发手册

欢迎查阅芯海科技嵌入式控制器(EC)固件开发文档，当前版本 V1.0，基于 Zephyr 3.7.0 LTS。

本文档为内部团队及 ODM 伙伴提供一套完整的标准化开发框架——从环境搭建、设备树配置、驱动开发到系统集成的最佳实践，最终打造高性能、高可靠性的 EC 产品。

---

\htmlonly
<div class="landing-grid">
  <a href="ch1__xE5_xBC_x95_xE8_xA8_x80.html" class="landing-card">
    <span class="card-icon"><svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#c0392b" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg></span>
    <div class="card-content">
      <h3 class="card-title">认识 EC</h3>
      <p class="card-desc">理解 EC 在笔记本与嵌入式系统中的角色，掌握 OpenEC+Zephyr RTOS 的架构优势与开发理念</p>
    </div>
  </a>
  <a href="ch2__xE5_xBC_x80_xE5_x8F_x91_xE7_x8E_xAF_xE5_xA2_x83_xE5_x87_x86_xE5_xA4_x87.html" class="landing-card">
    <span class="card-icon"><svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#c0392b" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg></span>
    <div class="card-content">
      <h3 class="card-title">开始搭建</h3>
      <p class="card-desc">Linux/Windows 双平台一站式开发环境搭建，从工具链配置到首次固件编译验证</p>
    </div>
  </a>
  <a href="ch5__xE5_xBA_x94_xE7_x94_xA8_xE5_xBC_x80_xE5_x8F_x91_xE6_x8C_x87_xE5_x8D_x97.html" class="landing-card">
    <span class="card-icon"><svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#c0392b" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg></span>
    <div class="card-content">
      <h3 class="card-title">开发包架构</h3>
      <p class="card-desc">深入 Chipsea Zephyr SDK 目录结构、Kconfig 配置分层与设备树组织方式</p>
    </div>
  </a>
  <a href="ch5__xE5_xBA_x94_xE7_x94_xA8_xE5_xBC_x80_xE5_x8F_x91_xE6_x8C_x87_xE5_x8D_x97.html" class="landing-card">
    <span class="card-icon"><svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#c0392b" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg></span>
    <div class="card-content">
      <h3 class="card-title">固件开发</h3>
      <p class="card-desc">任务调度模型、外设驱动框架、主机通信协议与 Zephyr 系统服务实战指南</p>
    </div>
  </a>
</div>
\endhtmlonly

\htmlonly
<div class="section-header">
  <h2 class="section-title">选择你的起点</h2>
  <p class="section-subtitle">根据你的角色和工作内容，快速找到相关文档</p>
</div>
<div class="persona-grid">
  <div class="persona-card type-app">
    <div class="persona-header">
      <h3>应用开发者</h3>
      <p>开发 EC 固件业务逻辑和功能模块</p>
    </div>
    <ul class="persona-links">
      <li><a href="ch1__xE5_xBC_x95_xE8_xA8_x80.html">引言 — 了解 EC 核心概念</a></li>
      <li><a href="ch2__xE5_xBC_x80_xE5_x8F_x91_xE7_x8E_xAF_xE5_xA2_x83_xE5_x87_x86_xE5_xA4_x87.html">开发环境准备 — 从头搭建工具链</a></li>
      <li><a href="ch5__xE5_xBA_x94_xE7_x94_xA8_xE5_xBC_x80_xE5_x8F_x91_xE6_x8C_x87_xE5_x8D_x97.html">应用开发指南 — 从零开始构建 EC 功能模块</a></li>
      <li><a href="ch6__xE8_xB0_x83_xE8_xAF_x95_xE4_xB8_x8E_xE9_xAA_x8C_xE8_xAF_x81.html">调试与验证 — 日志、Shell、仿真</a></li>
    </ul>
  </div>
  <div class="persona-card type-hw">
    <div class="persona-header">
      <h3>硬件 / 移植工程师</h3>
      <p>接入新平台、定制 BSP 与设备树</p>
    </div>
    <ul class="persona-links">
      <li><a href="ch5__xE5_xBA_x94_xE7_x94_xA8_xE5_xBC_x80_xE5_x8F_x91_xE6_x8C_x87_xE5_x8D_x97.html">开发包架构概述 — 目录与配置体系</a></li>
      <li><a href="ch4__xE5_x9B_xBA_xE4_xBB_xB6_xE5_x8A_x9F_xE8_x83_xBD_xE6_xA8_xA1_xE5_x9D_x97_xE8_xAF_xB4_xE6_x98_x8E.html">固件功能模块 — 电源、键盘、接口详解</a></li>
      <li><a href="ch7__xE7_xA7_xBB_xE6_xA4_x8D_xE4_xB8_x8E_xE5_xAE_x9A_xE5_x88_xB6.html">移植与定制 — BSP 创建与设备树适配</a></li>
    </ul>
  </div>
  <div class="persona-card type-quality">
    <div class="persona-header">
      <h3>质量 / 规范</h3>
      <p>代码质量、安全与团队协作</p>
    </div>
    <ul class="persona-links">
      <li><a href="ch8__xE6_x9C_x80_xE4_xBD_xB3_xE5_xAE_x9E_xE8_xB7_xB5_xE4_xB8_x8E_xE5_xBB_xBA_xE8_xAE_xAE.html">最佳实践与建议 — 代码规范与优化</a></li>
      <li><a href="ch9__xE9_x99_x84_xE5_xBD_x95.html">附录 — 命令速查与资源链接</a></li>
      <li><a href="ch6__xE8_xB0_x83_xE8_xAF_x95_xE4_xB8_x8E_xE9_xAA_x8C_xE8_xAF_x81.html">调试与验证 — 问题定位与仿真</a></li>
    </ul>
  </div>
</div>
\endhtmlonly

\htmlonly
<div class="section-header">
  <h2 class="section-title">核心参考</h2>
  <p class="section-subtitle">快速访问最常用的参考资料</p>
</div>
<div class="ref-grid">
  <a href="ch4__xE5_x9B_xBA_xE4_xBB_xB6_xE5_x8A_x9F_xE8_x83_xBD_xE6_xA8_xA1_xE5_x9D_x97_xE8_xAF_xB4_xE6_x98_x8E.html" class="ref-card">
    <span class="ref-icon rc-modules"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect></svg></span>
    <div class="ref-body">
      <h3 class="ref-title">功能模块</h3>
      <p class="ref-desc">电源、键盘、风扇、接口模块详解</p>
    </div>
    <span class="ref-arrow">→</span>
  </a>
  <a href="ch5__xE5_xBA_x94_xE7_x94_xA8_xE5_xBC_x80_xE5_x8F_x91_xE6_x8C_x87_xE5_x8D_x97.html" class="ref-card">
    <span class="ref-icon rc-kconfig"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg></span>
    <div class="ref-body">
      <h3 class="ref-title">Kconfig 配置</h3>
      <p class="ref-desc">编译选项与功能裁剪配置体系</p>
    </div>
    <span class="ref-arrow">→</span>
  </a>
  <a href="ch7__xE7_xA7_xBB_xE6_xA4_x8D_xE4_xB8_x8E_xE5_xAE_x9A_xE5_x88_xB6.html" class="ref-card">
    <span class="ref-icon rc-porting"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#a855f7" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"></path><path d="M2 17l10 5 10-5"></path><path d="M2 12l10 5 10-5"></path></svg></span>
    <div class="ref-body">
      <h3 class="ref-title">移植指南</h3>
      <p class="ref-desc">BSP 创建、设备树适配与新平台接入</p>
    </div>
    <span class="ref-arrow">→</span>
  </a>
  <a href="ch8__xE6_x9C_x80_xE4_xBD_xB3_xE5_xAE_x9E_xE8_xB7_xB5_xE4_xB8_x8E_xE5_xBB_xBA_xE8_xAE_xAE.html" class="ref-card">
    <span class="ref-icon rc-practice"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f97316" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg></span>
    <div class="ref-body">
      <h3 class="ref-title">最佳实践</h3>
      <p class="ref-desc">代码规范、能耗优化与安全加固</p>
    </div>
    <span class="ref-arrow">→</span>
  </a>
  <a href="ch9__xE9_x99_x84_xE5_xBD_x95.html" class="ref-card">
    <span class="ref-icon rc-appendix"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg></span>
    <div class="ref-body">
      <h3 class="ref-title">附录</h3>
      <p class="ref-desc">命令速查表、开源资源与硬件参考</p>
    </div>
    <span class="ref-arrow">→</span>
  </a>
</div>
\endhtmlonly

\htmlonly
<div class="info-box">
  <div class="info-item"><span class="info-label">版本：</span><span class="info-value">V1.0 (2026-05-21)</span></div>
  <div class="info-item"><span class="info-label">适用平台：</span><span class="info-value">ARM EC — CSCE10X / CSCE201X / CSCE250X 系列</span></div>
  <div class="info-item"><span class="info-label">工具链：</span><span class="info-value">VS Code + Zephyr 3.7.0 LTS</span></div>
</div>
\endhtmlonly

\htmlonly
<div class="chapter-list">
  <h3>全部章节</h3>
  <div class="chapter-grid">
    <a href="ch1__xE5_xBC_x95_xE8_xA8_x80.html" class="chapter-item">1. 引言 — EC 概念与 OpenEC+Zephyr 优势</a>
    <a href="ch2__xE5_xBC_x80_xE5_x8F_x91_xE7_x8E_xAF_xE5_xA2_x83_xE5_x87_x86_xE5_xA4_x87.html" class="chapter-item">2. 开发环境准备 — Linux/Windows 双平台搭建</a>
    <a href="ch5__xE5_xBA_x94_xE7_x94_xA8_xE5_xBC_x80_xE5_x8F_x91_xE6_x8C_x87_xE5_x8D_x97.html" class="chapter-item">3. 开发包架构概述 — 目录与 Kconfig 解析</a>
    <a href="ch4__xE5_x9B_xBA_xE4_xBB_xB6_xE5_x8A_x9F_xE8_x83_xBD_xE6_xA8_xA1_xE5_x9D_x97_xE8_xAF_xB4_xE6_x98_x8E.html" class="chapter-item">4. 固件功能模块 — 电源、键盘、接口详解</a>
    <a href="ch5__xE5_xBA_x94_xE7_x94_xA8_xE5_xBC_x80_xE5_x8F_x91_xE6_x8C_x87_xE5_x8D_x97.html" class="chapter-item">5. 应用开发指南 — 快速上手与最佳实践</a>
    <a href="ch6__xE8_xB0_x83_xE8_xAF_x95_xE4_xB8_x8E_xE9_xAA_x8C_xE8_xAF_x81.html" class="chapter-item">6. 调试与验证 — 日志、Shell、仿真诊断</a>
    <a href="ch7__xE7_xA7_xBB_xE6_xA4_x8D_xE4_xB8_x8E_xE5_xAE_x9A_xE5_x88_xB6.html" class="chapter-item">7. 移植与定制 — BSP 与设备树适配</a>
    <a href="ch8__xE6_x9C_x80_xE4_xBD_xB3_xE5_xAE_x9E_xE8_xB7_xB5_xE4_xB8_x8E_xE5_xBB_xBA_xE8_xAE_xAE.html" class="chapter-item">8. 最佳实践与建议 — 规范、优化、安全</a>
    <a href="ch9__xE9_x99_x84_xE5_xBD_x95.html" class="chapter-item">9. 附录 — 命令速查、资源、硬件参考</a>
  </div>
</div>
\endhtmlonly