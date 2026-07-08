'use client';

import { useScrollReveal } from '@/hooks/use-scroll-reveal';

const useCases = [
  { title: '笔记本 EC', desc: 'Intel/AMD 平台嵌入式控制器，管理键盘、电池、温度、风扇及系统状态，支持现代待机 S0ix。', chips: 'CSCE250X · CSCE2520' },
  { title: 'Chromebook EC', desc: 'Google Chrome OS 兼容 EC 方案，通过严格 CTS 认证，支持深度休眠与即时唤醒。', chips: 'CSCE250X' },
  { title: '平板 / 二合一', desc: '低功耗 EC 固件，管理 Type-C 充电、传感器 Hub 及可拆卸键盘，深度休眠功耗 &lt; 50μA。', chips: 'CSCE2010 · CSCE250X' },
  { title: '工业嵌入式控制器', desc: '宽温域 (-40~85°C)、长寿命支持，适用于工业平板、POS 机、医疗终端等严苛环境。', chips: 'CSCE2010' },
];

export function UseCasesSection() {
  const { scopeRef } = useScrollReveal({ stagger: 0.1, fromY: 24 });

  return (
    <div className="w-full bg-[#f5f5f7] dark:bg-[#0d0d0f]">
      <div className="mx-auto max-w-4xl px-6 py-28 sm:px-10 sm:py-36">
        <h2 className="text-3xl font-bold tracking-[-0.02em] text-neutral-900 dark:text-white sm:text-4xl lg:text-5xl">
          无论你做什么产品，我们都有答案
        </h2>
        <p className="mt-4 max-w-xl text-lg leading-relaxed text-neutral-500 dark:text-neutral-400">
          从消费电子到工业嵌入式，芯海 Zephyr EC 覆盖全场景需求
        </p>

        <div ref={scopeRef} className="mt-14 grid grid-cols-1 gap-8 sm:grid-cols-2 sm:gap-x-12 sm:gap-y-10">
          {useCases.map(({ title, desc, chips }) => (
            <div key={title}>
              <div className="flex items-baseline gap-3">
                <h3 className="text-xl font-bold text-neutral-900 dark:text-white">{title}</h3>
                <span className="shrink-0 text-[0.75rem] text-neutral-400 dark:text-neutral-500">{chips}</span>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
