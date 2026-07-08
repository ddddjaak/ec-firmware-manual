/**
 * GSAP 统一入口 — 所有 GSAP 消费者从此文件导入，保证插件注册单例
 */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

// 模块级单例注册标记
let registered = false;

export function registerGsapPlugins() {
  if (registered) return;
  gsap.registerPlugin(ScrollTrigger, useGSAP);
  registered = true;
}

// 首次导入时自动注册
registerGsapPlugins();

export { gsap, ScrollTrigger, useGSAP };
