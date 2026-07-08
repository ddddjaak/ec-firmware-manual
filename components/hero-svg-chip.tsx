'use client';

import { useRef } from 'react';
import { gsap, useGSAP } from '@/lib/gsap';

/**
 * Hero SVG 芯片插图 — GSAP 驱动的"自我组装"背景动画
 *
 * 动画序列：
 *   芯片体弹性弹出 → 引脚 stagger 伸出 → 走线 stroke-dashoffset 绘制
 *   → 节点弹出 → 持续脉冲光环 + 节点微漂 + 数据点流动
 */
export function HeroSvgChip() {
  const svgRef = useRef<SVGSVGElement>(null);

  useGSAP(() => {
    const svg = svgRef.current;
    if (!svg) return;

    const chipBody = svg.querySelector<SVGRectElement>('#chip-body');
    const chipInner = svg.querySelector<SVGRectElement>('#chip-inner');
    const topPins = svg.querySelectorAll<SVGLineElement>('.pin-top');
    const bottomPins = svg.querySelectorAll<SVGLineElement>('.pin-bottom');
    const leftPins = svg.querySelectorAll<SVGLineElement>('.pin-left');
    const rightPins = svg.querySelectorAll<SVGLineElement>('.pin-right');
    const traces = svg.querySelectorAll<SVGPathElement>('.circuit-trace');
    const nodes = svg.querySelectorAll<SVGCircleElement>('.circuit-node');
    const chipLabel = svg.querySelector<SVGTextElement>('#chip-label');
    const pulseRing1 = svg.querySelector<SVGCircleElement>('#pulse-ring-1');
    const pulseRing2 = svg.querySelector<SVGCircleElement>('#pulse-ring-2');
    const dataDots = svg.querySelectorAll<SVGCircleElement>('.data-dot');

    // ── 初始状态 ──
    gsap.set([chipBody, chipInner], { scale: 0, transformOrigin: 'center center', opacity: 0 });
    gsap.set([topPins, bottomPins, leftPins, rightPins], { opacity: 0, visibility: 'visible' });
    traces.forEach(t => {
      const len = t.getTotalLength();
      gsap.set(t, { strokeDasharray: len, strokeDashoffset: len, opacity: 0, visibility: 'visible' });
    });
    gsap.set(nodes, { scale: 0, transformOrigin: 'center center', opacity: 0 });
    gsap.set([pulseRing1, pulseRing2], { scale: 0.85, opacity: 0, transformOrigin: '220px 170px' });
    gsap.set(dataDots, { opacity: 0 });
    gsap.set(chipLabel, { opacity: 0 });

    // ── Timeline: 组装 ──
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    tl.to(chipBody, { scale: 1, opacity: 1, duration: 0.9, ease: 'elastic.out(1, 0.5)' }, 0.15);
    tl.to(chipInner, { scale: 1, opacity: 1, duration: 0.7 }, 0.35);

    tl.to(topPins, { opacity: 1, duration: 0.25, stagger: 0.03, ease: 'power2.out' }, 0.7);
    tl.to(bottomPins, { opacity: 1, duration: 0.25, stagger: 0.03 }, 0.78);
    tl.to(leftPins, { opacity: 1, duration: 0.25, stagger: 0.03 }, 0.86);
    tl.to(rightPins, { opacity: 1, duration: 0.25, stagger: 0.03 }, 0.9);

    tl.to(traces, {
      strokeDashoffset: 0, opacity: 1,
      duration: 0.6, stagger: 0.05, ease: 'power2.inOut',
    }, 1.0);

    tl.to(nodes, {
      scale: 1, opacity: 1,
      duration: 0.22, stagger: 0.04, ease: 'back.out(2)',
    }, 1.3);

    tl.to(chipLabel, { opacity: 0.85, duration: 0.5 }, 1.5);

    // ── 持续动画 ──

    // 脉冲光环 — 同心扩散呼吸
    const pulseTl = gsap.timeline({ repeat: -1, delay: 2.0 });
    pulseTl.fromTo(pulseRing1, { scale: 0.85, opacity: 0 }, { scale: 1.5, opacity: 0.22, duration: 2.5, ease: 'power1.out' }, 0);
    pulseTl.fromTo(pulseRing2, { scale: 0.85, opacity: 0 }, { scale: 1.8, opacity: 0.12, duration: 3.0, ease: 'power1.out' }, 0.6);
    // 重置
    pulseTl.set([pulseRing1, pulseRing2], { scale: 0.85, opacity: 0 });

    // 节点微漂 — 模拟信号传输
    nodes.forEach((node, i) => {
      const offsetX = (Math.random() - 0.5) * 3;
      const offsetY = (Math.random() - 0.5) * 3;
      gsap.to(node, {
        x: offsetX, y: offsetY,
        duration: 2.5 + Math.random() * 2,
        repeat: -1, yoyo: true, ease: 'sine.inOut',
        delay: 2.0 + i * 0.15,
      });
    });

    // 芯片体微呼吸
    gsap.to(chipBody, {
      scale: 1.015,
      duration: 3.0,
      repeat: -1, yoyo: true, ease: 'sine.inOut',
      delay: 2.0,
    });

    // 数据点流动 — 沿走线 ping-pong
    dataDots.forEach((dot, i) => {
      gsap.to(dot, {
        opacity: 0.6,
        duration: 1.5 + i * 0.3,
        repeat: -1,
        yoyo: true,
        ease: 'power1.inOut',
        delay: 2.0 + i * 0.4,
      });
    });
  }, []);

  return (
    <div className="flex items-center justify-center">
      <svg
        ref={svgRef}
        viewBox="0 0 440 340"
        className="h-auto w-full"
        role="img"
        aria-label="Chipsea EC 芯片架构示意图"
      >
        {/* ═══ PCB 走线 ═══ */}
        {[
          'M 120 48 L 100 48 L 70 70',
          'M 138 48 L 138 30 L 160 30 L 160 12',
          'M 156 48 L 156 28 L 140 28',
          'M 284 48 L 304 48 L 340 70',
          'M 302 48 L 302 28 L 280 28',
          'M 320 48 L 320 30 L 340 30 L 340 12',
          'M 120 292 L 100 292 L 70 270',
          'M 138 292 L 138 312 L 160 312 L 160 328',
          'M 284 292 L 304 292 L 340 270',
          'M 302 292 L 302 312 L 280 312',
        ].map((d, i) => (
          <path
            key={`trace-${i}`}
            className="circuit-trace"
            d={d}
            fill="none"
            stroke="currentColor"
            strokeWidth="1.3"
            strokeLinecap="round"
            opacity="0.25"
          />
        ))}

        {/* ═══ 数据流动点 — 放在走线末端 ═══ */}
        {[
          [70, 70], [160, 10], [140, 28],
          [340, 70], [280, 28], [340, 12],
          [70, 270], [160, 328],
          [340, 270], [280, 312],
        ].map(([cx, cy], i) => (
          <circle
            key={`data-${i}`}
            className="data-dot"
            cx={cx}
            cy={cy}
            r="2.5"
            fill="currentColor"
            opacity="0"
          />
        ))}

        {/* ═══ 终端节点 ═══ */}
        {[
          [70, 70], [160, 12], [140, 28],
          [340, 70], [280, 28], [340, 12],
          [70, 270], [160, 328],
          [340, 270], [280, 312],
        ].map(([cx, cy], i) => (
          <circle
            key={`node-${i}`}
            className="circuit-node"
            cx={cx}
            cy={cy}
            r="3.5"
            fill="currentColor"
            opacity="0.4"
          />
        ))}

        {/* ═══ 脉冲光环 ═══ */}
        <circle
          id="pulse-ring-1"
          cx="220" cy="170" r="130"
          fill="none" stroke="currentColor"
          strokeWidth="1" opacity="0"
        />
        <circle
          id="pulse-ring-2"
          cx="220" cy="170" r="130"
          fill="none" stroke="currentColor"
          strokeWidth="0.6" opacity="0"
        />

        {/* ═══ 底部引脚 ═══ */}
        {Array.from({ length: 8 }).map((_, i) => {
          const x = 168 + i * 16;
          const pinY = 300 + i * 2;
          return (
            <line
              key={`pin-b-${i}`}
              className="pin-bottom"
              x1={x} y1="266" x2={x} y2={pinY}
              stroke="currentColor"
              strokeWidth="1.8" strokeLinecap="round"
              opacity="0.45"
            />
          );
        })}

        {/* ═══ 顶部引脚 ═══ */}
        {Array.from({ length: 8 }).map((_, i) => {
          const x = 168 + i * 16;
          const pinY = 40 - i * 2;
          return (
            <line
              key={`pin-t-${i}`}
              className="pin-top"
              x1={x} y1="74" x2={x} y2={pinY}
              stroke="currentColor"
              strokeWidth="1.8" strokeLinecap="round"
              opacity="0.45"
            />
          );
        })}

        {/* ═══ 左侧引脚 ═══ */}
        {Array.from({ length: 6 }).map((_, i) => {
          const y = 100 + i * 30;
          return (
            <line
              key={`pin-l-${i}`}
              className="pin-left"
              x1="156" y1={y} x2={120 + i * 3} y2={y - (i % 2) * 6}
              stroke="currentColor"
              strokeWidth="1.8" strokeLinecap="round"
              opacity="0.45"
            />
          );
        })}

        {/* ═══ 右侧引脚 ═══ */}
        {Array.from({ length: 6 }).map((_, i) => {
          const y = 100 + i * 30;
          return (
            <line
              key={`pin-r-${i}`}
              className="pin-right"
              x1="284" y1={y} x2={320 - i * 3} y2={y - (i % 2) * 6}
              stroke="currentColor"
              strokeWidth="1.8" strokeLinecap="round"
              opacity="0.45"
            />
          );
        })}

        {/* ═══ 芯片体 ═══ */}
        <rect
          id="chip-body"
          x="146" y="64" width="148" height="212" rx="6"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          opacity="0.6"
        />
        <rect
          id="chip-inner"
          x="158" y="80" width="124" height="180" rx="3"
          fill="currentColor"
          opacity="0.08"
        />

        {/* 芯片表面细节 */}
        <line x1="158" y1="150" x2="282" y2="150" stroke="currentColor" strokeWidth="0.6" opacity="0.18" />
        <line x1="198" y1="80" x2="198" y2="150" stroke="currentColor" strokeWidth="0.6" opacity="0.18" />
        <rect x="202" y="155" width="36" height="36" rx="3" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.22" />

        {/* ═══ 芯片标注 ═══ */}
        <text
          id="chip-label"
          x="220" y="230"
          textAnchor="middle"
          fontSize="9"
          fontFamily="var(--font-mono), monospace"
          fontWeight="600"
          fill="currentColor"
          opacity="0"
          letterSpacing="0.5"
        >
          CSCE250X
        </text>

        {/* ═══ 外围虚线框 ═══ */}
        <rect
          x="130" y="52" width="180" height="236" rx="12"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.5"
          strokeDasharray="4 6"
          opacity="0.15"
        />
      </svg>
    </div>
  );
}
