'use client';

import dynamic from 'next/dynamic';
import type { ComponentProps } from 'react';

const MermaidInner = dynamic(
  () => import('./mermaid-inner').then((m) => m.MermaidInner),
  { ssr: false, loading: () => <MermaidSkeleton /> }
);

function MermaidSkeleton() {
  return (
    <div
      className="my-6 flex items-center justify-center rounded-lg border p-8 text-sm text-fd-muted-foreground"
      style={{ borderColor: 'rgba(103, 58, 183, 0.2)' }}
    >
      Loading diagram...
    </div>
  );
}

export function MermaidChart(props: ComponentProps<typeof MermaidInner>) {
  return <MermaidInner {...props} />;
}
