/**
 * useScrollReveal — GSAP 驱动的滚动触发错峰入场动画
 *
 * 将一个容器内所有直接子元素以 stagger 方式逐一显示。
 * 替代旧的 IntersectionObserver + CSS transition 方案。
 */
'use client';

import { useRef, type RefObject } from 'react';
import { gsap, ScrollTrigger, useGSAP } from '@/lib/gsap';

export interface ScrollRevealOptions {
  /** 子元素之间的错峰延迟（秒），默认 0.08 */
  stagger?: number;
  /** 入场垂直偏移（px），默认 40 */
  fromY?: number;
  /** 入场水平偏移（px），默认 0 */
  fromX?: number;
  /** 动画时长（秒），默认 0.9 */
  duration?: number;
  /** GSAP ease 字符串，默认 "power3.out" */
  ease?: string;
  /** ScrollTrigger 起始位置，默认 "top 85%" */
  start?: string;
  /** ScrollTrigger toggleActions，默认 "play none none reverse" */
  toggleActions?: string;
  /** 容器动画前的可见性，默认 "visible"（避免 CLS） */
  initialVisibility?: 'visible' | 'hidden';
}

export function useScrollReveal(
  options: ScrollRevealOptions = {},
): { scopeRef: RefObject<HTMLDivElement | null> } {
  const {
    stagger = 0.08,
    fromY = 40,
    fromX = 0,
    duration = 0.9,
    ease = 'power3.out',
    start = 'top 85%',
    toggleActions = 'play none none reverse',
    initialVisibility = 'visible',
  } = options;

  const scopeRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = scopeRef.current;
      if (!el) return;

      // 确保容器自身可见（无 CLS）
      gsap.set(el, { visibility: 'visible' });

      // 获取直接子元素
      const children = Array.from(el.children) as HTMLElement[];
      if (children.length === 0) return;

      // 设置初始状态
      gsap.set(children, {
        opacity: 0,
        y: fromY,
        x: fromX,
        visibility: initialVisibility === 'hidden' ? 'hidden' : 'visible',
      });

      // 创建 stagger 入场动画
      gsap.fromTo(
        children,
        { opacity: 0, y: fromY, x: fromX },
        {
          opacity: 1,
          y: 0,
          x: 0,
          duration,
          ease,
          stagger,
          scrollTrigger: {
            trigger: el,
            start,
            toggleActions,
          },
        },
      );
    },
    { scope: scopeRef },
  );

  return { scopeRef };
}
