'use client';

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';

export function MermaidInner({ chart, chartDark }: { chart: string; chartDark?: string }) {
  const { resolvedTheme } = useTheme();
  const [svg, setSvg] = useState('');
  const [failed, setFailed] = useState(false);

  const source = resolvedTheme === 'dark' && chartDark ? chartDark : chart;

  useEffect(() => {
    let cancelled = false;
    import('mermaid').then((mod) => {
      if (cancelled) return;
      mod.default.initialize({
        startOnLoad: false,
        theme: resolvedTheme === 'dark' ? 'dark' : 'base',
        securityLevel: 'loose',
        fontFamily: 'inherit',
      });
      mod.default
        .render('mermaid-graph', source)
        .then((r) => { if (!cancelled) setSvg(r.svg); })
        .catch(() => { if (!cancelled) setFailed(true); });
    });
    return () => { cancelled = true; };
  }, [source, resolvedTheme]);

  if (failed) {
    return (
      <pre className="my-6 overflow-x-auto rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 text-sm">
        {source}
      </pre>
    );
  }

  return (
    <div
      className="my-6 overflow-x-auto rounded-lg border p-4 [&>svg]:mx-auto [&>svg]:max-w-full"
      style={{ borderColor: 'rgba(103, 58, 183, 0.2)' }}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
