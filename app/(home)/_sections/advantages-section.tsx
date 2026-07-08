'use client';

import { useScrollReveal } from '@/hooks/use-scroll-reveal';

const advantages = [
  { title: '架构现代化', desc: 'Zephyr RTOS + Device Tree + 统一驱动模型。新平台 bring-up 从数周压缩到 3 天，功能模块开箱即用。' },
  { title: '按需选型，成本最优', desc: 'CSCE2010 轻量级 / CSCE250X 高性能 / CSCE2520 安全旗舰。Flash 256–512KB，不为不需要的功能买单。' },
  { title: '安全合规就绪', desc: '内置 MCUboot 安全启动与写保护，上电即建信任链。CSCE2520 集成 Arm TrustZone，满足企业客户安全审计要求。' },
  { title: '量产验证，产线就绪', desc: '笔记本、平板、工控机多品类已通过量产验证。驱动经 24h 压力测试，方案成熟可立即投入项目。' },
];

export function AdvantagesSection() {
  const { scopeRef } = useScrollReveal({ stagger: 0.12, fromY: 32 });

  return (
    /* accent band — 亮色: 淡蓝灰 / 暗色: 深黑 */
    <div className="relative w-full overflow-hidden bg-white dark:bg-[#050508]">
      {/* 光晕 — 亮色下几乎不可见，暗色下可见 */}
      <div className="pointer-events-none absolute -right-[20%] -top-[30%] h-[60%] w-[60%] rounded-full bg-[radial-gradient(circle,rgba(99,102,241,0.02)_0%,transparent_70%)] dark:bg-[radial-gradient(circle,rgba(99,102,241,0.08)_0%,transparent_70%)]" aria-hidden="true" />
      <div className="relative mx-auto max-w-4xl px-6 py-20 sm:px-10 sm:py-24">
        <h2 className="text-4xl font-bold tracking-[-0.03em] text-neutral-800 dark:text-white sm:text-5xl lg:text-6xl">
          选芯海，你得到的远不止一颗芯片
        </h2>

        <div ref={scopeRef} className="mt-12 flex flex-col gap-6">
          {advantages.map(({ title, desc }) => (
            <div key={title}>
              <h3 className="text-xl font-semibold text-neutral-700 dark:text-neutral-200 sm:text-2xl">
                {title}
              </h3>
              <p className="mt-1.5 max-w-lg text-sm leading-relaxed text-neutral-500 dark:text-neutral-400 sm:text-base">
                {desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
