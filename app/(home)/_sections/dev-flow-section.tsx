'use client';

import { useScrollReveal } from '@/hooks/use-scroll-reveal';
import { TerminalMockup } from '@/components/terminal-mockup';

const devFlow = [
  { step: '01', title: '环境搭建', desc: '安装 Zephyr SDK、Python 依赖、交叉编译工具链及 J-Link 驱动' },
  { step: '02', title: '板级适配', desc: '编写 Device Tree、Kconfig 配置，定义引脚复用与功能裁剪' },
  { step: '03', title: '驱动开发', desc: '基于 Zephyr 驱动模型开发外设驱动，复用芯海 18+ 现有驱动' },
  { step: '04', title: '功能验证', desc: 'Ztest 单元测试 + Twister 自动化测试 + EVB 实机验证' },
  { step: '05', title: '量产部署', desc: '固件签名、写保护配置、生产烧录流程及 OTA 升级方案' },
];

const terminalLines = [
  '// 1. 初始化 Zephyr 工作区',
  '$ west init -m https://github.com/chipsea/ecfw-zephyr',
  '$ west update',
  '',
  '// 2. 构建 CSCE250X 固件',
  '$ west build -b chipsea_csce250x_evb app/',
  '  ✓ 编译成功 — 用时 12.4s',
  '  Image: build/zephyr/zephyr.hex  (384 KB)',
  '',
  '// 3. 烧录 & 运行',
  '$ west flash --runner jlink',
  '  ✓ 烧录完成 — 设备已就绪',
  '  *** Booting Zephyr OS v3.6.0 ***',
  '  [EC] 初始化完成，进入主循环',
];

export function DevFlowSection() {
  const { scopeRef } = useScrollReveal({ stagger: 0.1, fromY: 24 });

  return (
    <div className="w-full bg-white dark:bg-[#0a0a0b]">
      <div className="mx-auto max-w-6xl px-6 py-28 sm:px-8 sm:py-36">
        <h2 className="text-3xl font-bold tracking-[-0.02em] text-neutral-900 dark:text-white sm:text-4xl lg:text-5xl">
          从零到量产，比你想象的更快
        </h2>

        <div className="mt-14 grid grid-cols-1 gap-14 lg:grid-cols-2 lg:gap-16">
          {/* 左栏 — 步骤列表 */}
          <div>
            <div ref={scopeRef} className="flex flex-col">
              {devFlow.map(({ step, title, desc }) => (
                <div key={step} className="flex gap-5 border-t border-neutral-200 py-4 first:border-t-0 dark:border-neutral-800">
                  <span className="shrink-0 pt-0.5 font-mono text-sm font-bold text-neutral-300 dark:text-neutral-600">{step}</span>
                  <div>
                    <h3 className="text-base font-bold text-neutral-900 dark:text-white">{title}</h3>
                    <p className="mt-0.5 text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 右栏 — 终端 mockup */}
          <div className="flex items-start lg:pt-12">
            <TerminalMockup lines={terminalLines} className="w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
