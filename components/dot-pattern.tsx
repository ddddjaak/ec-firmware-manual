/**
 * 细微点阵背景图案 — Google 风格的低调装饰
 *
 * 极其微弱的圆点网格，作为区段背景纹理使用。
 * 只在暗色模式下略有可见度，亮色模式几乎不可见（仅增加细微纹理感）。
 */
export function DotPattern({ className = '' }: { className?: string }) {
  return (
    <div
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
      aria-hidden="true"
    >
      <div
        className="h-full w-full opacity-[0.03] dark:opacity-[0.06]"
        style={{
          backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />
    </div>
  );
}
