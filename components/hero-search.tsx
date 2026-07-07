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
      className="group flex w-full max-w-md items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/40 backdrop-blur-sm transition-all hover:border-purple-400/30 hover:bg-white/[0.08] hover:text-white/70"
    >
      <Search className="h-4 w-4 shrink-0" />
      <span className="flex-1 text-left">Search documentation...</span>
      <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded-md border border-white/10 bg-white/5 px-1.5 py-0.5 font-mono text-[10px] text-white/30">
        {modifier}+K
      </kbd>
    </button>
  );
}
