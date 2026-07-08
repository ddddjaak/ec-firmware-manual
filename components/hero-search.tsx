'use client';

import { Search } from 'lucide-react';
import { useEffect, useState } from 'react';

export function HeroSearch() {
  const [modifier, setModifier] = useState('Ctrl');

  useEffect(() => {
    if (/Mac|iPhone|iPad/.test(navigator.platform)) setModifier('⌘');
  }, []);

  return (
    <button
      onClick={() =>
        window.dispatchEvent(
          new KeyboardEvent('keydown', {
            key: 'k',
            metaKey: /Mac|iPhone|iPad/.test(navigator.platform),
            ctrlKey: !/Mac|iPhone|iPad/.test(navigator.platform),
            bubbles: true,
          })
        )
      }
      className="group flex w-full max-w-md items-center gap-3 rounded-xl border border-purple-200 bg-purple-50/60 px-4 py-3 text-sm text-purple-400 transition-all hover:border-purple-400 hover:bg-purple-100/70 hover:text-purple-600 dark:border-white/10 dark:bg-white/5 dark:text-white/40 dark:hover:border-purple-400/30 dark:hover:bg-white/[0.08] dark:hover:text-white/70"
    >
      <Search className="h-4 w-4 shrink-0" />
      <span className="flex-1 text-left">搜索文档...</span>
      <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded-md border border-purple-200 bg-purple-100/60 px-1.5 py-0.5 font-mono text-[10px] text-purple-400 dark:border-white/10 dark:bg-white/5 dark:text-white/30">
        {modifier}+K
      </kbd>
    </button>
  );
}
