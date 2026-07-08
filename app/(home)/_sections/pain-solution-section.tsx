'use client';

import { useRef } from 'react';
import { gsap, useGSAP } from '@/lib/gsap';

const painItems = [
  { pain: '换芯片 = 重写固件', cost: '项目延期、预算超支' },
  { pain: '多产品线独立代码分支', cost: '同一个 bug 修 N 遍' },
  { pain: '调试靠串口 printf', cost: '问题定位依赖最熟悉代码的那个人' },
  { pain: '工程师离职 = 代码变黑盒', cost: '团队陷入被动，无人敢改' },
  { pain: '裸机升级 RTOS', cost: '推倒重来，技术债越积越重' },
];

const solutionItems = [
  { fix: '换芯片 = 改 Device Tree 配置', result: '应用代码零修改，3 天出原型' },
  { fix: '一套驱动覆盖全产品线', result: '修一次 bug，全系产品受益' },
  { fix: '自动化测试 + CI 门禁', result: '每次提交自动验证，质量可度量' },
  { fix: '代码结构标准化', result: '新成员加入即能定位问题，不依赖个人' },
  { fix: 'Zephyr LTS 社区维护', result: '技术债可控，跟随主线持续演进' },
];

export function PainSolutionSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    gsap.set([leftRef.current, rightRef.current], { opacity: 0 });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top 68%',
        toggleActions: 'play none none reverse',
      },
    });

    tl.fromTo(leftRef.current,
      { opacity: 0, x: -30 },
      { opacity: 1, x: 0, duration: 0.9, ease: 'power3.out' },
    ).fromTo(rightRef.current,
      { opacity: 0, x: 30 },
      { opacity: 1, x: 0, duration: 0.9, ease: 'power3.out' },
      '-=0.55');
  }, []);

  return (
    <div className="w-full bg-[#f5f5f7] dark:bg-[#0d0d0f]" ref={sectionRef}>
      <div className="mx-auto max-w-4xl px-6 py-28 sm:px-10 sm:py-36">
        <h2 className="text-3xl font-bold tracking-[-0.02em] text-neutral-900 dark:text-white sm:text-4xl lg:text-5xl">
          换芯片 ≠ 重写固件
        </h2>
        <p className="mt-4 max-w-xl text-lg leading-relaxed text-neutral-500 dark:text-neutral-400">
          从裸机到 Zephyr RTOS，我们让迁移变成
          <strong className="font-semibold text-neutral-900 dark:text-white">配置</strong>，而非重构。
        </p>

        <div className="relative mt-16 grid grid-cols-1 gap-16 md:grid-cols-2 md:gap-20">
          {/* 竖线分隔 — desktop only */}
          <div className="absolute left-1/2 top-0 hidden h-full w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-neutral-300 to-transparent md:block dark:via-neutral-700" aria-hidden="true" />
          <div className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 rounded-full border border-neutral-300 bg-[#f5f5f7] dark:bg-[#0d0d0f] px-2 py-1 text-xs font-bold uppercase tracking-widest text-neutral-400 md:block dark:border-neutral-700 dark:text-neutral-600">vs</div>

          {/* 左侧 — 痛点 */}
          <div ref={leftRef} >
            <p className="mb-8 text-xs font-semibold uppercase tracking-[0.12em] text-neutral-400 dark:text-neutral-500">
              隐性成本
            </p>
            <ul className="flex flex-col">
              {painItems.map(({ pain, cost }, i) => (
                <li key={i} className="border-t border-neutral-200 py-4 first:border-t-0 dark:border-neutral-800">
                  <p className="text-base font-semibold text-neutral-800 dark:text-neutral-200">{pain}</p>
                  <p className="mt-1 text-sm text-neutral-400 dark:text-neutral-500">{cost}</p>
                </li>
              ))}
            </ul>
          </div>

          {/* 右侧 — 方案 */}
          <div ref={rightRef} >
            <p className="mb-8 text-xs font-semibold uppercase tracking-[0.12em] text-neutral-400 dark:text-neutral-500">
              芯海的解法
            </p>
            <ul className="flex flex-col">
              {solutionItems.map(({ fix, result }, i) => (
                <li key={i} className="border-t border-neutral-200 py-4 first:border-t-0 dark:border-neutral-800">
                  <p className="text-base font-semibold text-neutral-800 dark:text-neutral-200">{fix}</p>
                  <p className="mt-1 text-sm text-neutral-400 dark:text-neutral-500">{result}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
