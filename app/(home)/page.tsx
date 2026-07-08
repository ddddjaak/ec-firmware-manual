import Link from 'next/link';
import {
  BookOpen, Cable, Terminal,
  Cpu, Layers,
  Zap, Braces, ChevronRight, Blocks,
  Microchip,
  Sparkles, FileText, Gauge, GitBranch, MessageSquare,
  TrendingUp, Lock, Feather,
  Laptop, Tablet, Factory, Globe,
  Download, Settings, Code2, FlaskConical, Package,
} from 'lucide-react';
import { CircuitBackground } from '@/components/circuit-background';
import { ScrollReveal } from '@/components/scroll-reveal';

const quickLinks = [
  { icon: BookOpen, label: '开发指南', href: '/docs/development' },
  { icon: Braces, label: '应用开发', href: '/docs/development/appdev/01_new_feature_module' },
  { icon: Blocks, label: '移植', href: '/docs/porting' },
  { icon: Terminal, label: '命令参考', href: '/docs/reference/01_command_reference' },
];

const highlights = [
  {
    icon: FileText,
    title: '79 页技术文档',
    desc: '从环境搭建、架构原理到量产部署——覆盖全生命周期。每模块独立成章，配 CSS 架构图与可运行代码示例。',
  },
  {
    icon: GitBranch,
    title: '三芯片统一平台',
    desc: 'CSCE250X / CSCE2010 / CSCE2520 共享驱动模型。一套应用代码，编译时自动适配——产能弹性、备货灵活。',
  },
  {
    icon: Sparkles,
    title: '传统 C51 → Zephyr 迁移方案',
    desc: '完整的逐模块迁移指南：GPIO、电源序列、键盘扫描、电池管理。分阶段策略 + 常见陷阱预警，降低切换风险。',
  },
  {
    icon: Gauge,
    title: '量产级性能与安全',
    desc: '功耗调优、Flash/RAM 布局优化、MCUboot 安全启动。直接满足企业客户安全审计与量产基线要求。',
  },
  {
    icon: MessageSquare,
    title: '全链路调试工具链',
    desc: 'Shell 交互、Logging 分级、SystemView 追踪、HardFault 根因分析。从 printf 升级到现代调试体系。',
  },
  {
    icon: BookOpen,
    title: 'Windows + Linux 双平台支持',
    desc: '每行命令均附安全透明说明——下载源、写入路径、影响范围一目了然。消除客户对未知环境的顾虑。',
  },
];

const useCases = [
  {
    icon: Laptop,
    title: '笔记本 EC',
    desc: 'Intel/AMD 平台嵌入式控制器，管理键盘、电池、温度、风扇及系统状态，支持现代待机 S0ix。',
    chips: 'CSCE250X · CSCE2520',
  },
  {
    icon: Globe,
    title: 'Chromebook EC',
    desc: 'Google Chrome OS 兼容 EC 方案，通过严格 CTS 认证，支持深度休眠与即时唤醒。',
    chips: 'CSCE250X',
  },
  {
    icon: Tablet,
    title: '平板 / 二合一',
    desc: '低功耗 EC 固件，管理 Type-C 充电、传感器 Hub 及可拆卸键盘，深度休眠功耗 < 50μA。',
    chips: 'CSCE2010 · CSCE250X',
  },
  {
    icon: Factory,
    title: '工业嵌入式控制器',
    desc: '宽温域 (-40~85°C)、长寿命支持，适用于工业平板、POS 机、医疗终端等严苛环境。',
    chips: 'CSCE2010',
  },
];

const devFlow = [
  { icon: Download, step: '01', title: '环境搭建', desc: '安装 Zephyr SDK、Python 依赖、交叉编译工具链及 J-Link 驱动' },
  { icon: Settings, step: '02', title: '板级适配', desc: '编写 Device Tree、Kconfig 配置，定义引脚复用与功能裁剪' },
  { icon: Code2, step: '03', title: '驱动开发', desc: '基于 Zephyr 驱动模型开发外设驱动，复用芯海 18+ 现有驱动' },
  { icon: FlaskConical, step: '04', title: '功能验证', desc: 'Ztest 单元测试 + Twister 自动化测试 + EVB 实机验证' },
  { icon: Package, step: '05', title: '量产部署', desc: '固件签名、写保护配置、生产烧录流程及 OTA 升级方案' },
];


export default function HomePage() {
  return (
    <main className="flex flex-col items-center">
      {/* ================================================================
          Hero — value proposition for decision makers
          ================================================================ */}
      <section className="cyber-hero w-full">
        <CircuitBackground />
        <div className="cyber-hero-bg" />
        <div className="cyber-hero-dots" />

        <h1 className="hero-title">安全 · 高效 · 自主可控</h1>
        <div className="hero-divider" />
        <p className="hero-tagline">
          芯海 Zephyr EC — 企业级嵌入式控制器方案。从芯片选型到固件量产一站式交付，多款量产机型验证。
        </p>

        {/* CTA button */}
        <div className="mt-5 flex justify-center px-4 sm:px-0">
          <div className="relative">
            <div className="hero-cta-pulse" />
            <Link href="/docs/getting-started" className="hero-cta group w-full sm:w-auto justify-center relative z-10">
              开始 Zephyr！
              <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>

        {/* Quick nav pills */}
        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          {quickLinks.map(({ icon: Icon, label, href }) => (
            <Link
              key={label}
              href={href}
              className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-all
                border-blue-200 text-blue-600 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-800
                dark:border-white/10 dark:text-white/70 dark:hover:border-blue-400/50 dark:hover:bg-blue-500/20 dark:hover:text-white"
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </div>
      </section>

      <div className="stats-divider" />

      {/* ================================================================
          Pain → Solution — full-width contrast band
          ================================================================ */}
      <div className="section-band section-band-contrast">
      <div className="section-band-inner">
      <section>
        <p className="section-eyebrow text-center" style={{fontSize:'1rem', letterSpacing:'0.15em', marginBottom:'0.5rem'}}>传统方式的代价 vs 芯海的解法</p>
        <p className="mt-1 mb-10 text-center text-lg font-medium text-fd-muted-foreground max-w-xl mx-auto">
          换 EC 芯片不应意味着重写整个固件。我们让迁移变成<strong className="text-fd-foreground">配置</strong>，而非重构。
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {/* Pain Points */}
          <div className="pain-card flex flex-col gap-5">
            <p className="text-xl font-black uppercase tracking-widest text-red-500 dark:text-red-400" style={{fontSize:'0.8rem', letterSpacing:'0.2em'}}>
              ✕ 你正在承担的隐性成本
            </p>
            {[
              { pain: '换芯片 = 重写固件', cost: '项目延期、预算超支' },
              { pain: '多产品线独立代码分支', cost: '同一个 bug 修 N 遍' },
              { pain: '调试靠串口 printf', cost: '问题定位依赖最熟悉代码的那个人' },
              { pain: '工程师离职 = 代码变黑盒', cost: '团队陷入被动，无人敢改' },
              { pain: '裸机升级 RTOS', cost: '推倒重来，技术债越积越重' },
            ].map(({ pain, cost }, i) => (
              <div key={i} className="flex flex-col gap-0.5">
                <span className="text-base font-bold text-fd-foreground">{pain}</span>
                <span className="text-sm text-red-500/70 dark:text-red-400/60">→ {cost}</span>
              </div>
            ))}
          </div>
          {/* Solution */}
          <div className="solution-card flex flex-col gap-5">
            <p className="text-xl font-black uppercase tracking-widest text-green-500 dark:text-green-400" style={{fontSize:'0.8rem', letterSpacing:'0.2em'}}>
              ✓ 芯海 Zephyr EC 替你消除这些风险
            </p>
            {[
              { fix: '换芯片 = 改 Device Tree 配置', result: '应用代码零修改，3 天出原型' },
              { fix: '一套驱动覆盖全产品线', result: '修一次 bug，全系产品受益' },
              { fix: '自动化测试 + CI 门禁', result: '每次提交自动验证，质量可度量' },
              { fix: '代码结构标准化', result: '新成员加入即能定位问题，不依赖个人' },
              { fix: 'Zephyr LTS 社区维护', result: '技术债可控，跟随主线持续演进' },
            ].map(({ fix, result }, i) => (
              <div key={i} className="flex flex-col gap-0.5">
                <span className="text-base font-bold text-fd-foreground">{fix}</span>
                <span className="text-sm text-green-600/70 dark:text-green-400/60">→ {result}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
      </div>
      </div>

      {/* ================================================================
          Core Advantages — alternating band
          ================================================================ */}
      <div className="section-band section-band-alt">
      <div className="section-band-inner">
      <section>
        <p className="section-eyebrow text-center">芯海 Zephyr EC 核心优势</p>
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: Zap,
              stat: '3 天\n出原型',
              title: '架构现代化',
              desc: 'Zephyr RTOS + Device Tree + 统一驱动模型。新平台 bring-up 从数周压缩到 3 天，功能模块开箱即用。',
            },
            {
              icon: Feather,
              stat: '三芯片\n阶梯覆盖',
              title: '按需选型，成本最优',
              desc: 'CSCE2010 轻量级 / CSCE250X 高性能 / CSCE2520 安全旗舰。Flash 256-512KB，不用为不需要的功能买单。',
            },
            {
              icon: Lock,
              stat: '芯片级\n安全基线',
              title: '安全合规就绪',
              desc: '内置 MCUboot 安全启动与写保护，上电即建信任链。满足企业客户安全审计要求，CSCE2520 集成 Arm TrustZone。',
            },
            {
              icon: TrendingUp,
              stat: '多机型\n量产验证',
              title: '非实验室原型，产线就绪',
              desc: '笔记本、平板、工控机多品类已通过量产验证。驱动经 24h 压力测试，方案成熟可立即投入项目。',
            },
          ].map(({ icon: Icon, stat, title, desc }, i) => (
            <ScrollReveal key={title} delay={i * 100}>
              <div className="card flex h-full flex-col overflow-hidden">
                <div className="card-accent-bar" />
                <div className="flex flex-1 flex-col gap-4 p-5">
                  {/* Icon + Stat row */}
                  <div className="flex items-start justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 ring-1 ring-blue-500/20">
                      <Icon className="h-5 w-5 text-blue-500 dark:text-blue-400" />
                    </div>
                    <span className="text-right font-mono text-xs font-bold leading-tight text-blue-500/70 dark:text-blue-400/50 whitespace-pre">
                      {stat}
                    </span>
                  </div>
                  {/* Title + Description */}
                  <div className="flex flex-1 flex-col">
                    <h3 className="text-xl font-extrabold text-fd-foreground">{title}</h3>
                    <p className="mt-2 text-base leading-relaxed text-fd-muted-foreground">{desc}</p>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>
      </div>
      </div>

      {/* ================================================================
          Impact Metrics — quantified benefits
          ================================================================ */}
      <div className="section-band">
      <div className="section-band-inner">
      <section>
        <p className="section-eyebrow text-center">量化收益</p>
        <p className="mt-1 mb-8 text-center text-base text-fd-muted-foreground">
          不只帮研发提效——更让产品总监和决策者看到可衡量的商业回报
        </p>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          {[
            { value: '3 天', label: '上市周期', desc: '新平台 bring-up 从数周压缩到 3 天出原型。硬件就绪即可上固件，产品迭代不再卡在 EC 环节——抢占市场窗口期，比对手快一步。', icon: TrendingUp, color: 'text-amber-500 dark:text-amber-400', bg: 'bg-amber-500/10 ring-amber-500/20' },
            { value: '1 套代码', label: '全产品线复用', desc: '一套驱动代码覆盖笔记本、平板、工控机所有产品线。新增 SKU 只需改设备树，不需为新项目重新组建 EC 团队或外包——研发投入一次，全系产品受益。', icon: Layers, color: 'text-violet-500 dark:text-violet-400', bg: 'bg-violet-500/10 ring-violet-500/20' },
            { value: '0', label: '供应链锁定风险', desc: 'Apache 2.0 开源协议，上游代码由 Linux Foundation 托管。你的固件资产不受单一芯片厂商绑定——即使切换供应商，代码和工具链完全自主可控。', icon: Lock, color: 'text-emerald-500 dark:text-emerald-400', bg: 'bg-emerald-500/10 ring-emerald-500/20' },
          ].map(({ value, label, desc, icon: Icon, color, bg }, i) => (
            <ScrollReveal key={label} delay={i * 120}>
              <div className="card flex h-full flex-col items-center gap-3 p-6 text-center">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${bg}`}>
                  <Icon className={`h-5 w-5 ${color}`} />
                </div>
                <span className={`font-mono text-5xl font-black ${color}`} style={{lineHeight:1.1}}>{value}</span>
                <p className="text-base font-extrabold text-fd-foreground">{label}</p>
                <p className="flex-1 text-sm leading-relaxed text-fd-muted-foreground">{desc}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>
      </div>
      </div>

      {/* ================================================================
          Supported Platforms — full showcase
          ================================================================ */}
      <div className="section-band">
      <div className="section-band-inner">
      <section>
        <p className="section-eyebrow text-center">支持平台</p>
        <p className="mt-1 text-center text-base text-fd-muted-foreground">
          统一 Zephyr 驱动模型，一套代码适配芯海全系 EC 芯片
        </p>

        {/* Unified driver model badge */}
        <div className="mt-5 flex justify-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-300/60 bg-blue-50/60 px-4 py-1.5 text-sm font-semibold text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300">
            <Cpu className="h-4 w-4" />
            跨平台统一驱动 API — 应用代码零修改即可迁移芯片
          </div>
        </div>

        {/* Chip cards — scroll-snap carousel on mobile, grid on desktop */}
        <div className="mt-8 scroll-carousel">
          {[
            {
              name: 'CSCE250X',
              core: 'Cortex-M33',
              freq: '120 MHz',
              flash: '512 KB',
              sram: '256+ KB SRAM',
              features: ['USB PD 3.1', 'eSPI', 'PECI', 'KSCAN', 'I²C×8', 'SPI×4'],
              use: '高性能笔记本 · Chromebook',
              tag: '当前主力',
              tagColor: 'bg-blue-500/15 text-blue-600 dark:bg-blue-400/15 dark:text-blue-300',
              borderAccent: 'border-blue-400/30 dark:border-blue-500/25',
              iconColor: 'text-blue-500 dark:text-blue-400',
              bgAccent: 'from-blue-500/8 to-cyan-400/4',
            },
            {
              name: 'CSCE2010',
              core: 'Cortex-M0+',
              freq: '24 MHz',
              flash: '256 KB',
              sram: '64 KB SRAM',
              features: ['I²C×4', 'SPI×2', 'UART×3', 'ADC×8', 'PWM×6'],
              use: '轻量 EC · 工业嵌入式 · 平板',
              tag: '低功耗优选',
              tagColor: 'bg-emerald-500/15 text-emerald-600 dark:bg-emerald-400/15 dark:text-emerald-300',
              borderAccent: 'border-emerald-400/30 dark:border-emerald-500/25',
              iconColor: 'text-emerald-500 dark:text-emerald-400',
              bgAccent: 'from-emerald-500/8 to-green-400/4',
            },
            {
              name: 'CSCE2520',
              core: 'Cortex-M33',
              freq: '120 MHz',
              flash: '512 KB',
              sram: '256+ KB SRAM',
              features: ['USB PD 3.1', 'eSPI', 'PECI', 'KSCAN', 'TrustZone', 'TF-M'],
              use: '新一代安全 EC · 旗舰笔记本',
              tag: '即将推出',
              tagColor: 'bg-purple-500/15 text-purple-600 dark:bg-purple-400/15 dark:text-purple-300',
              borderAccent: 'border-purple-400/30 dark:border-purple-500/25',
              iconColor: 'text-purple-500 dark:text-purple-400',
              bgAccent: 'from-purple-500/8 to-pink-400/4',
            },
          ].map(({ name, core, freq, flash, sram, features, use, tag, tagColor, borderAccent, iconColor, bgAccent }, i) => (
            <ScrollReveal key={name} delay={i * 100}>
              <div className="card group relative flex h-full flex-col overflow-hidden">
                <div className={`absolute inset-0 bg-gradient-to-br ${bgAccent} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                <div className="relative flex flex-col gap-4 p-6">
                  {/* Header: chip name + badge */}
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <Microchip className={`h-5 w-5 ${iconColor}`} />
                        <h3 className="font-mono text-xl font-extrabold text-fd-foreground">{name}</h3>
                      </div>
                      <p className="mt-1 text-sm text-fd-muted-foreground">{core} · {freq}</p>
                    </div>
                    <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${tagColor}`}>
                      {tag}
                    </span>
                  </div>

                  {/* Spec bar: Flash + RAM */}
                  <div className="flex gap-3">
                    <div className="flex-1 rounded-lg bg-blue-500/5 px-3 py-2 text-center dark:bg-white/[0.03]">
                      <p className="text-[10px] uppercase tracking-wider text-fd-muted-foreground">Flash</p>
                      <p className="font-mono text-sm font-bold text-fd-foreground">{flash}</p>
                    </div>
                    <div className="flex-1 rounded-lg bg-blue-500/5 px-3 py-2 text-center dark:bg-white/[0.03]">
                      <p className="text-[10px] uppercase tracking-wider text-fd-muted-foreground">SRAM</p>
                      <p className="font-mono text-sm font-bold text-fd-foreground">{sram}</p>
                    </div>
                  </div>

                  {/* Feature chips */}
                  <div>
                    <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-fd-muted-foreground">关键外设</p>
                    <div className="flex flex-wrap gap-1.5">
                      {features.map(f => (
                        <span key={f} className="rounded-md border border-blue-200/40 bg-blue-500/5 px-2 py-0.5 text-xs font-medium text-fd-foreground dark:border-blue-500/15 dark:bg-white/[0.04]">
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Use case */}
                  <div className="flex items-center gap-2 rounded-lg bg-blue-500/5 px-3 py-2 dark:bg-white/[0.03]">
                    <Laptop className="h-4 w-4 shrink-0 text-fd-muted-foreground" />
                    <span className="text-xs text-fd-muted-foreground">{use}</span>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>

        {/* Cross-platform code reuse highlight */}
        <div className="mt-8 overflow-hidden rounded-2xl border border-neutral-200 bg-gradient-to-r from-blue-50 to-cyan-50 p-6 dark:border-neutral-800 dark:from-blue-950/20 dark:to-cyan-950/20">
          <div className="flex flex-col items-center gap-3 text-center sm:flex-row sm:text-left">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-500/15 ring-1 ring-blue-500/25">
              <GitBranch className="h-6 w-6 text-blue-500 dark:text-blue-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-base font-extrabold text-fd-foreground">一套代码，三款芯片</h3>
              <p className="mt-1 text-sm leading-relaxed text-fd-muted-foreground">
                芯海全系 EC 芯片共享同一套 Zephyr 驱动模型和 HAL 抽象层。应用层代码（电源管理、热管理、PD 协议栈等 15 个模块）<strong className="text-fd-foreground">无需任何修改</strong>即可在 CSCE250X、CSCE2010、CSCE2520 之间迁移。
                芯片差异仅在 Device Tree 和 Kconfig 中配置，由 Zephyr 驱动框架在编译时自动适配。
              </p>
            </div>
          </div>
        </div>
      </section>
      </div>
      </div>

      {/* ================================================================
          Use Cases — alternating band
          ================================================================ */}
      <div className="section-band section-band-alt">
      <div className="section-band-inner">
      <section>
        <p className="section-eyebrow text-center">典型应用场景</p>
        <p className="mt-1 text-center text-sm text-fd-muted-foreground">
          从消费电子到工业嵌入式，芯海 Zephyr EC 覆盖全场景需求
        </p>
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
          {useCases.map(({ icon: Icon, title, desc, chips }, i) => (
            <ScrollReveal key={title} delay={i * 80}>
              <div className="card group flex h-full gap-4 p-5">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 ring-1 ring-blue-500/20">
                  <Icon className="h-6 w-6 text-blue-500 transition-colors group-hover:text-blue-600 dark:text-blue-400 dark:group-hover:text-cyan-400" />
                </div>
                <div className="flex flex-1 flex-col">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-fd-foreground">{title}</h3>
                    <span className="rounded-full bg-blue-500/8 px-2 py-0.5 text-[10px] font-medium text-blue-500 dark:text-blue-400">{chips}</span>
                  </div>
                  <p className="mt-1.5 text-sm leading-relaxed text-fd-muted-foreground">{desc}</p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>
      </div>
      </div>

      {/* ================================================================
          Dev Flow — alternating band
          ================================================================ */}
      <div className="section-band section-band-alt">
      <div className="section-band-inner">
      <section>
        <p className="section-eyebrow text-center">开发全流程</p>
        <p className="mt-1 text-center text-sm text-fd-muted-foreground">
          从环境搭建到量产部署，芯海 Zephyr EC 开发的完整流水线
        </p>
        <div className="mt-8 flex flex-col gap-0 sm:flex-row sm:gap-0">
          {devFlow.map(({ icon: Icon, step, title, desc }, i) => (
            <ScrollReveal key={step} delay={i * 80}>
              <div className="group relative flex flex-1 flex-col items-center gap-3 px-3 py-5 text-center">
                {/* Connector line between steps */}
                {i < devFlow.length - 1 && (
                  <div className="absolute left-[60%] top-10 hidden h-0.5 w-full bg-gradient-to-r from-blue-300 to-blue-100 sm:block dark:from-blue-500/40 dark:to-blue-500/10" />
                )}
                {/* Step number badge */}
                <span className="relative z-10 inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-xs font-bold text-white shadow-md shadow-blue-500/25">
                  {step}
                </span>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 ring-1 ring-blue-500/20">
                  <Icon className="h-5 w-5 text-blue-500 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-fd-foreground">{title}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-fd-muted-foreground">{desc}</p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>
      </div>
      </div>

      {/* ================================================================
          Delivery — what you get with Chipsea
          ================================================================ */}
      <div className="section-band section-band-alt">
      <div className="section-band-inner">
      <section>
        <p className="section-eyebrow text-center">交付能力</p>
        <p className="mt-1 mb-8 text-center text-base text-fd-muted-foreground">
          不只是芯片 —— 客户获得的是从文档、工具到量产支持的一站式交付体系
        </p>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {highlights.map(({ icon: Icon, title, desc }, i) => (
            <ScrollReveal key={title} delay={i * 70}>
              <div className="card group flex h-full flex-col overflow-hidden pt-5">
                <div className="mx-5 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 ring-1 ring-blue-500/20">
                  <Icon className="h-5 w-5 text-blue-500 dark:text-blue-400" />
                </div>
                <div className="flex flex-1 flex-col px-5 pb-5">
                  <h3 className="text-base font-bold text-fd-foreground">{title}</h3>
                  <p className="mt-1.5 flex-1 text-sm leading-relaxed text-fd-muted-foreground">{desc}</p>
                </div>
                <div className="mt-auto h-[3px] w-full shrink-0 bg-gradient-to-r from-blue-400 to-cyan-400 opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>
      </div>
      </div>

      <footer className="page-footer w-full">
        版权所有 &copy; {new Date().getFullYear()}{' '}Chipsea. &nbsp;|&nbsp; Powered by Zephyr RTOS &amp; Fumadocs
      </footer>
    </main>
  );
}
