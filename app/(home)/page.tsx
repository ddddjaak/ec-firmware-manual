import Link from 'next/link';
import {
  Rocket, BookOpen, Cable, Terminal,
  Cpu, Bug, Shield, Layers,
  ArrowRight, Clock, Zap, Braces, ChevronRight, Blocks,
} from 'lucide-react';
import { CircuitBackground } from '@/components/circuit-background';
import { ScrollReveal } from '@/components/scroll-reveal';
import { HeroSearch } from '@/components/hero-search';

const exploreCards = [
  {
    cols: 'sm:col-span-2',
    icon: Layers,
    tag: 'Architecture',
    title: 'Four-Layer Design',
    desc: 'Application → Services → Drivers → Hardware. Understand how each layer abstracts the one below it.',
    href: '/docs/development/architecture/01_layered_architecture',
  },
  {
    icon: Cpu,
    tag: 'Modules',
    title: '10 Subsystems',
    desc: 'Power sequencing, keyboard scan, battery charging, thermal control, USB PD — each documented in depth.',
    href: '/docs/development/modules/01_system_infrastructure',
  },
  {
    icon: Cable,
    tag: 'Porting',
    title: 'BSP Creation',
    desc: 'Board support from scratch — pinmux, device tree, Kconfig, and boot flow for new hardware.',
    href: '/docs/porting/01_porting_guide',
  },
  {
    icon: Terminal,
    tag: 'Reference',
    title: 'Command Cheatsheet',
    desc: 'West, CMake, Git, and debugging commands at a glance.',
    href: '/docs/reference/01_command_reference',
  },
  {
    icon: Bug,
    tag: 'Debug',
    title: 'Crash Analysis & FAQ',
    desc: 'Fatal errors, watchdog resets, stack overflows, and common pitfalls.',
    href: '/docs/development/debug/01_logging_and_debug',
  },
  {
    cols: 'sm:col-span-3',
    icon: Shield,
    tag: 'Production',
    title: 'Best Practices & Optimization',
    desc: 'Coding standards, power budget tuning, security hardening, and customer integration workflows for shipping production firmware.',
    href: '/docs/best-practices',
    time: '5-part guide',
  },
];

const quickLinks = [
  { icon: BookOpen, label: 'Dev Guide', href: '/docs/development' },
  { icon: Braces, label: 'App Dev', href: '/docs/development/appdev/01_new_feature_module' },
  { icon: Blocks, label: 'Porting', href: '/docs/porting' },
  { icon: Terminal, label: 'Commands', href: '/docs/reference/01_command_reference' },
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

        <span className="hero-chip-label">CSCE250X · Cortex-M33 · Zephyr 3.7.0</span>
        <h1 className="hero-title">Chipsea Zephyr EC Manual</h1>
        <div className="hero-divider" />
        <p className="hero-tagline">
          <Zap className="inline h-4 w-4 -mt-0.5 text-cyan-400" /> Embedded Controller Firmware Development Guide
        </p>

        {/* Search bar */}
        <div className="mt-6 flex justify-center">
          <HeroSearch />
        </div>

        {/* CTA button */}
        <div className="mt-5 flex justify-center px-4 sm:px-0">
          <Link href="/docs/getting-started" className="hero-cta group w-full sm:w-auto justify-center">
            Start Building
            <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        {/* Quick nav pills */}
        <div className="mt-7 flex flex-wrap items-center justify-center gap-2">
          {quickLinks.map(({ icon: Icon, label, href }) => (
            <Link
              key={label}
              href={href}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/10 px-3.5 py-1.5 text-xs font-medium text-white/70 transition-all hover:border-purple-400/50 hover:bg-purple-500/20 hover:text-white"
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </Link>
          ))}
        </div>
      </section>

      {/* ================================================================
          Stats Bar — encodes real documentation scope
          ================================================================ */}
      <div className="stats-divider" />
      <section className="stats-bar w-full max-w-5xl px-4">
        {[
          { value: '53', label: 'Documentation Pages' },
          { value: '6', label: 'Major Sections' },
          { value: '10', label: 'Module Guides' },
          { value: '8', label: 'Porting Guides' },
        ].map(({ value, label }) => (
          <div key={label} className="stat-item">
            <span className="stat-value">{value}</span>
            <span className="stat-label">{label}</span>
          </div>
        ))}
      </section>
      <div className="stats-divider" />

      {/* ================================================================
          Featured — "Start Here" — the primary action, visually distinct
          ================================================================ */}
      <section className="w-full max-w-5xl px-4 pt-8 sm:pt-14 pb-6">
        <p className="section-eyebrow">Start Here</p>
        <ScrollReveal>
          <Link href="/docs/getting-started" className="featured-card group">
            <div className="featured-card-icon">
              <Rocket className="transition-transform group-hover:scale-110" />
            </div>
            <div className="featured-card-content">
              <span className="featured-card-tag mb-1 block">
                <Clock className="h-3 w-3" /> 3-part guide
              </span>
              <h3>From Zero to Firmware in 30 Minutes</h3>
              <p>
                Set up your toolchain, clone the SDK, run your first build, and flash to the EVB —
                everything you need to go from an empty directory to a running EC binary.
              </p>
            </div>
            <span className="featured-card-cta group-hover:gap-2 transition-all">
              Get Started <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </Link>
        </ScrollReveal>
      </section>

      {/* ================================================================
          Explore — bento grid for everything else
          ================================================================ */}
      <section className="w-full max-w-5xl px-4 pb-20 pt-6">
        <p className="section-eyebrow">Explore the Manual</p>

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
                  Read <ArrowRight className="h-3 w-3" />
                </span>
              </Link>
            </ScrollReveal>
          ))}
        </div>
      </section>

      <footer className="page-footer w-full">
        Copyright &copy; {new Date().getFullYear()} Chipsea. All rights reserved.
      </footer>
    </main>
  );
}
