'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { useScrollReveal } from '@/hooks/use-scroll-reveal';

const highlights = [
  { title: '79 页技术文档', desc: '从环境搭建、架构原理到量产部署——覆盖全生命周期。每模块独立成章，配架构图与可运行代码示例。' },
  { title: '三芯片统一平台', desc: 'CSCE250X / CSCE2010 / CSCE2520 共享驱动模型。一套应用代码，编译时自动适配——产能弹性、备货灵活。' },
  { title: '传统 C51 → Zephyr 迁移方案', desc: '完整的逐模块迁移指南：GPIO、电源序列、键盘扫描、电池管理。分阶段策略 + 常见陷阱预警。' },
  { title: '量产级性能与安全', desc: '功耗调优、Flash/RAM 布局优化、MCUboot 安全启动。直接满足企业客户安全审计与量产基线要求。' },
  { title: '全链路调试工具链', desc: 'Shell 交互、Logging 分级、SystemView 追踪、HardFault 根因分析。从 printf 升级到现代调试体系。' },
  { title: 'Windows + Linux 双平台支持', desc: '每行命令均附安全透明说明——下载源、写入路径、影响范围一目了然。消除客户对未知环境的顾虑。' },
];

export function DeliverySection() {
  const { scopeRef } = useScrollReveal({ stagger: 0.08, fromY: 24 });

  return (
    <div className="w-full bg-[#f5f5f7] dark:bg-[#0d0d0f]">
      <div className="mx-auto max-w-4xl px-6 py-28 sm:px-10 sm:py-36">
        <h2 className="text-3xl font-bold tracking-[-0.02em] text-neutral-900 dark:text-white sm:text-4xl lg:text-5xl">
          从文档到量产，我们全程陪你走完
        </h2>
        <p className="mt-4 max-w-xl text-lg leading-relaxed text-neutral-500 dark:text-neutral-400">
          不只是芯片 —— 客户获得的是从文档、工具到量产支持的一站式交付体系
        </p>

        {/* 双列 — 6 项分两栏 */}
        <div ref={scopeRef} className="mt-14 grid grid-cols-1 gap-x-12 gap-y-8 sm:grid-cols-2">
          {highlights.map(({ title, desc }) => (
            <div key={title}>
              <h3 className="text-base font-bold text-neutral-900 dark:text-white">{title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">{desc}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-16 flex justify-center">
          <Link
            href="/docs/getting-started"
            className="inline-flex h-12 items-center gap-2 rounded-full bg-neutral-900 px-8 text-sm font-semibold text-white transition-all duration-300 hover:bg-black hover:scale-[1.03] active:scale-[0.98] dark:bg-white dark:text-black dark:hover:bg-neutral-200"
          >
            开始构建你的 Zephyr EC 方案
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <footer className="w-full border-t border-neutral-200 bg-[#f5f5f7] py-8 text-center text-xs text-neutral-400 dark:border-neutral-800 dark:bg-[#0d0d0f] dark:text-neutral-600">
        版权所有 &copy; {new Date().getFullYear()} Chipsea. &nbsp;|&nbsp; Powered by Zephyr RTOS &amp; Fumadocs
      </footer>
    </div>
  );
}
