'use client';

import { useRef } from 'react';
import { gsap, ScrollTrigger, useGSAP } from '@/lib/gsap';
import { useScrollReveal } from '@/hooks/use-scroll-reveal';
import { DotPattern } from '@/components/dot-pattern';

const metrics = [
  { value: 3, label: '天出原型', desc: '硬件就绪即可上固件，数周变 3 天' },
  { value: 1, label: '套代码', desc: '笔记本、平板、工控机共享同一驱动模型' },
  { value: 24, label: 'h 压力测试', desc: '全部驱动通过不间断压力验证，零故障' },
  { value: 0, label: '锁定风险', desc: 'Apache 2.0 开源，不受厂商绑定' },
];

export function MetricsSection() {
  const { scopeRef } = useScrollReveal({ stagger: 0.1, fromY: 32 });

  return (
    <div className="relative w-full bg-[#f5f5f7] dark:bg-[#0d0d0f]">
      <DotPattern />
      <div className="relative mx-auto max-w-5xl px-6 py-24 sm:px-10 sm:py-32">
        <h2 className="text-3xl font-bold tracking-[-0.02em] text-neutral-900 dark:text-white sm:text-4xl lg:text-5xl">
          让数据替你决策
        </h2>

        <div ref={scopeRef} className="mt-14 grid grid-cols-2 gap-x-6 gap-y-12 sm:grid-cols-4 sm:gap-8">
          {metrics.map(({ value, label, desc }, i) => (
            <MetricItem key={label} value={value} label={label} desc={desc} index={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

function MetricItem({
  value, label, desc, index,
}: { value: number; label: string; desc: string; index: number }) {
  const counterRef = useRef<HTMLSpanElement>(null);
  const hasCounted = useRef(false);

  useGSAP(() => {
    const el = counterRef.current;
    if (!el) return;

    ScrollTrigger.create({
      trigger: el,
      start: 'top 88%',
      onEnter: () => {
        if (hasCounted.current) return;
        hasCounted.current = true;
        gsap.fromTo(el, { innerText: 0 }, {
          innerText: value,
          duration: 1.5 + index * 0.1,
          ease: 'power2.out',
          snap: { innerText: 1 },
          delay: 0.15,
        });
      },
    });
  }, []);

  return (
    <div className="flex flex-col items-center gap-2 text-center sm:items-start sm:text-left">
      <div className="flex items-baseline gap-0.5">
        <span
          ref={counterRef}
          className="font-mono text-5xl font-black tracking-tight text-neutral-900 dark:text-white sm:text-6xl lg:text-7xl"
          style={{ lineHeight: 1 }}
        >
          {value}
        </span>
        <span className="font-mono text-lg font-bold text-neutral-400 dark:text-neutral-500 sm:text-xl" style={{ lineHeight: 1 }}>
          {label}
        </span>
      </div>
      <p className="text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
        {desc}
      </p>
    </div>
  );
}
