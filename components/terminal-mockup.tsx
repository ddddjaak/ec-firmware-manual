/**
 * 终端窗口 Mockup — 仿真命令行界面
 *
 * Google 产品页常用技巧：展示真实的产品界面/CLI 来增加视觉可信度，
 * 同时作为"插图"打破纯文字页面的单调。
 */
export function TerminalMockup({
  lines,
  className = '',
}: {
  lines: string[];
  className?: string;
}) {
  return (
    <div className={`overflow-hidden rounded-xl border border-neutral-200 bg-neutral-900 shadow-lg dark:border-neutral-700 dark:shadow-2xl ${className}`}>
      {/* 标题栏 — 红黄绿三个圆点 */}
      <div className="flex items-center gap-2 border-b border-neutral-700 px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
        <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
        <span className="ml-2 text-[0.65rem] text-neutral-500 font-mono">zephyr-build — bash</span>
      </div>

      {/* 命令行内容 */}
      <div className="overflow-x-auto px-4 py-3 sm:px-5 sm:py-4">
        <pre className="font-mono text-[0.78rem] leading-relaxed text-neutral-300 sm:text-[0.82rem]">
          {lines.map((line, i) => (
            <div key={i} className="flex">
              {/* prompt */}
              {line.startsWith('$') || line.startsWith('#') ? (
                <>
                  <span className="select-none mr-2 text-emerald-400">$</span>
                  <span className="text-neutral-300">{line.slice(1)}</span>
                </>
              ) : line.startsWith('//') ? (
                <span className="text-neutral-600">{line}</span>
              ) : (
                <span className={line.includes('✓') || line.includes('成功') ? 'text-emerald-400' : line.includes('error') || line.includes('fail') ? 'text-red-400' : 'text-neutral-400'}>
                  {line}
                </span>
              )}
            </div>
          ))}
        </pre>
      </div>
    </div>
  );
}
