/**
 * useCardTilt — 3D 卡片鼠标跟随倾斜效果
 *
 * 鼠标在卡片区域内移动时，卡片绕 X/Y 轴旋转跟踪鼠标位置。
 * 鼠标离开时平滑回弹到原位。
 * 类似 Apple TV 卡片交互。
 */
'use client';

import { useRef, useEffect, useCallback, type RefObject } from 'react';
import { gsap } from '@/lib/gsap';

export interface CardTiltOptions {
  /** 最大倾斜角度（度），默认 8 */
  maxTilt?: number;
  /** 动画时长（秒），默认 0.4 */
  duration?: number;
  /** 透视距离（px），默认 800 */
  perspective?: number;
  /** 是否启用（移动端自动禁用），默认 true */
  enabled?: boolean;
}

export function useCardTilt(options: CardTiltOptions = {}): {
  tiltRef: RefObject<HTMLDivElement | null>;
} {
  const { maxTilt = 8, duration = 0.4, perspective = 800 } = options;

  const ref = useRef<HTMLDivElement>(null);
  const isMobile = useRef(false);

  // 检测移动端（简单宽度判断）
  useEffect(() => {
    const check = () => {
      isMobile.current = window.innerWidth < 768;
    };
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const onMove = useCallback(
    (e: MouseEvent) => {
      if (isMobile.current) return;
      const el = ref.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5; // -0.5 ~ 0.5
      const y = (e.clientY - rect.top) / rect.height - 0.5;

      gsap.to(el, {
        rotateY: x * maxTilt,
        rotateX: -y * maxTilt,
        transformPerspective: perspective,
        duration,
        ease: 'power2.out',
        overwrite: 'auto',
      });
    },
    [maxTilt, duration, perspective],
  );

  const onLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;

    gsap.to(el, {
      rotateY: 0,
      rotateX: 0,
      transformPerspective: perspective,
      duration: duration * 1.5,
      ease: 'power3.out',
      overwrite: 'auto',
    });
  }, [duration, perspective]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    el.addEventListener('mousemove', onMove, { passive: true });
    el.addEventListener('mouseleave', onLeave);
    return () => {
      el.removeEventListener('mousemove', onMove);
      el.removeEventListener('mouseleave', onLeave);
    };
  }, [onMove, onLeave]);

  return { tiltRef: ref };
}
