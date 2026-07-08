import { HeroSection } from './_sections/hero-section';
import { PainSolutionSection } from './_sections/pain-solution-section';
import { AdvantagesSection } from './_sections/advantages-section';
import { MetricsSection } from './_sections/metrics-section';
import { PlatformsSection } from './_sections/platforms-section';
import { UseCasesSection } from './_sections/use-cases-section';
import { DevFlowSection } from './_sections/dev-flow-section';
import { DeliverySection } from './_sections/delivery-section';

/**
 * 首页 — Apple 风格 GSAP 动画驱动
 *
 * 所有区域均已提取到 _sections/ 目录下的独立组件中。
 * 本页面仅负责按顺序组装。
 */
export default function HomePage() {
  return (
    <main className="flex flex-col items-center bg-[#0a0a0b]">
      <HeroSection />
      <PainSolutionSection />
      <AdvantagesSection />
      <MetricsSection />
      <PlatformsSection />
      <UseCasesSection />
      <DevFlowSection />
      <DeliverySection />
    </main>
  );
}
