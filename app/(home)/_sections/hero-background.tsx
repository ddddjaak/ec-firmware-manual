'use client';

import { useRef } from 'react';
import { gsap, useGSAP } from '@/lib/gsap';

/**
 * Apple 风格 Hero 动画背景
 * 模糊渐变光球缓慢漂移/呼吸 — 支持亮色/暗色双模式
 */
export function HeroBackground() {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const orbs = ref.current?.querySelectorAll<HTMLDivElement>('.hero-orb');
      if (!orbs || orbs.length === 0) return;

      orbs.forEach((orb, i) => {
        const direction = i % 2 === 0 ? 1 : -1;
        gsap.to(orb, {
          x: `${direction * 4}%`,
          y: `${(i - 1) * 6}%`,
          scale: 0.95 + Math.random() * 0.1,
          duration: 10 + i * 4,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        });
      });
    },
    { scope: ref },
  );

  return (
    <div
      ref={ref}
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden="true"
    >
      {/* 顶部偏右 — 暖色微光 (亮色: 淡紫, 暗色: 深紫) */}
      <div className="hero-orb absolute -top-[10%] right-[5%] h-[30vmax] w-[30vmax] rounded-full blur-[100px] bg-[radial-gradient(circle,rgba(160,150,220,0.10)_0%,transparent_70%)] dark:bg-[radial-gradient(circle,rgba(120,100,160,0.18)_0%,transparent_70%)]" />

      {/* 左下 — 冷色微光 (亮色: 淡蓝, 暗色: 深蓝) */}
      <div className="hero-orb absolute -bottom-[15%] -left-[5%] h-[28vmax] w-[28vmax] rounded-full blur-[90px] bg-[radial-gradient(circle,rgba(120,150,220,0.07)_0%,transparent_70%)] dark:bg-[radial-gradient(circle,rgba(80,120,200,0.13)_0%,transparent_70%)]" />

      {/* 中心偏上 — 微弱高亮 (亮色: 极淡, 暗色: 微光) */}
      <div className="hero-orb absolute left-[30%] top-[20%] h-[20vmax] w-[20vmax] rounded-full blur-[120px] bg-[radial-gradient(circle,rgba(180,160,230,0.05)_0%,transparent_70%)] dark:bg-[radial-gradient(circle,rgba(160,140,210,0.10)_0%,transparent_70%)]" />
    </div>
  );
}
