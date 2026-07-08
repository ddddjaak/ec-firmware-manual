'use client';

import { useScrollReveal } from '@/hooks/use-scroll-reveal';
import { HeroSvgChip } from '@/components/hero-svg-chip';

const chips = [
  { name: 'CSCE250X', core: 'Cortex-M33', freq: '120 MHz', flash: '512 KB', sram: '256+ KB', features: 'USB PD 3.1 · eSPI · PECI · KSCAN · I²C×8 · SPI×4', use: '高性能笔记本 · Chromebook', tag: '当前主力' },
  { name: 'CSCE2010', core: 'Cortex-M0+', freq: '24 MHz', flash: '256 KB', sram: '64 KB', features: 'I²C×4 · SPI×2 · UART×3 · ADC×8 · PWM×6', use: '轻量 EC · 工业嵌入式 · 平板', tag: '低功耗优选' },
  { name: 'CSCE2520', core: 'Cortex-M33', freq: '120 MHz', flash: '512 KB', sram: '256+ KB', features: 'USB PD 3.1 · eSPI · PECI · KSCAN · TrustZone · TF-M', use: '新一代安全 EC · 旗舰笔记本', tag: '即将推出' },
];

export function PlatformsSection() {
  const { scopeRef } = useScrollReveal({ stagger: 0.12, fromY: 32 });

  return (
    <div className="w-full bg-white dark:bg-[#0a0a0b]">
      <div className="mx-auto max-w-6xl px-6 py-28 sm:px-8 sm:py-36">
        <h2 className="text-3xl font-bold tracking-[-0.02em] text-neutral-900 dark:text-white sm:text-4xl lg:text-5xl">
          一套代码，适配所有产品线
        </h2>
        <p className="mt-4 max-w-xl text-lg leading-relaxed text-neutral-500 dark:text-neutral-400">
          统一 Zephyr 驱动模型，一套代码适配芯海全系 EC 芯片
        </p>

        {/* 三列芯片卡片 — Google 风格：小圆角 + 微弱阴影 */}
        <div ref={scopeRef} className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {chips.map(({ name, core, freq, flash, sram, features, use, tag }) => (
            <div key={name} className="flex flex-col gap-3 rounded-lg border border-neutral-200/60 bg-white p-5 shadow-sm dark:border-neutral-800/60 dark:bg-[#111113] dark:shadow-none">
              <p className="font-mono text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">{name}</p>
              <div className="space-y-1">
                <p className="text-sm text-neutral-500 dark:text-neutral-400">{core} · {freq}</p>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">Flash {flash} / SRAM {sram}</p>
              </div>
              <p className="text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">{features}</p>
              <div className="mt-auto flex items-center gap-2 pt-2">
                <span className="text-sm text-neutral-400 dark:text-neutral-500">{use}</span>
                <span className="shrink-0 rounded-full border border-neutral-200 px-2.5 py-0.5 text-xs font-medium text-neutral-500 dark:border-neutral-700 dark:text-neutral-400">{tag}</span>
              </div>
            </div>
          ))}
        </div>

        {/* 跨平台 + SVG 插图 */}
        <div className="mt-16 grid grid-cols-1 items-center gap-10 border-t border-neutral-200 pt-12 lg:grid-cols-3 lg:gap-12 dark:border-neutral-800">
          <div className="lg:col-span-2">
            <p className="text-xl font-bold text-neutral-900 dark:text-white">一套代码，三款芯片</p>
            <p className="mt-3 max-w-2xl text-base leading-relaxed text-neutral-500 dark:text-neutral-400">
              芯海全系 EC 芯片共享同一套 Zephyr 驱动模型和 HAL 抽象层。应用层代码
              <strong className="font-semibold text-neutral-700 dark:text-neutral-300">无需任何修改</strong>
              即可在 CSCE250X、CSCE2010、CSCE2520 之间迁移。芯片差异仅在 Device Tree 和 Kconfig 中配置。
            </p>
          </div>
          <div className="flex justify-center text-neutral-300/60 dark:text-neutral-400/35 lg:justify-end">
            <div className="w-56 sm:w-64">
              <HeroSvgChip />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
