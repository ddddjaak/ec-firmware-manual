import Link from 'next/link';
import {
  Rocket, BookOpen, Cable, Terminal,
  Cpu, Bug, Shield, Layers,
  ArrowRight, Clock, Zap, Braces, ChevronRight, Blocks,
  Microchip, BatteryFull, Usb, Wifi, Thermometer,
  Sparkles, FileText, Gauge, GitBranch, MessageSquare,
  TrendingUp, Lock, Feather, RefreshCw, CheckCircle2,
} from 'lucide-react';
import { CircuitBackground } from '@/components/circuit-background';
import { ScrollReveal } from '@/components/scroll-reveal';
import { HeroSearch } from '@/components/hero-search';

const exploreCards = [
  {
    cols: 'sm:col-span-2',
    icon: Layers,
    tag: '架构',
    title: '四层设计',
    desc: '应用层 → 服务层 → 驱动层 → 硬件层。理解每一层如何抽象其下层。',
    href: '/docs/development/architecture/01_layered_architecture',
  },
  {
    icon: Cpu,
    tag: '模块',
    title: '10 个子系统',
    desc: '电源时序、键盘扫描、电池充电、热管理、USB PD — 每个子系统均有详尽文档。',
    href: '/docs/development/modules/01_system_infrastructure',
  },
  {
    icon: Cable,
    tag: '移植',
    title: 'BSP 创建',
    desc: '从零构建板级支持 — 引脚复用、设备树、Kconfig 及新硬件的启动流程。',
    href: '/docs/porting/01_porting_guide',
  },
  {
    icon: Terminal,
    tag: '参考',
    title: '命令速查表',
    desc: 'West、CMake、Git 及调试命令一览。',
    href: '/docs/reference/01_command_reference',
  },
  {
    icon: Bug,
    tag: '调试',
    title: '崩溃分析与常见问题',
    desc: '致命错误、看门狗复位、栈溢出及常见陷阱。',
    href: '/docs/development/debug/01_logging_and_debug',
  },
  {
    cols: 'sm:col-span-3',
    icon: Shield,
    tag: '生产',
    title: '最佳实践与优化',
    desc: '编码规范、功耗调优、安全加固及客户集成流程，助力量产固件交付。',
    href: '/docs/best-practices',
    time: '5 篇指南',
  },
];

const quickLinks = [
  { icon: BookOpen, label: '开发指南', href: '/docs/development' },
  { icon: Braces, label: '应用开发', href: '/docs/development/appdev/01_new_feature_module' },
  { icon: Blocks, label: '移植', href: '/docs/porting' },
  { icon: Terminal, label: '命令参考', href: '/docs/reference/01_command_reference' },
];

const techStack = [
  { icon: Microchip, label: 'Zephyr RTOS 3.7', desc: '开源实时操作系统' },
  { icon: Cpu, label: 'Cortex-M33/M0+', desc: 'ARMv8-M / v6-M 架构' },
  { icon: Cable, label: 'USB PD 3.1', desc: '电源传输协议' },
  { icon: Usb, label: 'USB Type-C', desc: '接口与 Alt Mode' },
  { icon: BatteryFull, label: '电池管理', desc: '充电与电量计' },
  { icon: Thermometer, label: '热管理', desc: '温度监控与风扇' },
  { icon: Wifi, label: 'EC 通信', desc: 'Host 命令与 I2C' },
  { icon: Shield, label: '信息安全', desc: '写保护与安全启动' },
];

const highlights = [
  {
    icon: FileText,
    title: '55+ 详细文档',
    desc: '从快速上手到深度移植，覆盖 EC 固件开发全流程。每个模块都有独立章节，配以架构图和代码示例。',
  },
  {
    icon: GitBranch,
    title: '多平台源码参考',
    desc: '基于芯海多款 Zephyr EC 芯片的完整 BSP 实现。驱动模型与硬件抽象层统一，一套代码适配多个平台，降低维护成本。',
  },
  {
    icon: Gauge,
    title: '性能优化指南',
    desc: '功耗调优、中断延迟优化、内存布局建议——帮助你将固件打磨到量产级别。',
  },
  {
    icon: Sparkles,
    title: '从 ITE 到 Zephyr',
    desc: '完整的迁移指南：对比 ITE IT557x 参考实现与 Zephyr 方案，逐模块说明差异与适配要点。',
  },
  {
    icon: MessageSquare,
    title: '常见问题与调试',
    desc: '看门狗复位、栈溢出、HardFault 分析——收录实际开发中最常遇到的坑及排查方法。',
  },
];

export default function HomePage() {
  return (
    <main className="flex flex-col items-center">
      {/* ================================================================
          Hero — thesis: "Everything you need to build EC firmware"
          ================================================================ */}
      <section className="cyber-hero w-full">
        <CircuitBackground />
        <div className="cyber-hero-bg" />
        <div className="cyber-hero-dots" />

        <h1 className="hero-title">芯海 Zephyr EC 方案</h1>
        <div className="hero-divider" />
        <p className="hero-tagline">
          <Zap className="inline h-4 w-4 -mt-0.5 text-cyan-400" /> 芯海全系 EC 芯片 Zephyr 开发方案 — 一套代码，多平台复用，从裸机到 RTOS 的现代化升级
        </p>

        {/* Search bar */}
        <div className="mt-6 flex justify-center">
          <HeroSearch />
        </div>

        {/* CTA button */}
        <div className="mt-5 flex justify-center px-4 sm:px-0">
          <Link href="/docs/getting-started" className="hero-cta group w-full sm:w-auto justify-center">
            开始构建
            <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        {/* Quick nav pills */}
        <div className="mt-7 flex flex-wrap items-center justify-center gap-2">
          {quickLinks.map(({ icon: Icon, label, href }) => (
            <Link
              key={label}
              href={href}
              className="inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all
                border-purple-200 text-purple-600 hover:border-purple-400 hover:bg-purple-50 hover:text-purple-800
                dark:border-white/10 dark:text-white/70 dark:hover:border-purple-400/50 dark:hover:bg-purple-500/20 dark:hover:text-white"
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </Link>
          ))}
        </div>
      </section>

      {/* ================================================================
          Core Advantages — why Chipsea Zephyr EC
          ================================================================ */}
      <div className="stats-divider" />
      <section className="w-full max-w-5xl px-4 py-10">
        <p className="section-eyebrow text-center">芯海 Zephyr EC 核心优势</p>
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {[
            {
              icon: Zap,
              title: '现代化 RTOS 内核',
              desc: '基于 Zephyr RTOS 3.7 LTS，抢占式多任务调度、微秒级中断响应、内置电源管理框架。告别裸机 while(1) 循环，用线程思维构建复杂 EC 逻辑。',
              stat: 'Zephyr 3.7 LTS',
            },
            {
              icon: Feather,
              title: '极致轻量 · 超低功耗',
              desc: '最小镜像 < 64KB Flash / 8KB RAM。深度睡眠模式下 EC 功耗低至微安级，满足 Intel/AMD 现代笔记本严苛的 S0ix 待机要求。',
              stat: '<64KB Flash',
            },
            {
              icon: Lock,
              title: '芯片级安全可信',
              desc: '安全启动、写保护、固件回滚防护——从芯片上电第一行代码开始构建信任链。CSCE2520 平台将进一步支持 ARM TrustZone + TF-M 可信执行环境。',
              stat: '安全启动 + 写保护',
            },
            {
              icon: TrendingUp,
              title: '量产验证 · 持续迭代',
              desc: '已在芯海多款 EC 芯片上完整验证，所有驱动经过压力测试。13 个功能模块、18 个设备驱动可直接复用，大幅缩短产品上市周期。',
              stat: '13 模块 / 18 驱动',
            },
          ].map(({ icon: Icon, title, desc, stat }, i) => (
            <ScrollReveal key={title} delay={i * 100}>
              <div className="group relative flex flex-col gap-3 overflow-hidden rounded-xl border border-purple-200/60 bg-white/30 backdrop-blur-xl shadow-lg border-white/50 p-6 transition-all hover:border-purple-400 hover:shadow-lg dark:border-purple-500/15 dark:bg-white/[0.02] dark:backdrop-blur-xl dark:border-white/[0.06] dark:hover:border-purple-400/40 dark:hover:bg-white/[0.04]" style={{ borderLeftWidth: 3, borderLeftColor: 'var(--color-fd-primary)' }}>
                <div className="absolute right-4 top-4 rounded-full bg-purple-500/8 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-purple-600 dark:bg-purple-400/10 dark:text-purple-300">
                  {stat}
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10 ring-1 ring-purple-500/20">
                  <Icon className="h-6 w-6 text-purple-500 transition-colors group-hover:text-purple-600 dark:text-purple-400 dark:group-hover:text-cyan-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-fd-foreground">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-fd-muted-foreground">{desc}</p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      <div className="stats-divider" />

      {/* ================================================================
          Why Zephyr — contrast with traditional EC dev
          ================================================================ */}
      <section className="w-full max-w-5xl px-4 py-10">
        <p className="section-eyebrow text-center">为什么选择 Zephyr</p>
        <p className="mt-1 text-center text-sm text-fd-muted-foreground">
          传统 EC 裸机开发 vs 芯海 Zephyr EC 方案 — 不只是换个 RTOS，而是开发范式的升级
        </p>
        <div className="mt-8 overflow-hidden rounded-2xl border border-purple-200/60 dark:border-purple-500/15">
          <div className="grid grid-cols-1 sm:grid-cols-2">
            {/* Traditional Side */}
            <div className="flex flex-col gap-4 bg-red-50/40 p-6 dark:bg-red-950/10">
              <p className="text-sm font-bold uppercase tracking-wider text-red-600 dark:text-red-400">传统裸机 EC 开发</p>
              {[
                '手写寄存器配置，易出错难维护',
                '每颗芯片独立 SDK，代码无法复用',
                '无标准测试框架，靠串口 printf 调试',
                '电源管理靠经验，缺乏框架化支持',
                '升级 RTOS 需重构全部代码',
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <span className="mt-0.5 shrink-0 text-red-400">✕</span>
                  <span className="text-sm text-fd-muted-foreground">{item}</span>
                </div>
              ))}
            </div>
            {/* Zephyr Side */}
            <div className="flex flex-col gap-4 bg-green-50/40 p-6 dark:bg-green-950/10">
              <p className="text-sm font-bold uppercase tracking-wider text-green-600 dark:text-green-400">芯海 Zephyr EC 方案</p>
              {[
                'Device Tree 描述硬件，Kconfig 管理功能',
                '统一 Zephyr 驱动模型，跨平台代码复用',
                'Ztest 单元测试 + Twister CI 自动化',
                'Zephyr PM 框架，细粒度功耗状态管理',
                'Upstream-first 策略，跟随主线持续演进',
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                  <span className="text-sm font-medium text-fd-foreground">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================
          Impact Metrics — quantified benefits
          ================================================================ */}
      <section className="w-full max-w-5xl px-4 pb-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            { value: '60%', label: '开发效率提升', desc: 'Device Tree + Kconfig 替代手写寄存器，新板 bring-up 从数周缩短到数天', icon: RefreshCw },
            { value: '3×', label: '代码复用率', desc: '统一驱动模型让外设驱动跨项目复用，告别每颗芯片重写 I2C/SPI 驱动的历史', icon: GitBranch },
            { value: '0', label: '供应商锁定', desc: '基于 Apache 2.0 开源协议，上游代码由 Linux Foundation 托管，不受单一厂商限制', icon: Lock },
          ].map(({ value, label, desc, icon: Icon }, i) => (
            <ScrollReveal key={label} delay={i * 120}>
              <div className="flex flex-col items-center gap-3 rounded-xl border border-purple-200/60 bg-white/30 backdrop-blur-xl shadow-lg border-white/50 p-6 text-center transition-all hover:border-purple-300 hover:shadow-md dark:border-purple-500/15 dark:bg-white/[0.02] dark:backdrop-blur-xl dark:border-white/[0.06] dark:hover:border-purple-400/30 dark:hover:bg-white/[0.04]">
                <Icon className="h-5 w-5 text-purple-400" />
                <span className="font-mono text-3xl font-extrabold text-purple-600 dark:text-cyan-400">{value}</span>
                <p className="text-sm font-bold text-fd-foreground">{label}</p>
                <p className="text-xs leading-relaxed text-fd-muted-foreground">{desc}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      <div className="stats-divider" />

      {/* ================================================================
          Featured — "Start Here" — the primary action, visually distinct
          ================================================================ */}
      <div className="stats-divider" />
      <section className="w-full max-w-5xl px-4 pt-8 sm:pt-14 pb-6">
        <p className="section-eyebrow">从这里开始</p>
        <ScrollReveal>
          <Link href="/docs/getting-started" className="featured-card group">
            <div className="featured-card-icon">
              <Rocket className="transition-transform group-hover:scale-110" />
            </div>
            <div className="featured-card-content">
              <span className="featured-card-tag mb-1 block">
                <Clock className="h-3 w-3" /> 3 篇指南
              </span>
              <h3>30 分钟从零到固件</h3>
              <p>
                配置工具链、克隆 SDK、完成首次编译、烧录到 EVB — 从空目录到运行 EC 固件所需的一切。
              </p>
            </div>
            <span className="featured-card-cta group-hover:gap-2 transition-all">
              开始上手 <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </Link>
        </ScrollReveal>
      </section>

      {/* ================================================================
          Supported Platforms
          ================================================================ */}
      <section className="w-full max-w-5xl px-4 pb-10">
        <p className="section-eyebrow text-center">支持平台</p>
        <p className="mt-1 text-center text-sm text-fd-muted-foreground">
          统一 Zephyr 驱动模型，一套代码适配芯海全系 EC 芯片
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          {[
            { name: 'CSCE250X', desc: 'Cortex-M33 · 高性能 EC', active: true },
            { name: 'CSCE2010', desc: 'Cortex-M0+ · 轻量 EC' },
            { name: 'CSCE2520', desc: 'Cortex-M33 · 新一代 EC', upcoming: true },
          ].map(({ name, desc, active, upcoming }) => (
            <ScrollReveal key={name} delay={60}>
              <div className={`flex min-h-[100px] flex-col items-center justify-center gap-1 rounded-xl border px-5 py-3 text-center transition-all hover:shadow-md ${
                active
                  ? 'border-white/60 bg-white/40 backdrop-blur-xl shadow-lg dark:border-white/[0.10] dark:bg-white/[0.04]'
                  : 'border-purple-200/60 bg-white/30 backdrop-blur-xl shadow-lg border-white/50 dark:border-purple-500/10 dark:bg-white/[0.02] dark:backdrop-blur-xl dark:border-white/[0.06]'
              }`}>
                <span className={`font-mono text-sm font-bold ${active ? 'text-purple-700 dark:text-purple-300' : 'text-fd-foreground'}`}>
                  {name}
                </span>
                <span className="text-xs text-fd-muted-foreground">{desc}</span>
                {active && (
                  <span className="mt-0.5 rounded-full bg-purple-500/15 px-2 py-0.5 text-[10px] font-semibold text-purple-600 dark:bg-purple-400/15 dark:text-purple-300">
                    当前主力
                  </span>
                )}
                {upcoming && (
                  <span className="mt-0.5 rounded-full bg-cyan-500/10 px-2 py-0.5 text-[10px] font-semibold text-cyan-600 dark:bg-cyan-400/10 dark:text-cyan-300">
                    即将推出
                  </span>
                )}
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* ================================================================
          Explore — bento grid for everything else
          ================================================================ */}
      <section className="w-full max-w-5xl px-4 pb-20 pt-6">
        <p className="section-eyebrow">探索手册</p>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {exploreCards.map(({ cols, icon: Icon, tag, title, desc, href, time }, i) => (
            <ScrollReveal key={title} delay={i * 70}>
              <Link
                href={href}
                className={`cyber-card group flex flex-col gap-3 p-5 ${cols ?? ''}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10 ring-1 ring-purple-500/20">
                    <Icon className="h-4 w-4 text-purple-400 group-hover:text-cyan-400 transition-colors" />
                  </div>
                  <div className="flex items-center gap-2">
                    {time && (
                      <span className="flex items-center gap-1 text-[10px] text-fd-muted-foreground">
                        <Clock className="h-3 w-3" /> {time}
                      </span>
                    )}
                    <span className="rounded-full bg-purple-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-purple-400">
                      {tag}
                    </span>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-bold group-hover:text-purple-400 transition-colors">
                    {title}
                  </h3>
                  <p className="mt-1 text-sm text-fd-muted-foreground leading-relaxed">
                    {desc}
                  </p>
                </div>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-purple-400 group-hover:gap-1.5 transition-all">
                  阅读 <ArrowRight className="h-3 w-3" />
                </span>
              </Link>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* ================================================================
          Tech Stack — show what this manual covers
          ================================================================ */}
      <div className="stats-divider" />
      <section className="w-full max-w-5xl px-4 py-10">
        <p className="section-eyebrow text-center">核心技术栈</p>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {techStack.map(({ icon: Icon, label, desc }) => (
            <ScrollReveal key={label} delay={40}>
              <div className="flex flex-col items-center gap-2 rounded-xl border border-purple-200/60 bg-white/30 backdrop-blur-xl shadow-lg border-white/50 p-4 text-center transition-all hover:border-purple-300 hover:shadow-md dark:border-purple-500/15 dark:bg-white/[0.02] dark:backdrop-blur-xl dark:border-white/[0.06] dark:hover:border-purple-400/30 dark:hover:bg-white/[0.04]">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10 ring-1 ring-purple-500/20">
                  <Icon className="h-5 w-5 text-purple-500 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-fd-foreground">{label}</p>
                  <p className="text-xs text-fd-muted-foreground">{desc}</p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* ================================================================
          Highlights — why this manual
          ================================================================ */}
      <section className="w-full max-w-5xl px-4 pb-20 pt-4">
        <p className="section-eyebrow text-center">手册亮点</p>
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {highlights.map(({ icon: Icon, title, desc }, i) => (
            <ScrollReveal key={title} delay={i * 70}>
              <div className="group flex flex-col gap-3 overflow-hidden rounded-xl border border-purple-200/60 bg-white/30 backdrop-blur-xl shadow-lg border-white/50 pt-5 transition-all hover:border-purple-300 hover:shadow-md dark:border-purple-500/15 dark:bg-white/[0.02] dark:backdrop-blur-xl dark:border-white/[0.06] dark:hover:border-purple-400/30 dark:hover:bg-white/[0.04]">
                <div className="mx-5 flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10 ring-1 ring-purple-500/20">
                  <Icon className="h-5 w-5 text-purple-500 transition-colors group-hover:text-purple-600 dark:text-purple-400 dark:group-hover:text-cyan-400" />
                </div>
                <div className="px-5 pb-5">
                  <h3 className="text-base font-bold text-fd-foreground">{title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-fd-muted-foreground">{desc}</p>
                </div>
                <div className="h-[3px] w-full bg-gradient-to-r from-purple-400 to-cyan-400 opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      <footer className="page-footer w-full">
        版权所有 &copy; {new Date().getFullYear()}{' '}Chipsea. &nbsp;|&nbsp; Powered by Zephyr RTOS &amp; Fumadocs
      </footer>
    </main>
  );
}
