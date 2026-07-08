'use client';

import {
  SearchDialog,
  SearchDialogClose,
  SearchDialogContent,
  SearchDialogHeader,
  SearchDialogIcon,
  SearchDialogInput,
  SearchDialogList,
  SearchDialogOverlay,
} from 'fumadocs-ui/components/dialog/search';
import { SearchIcon } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  api?: string;
  delayMs?: number;
}

// Module-level cache for the flexsearch document
let _docPromise: Promise<any> | null = null;
let _apiUrl: string | null = null;

function getSearchDoc(api: string): Promise<any> {
  if (_docPromise && _apiUrl === api) return _docPromise;

  _apiUrl = api;
  _docPromise = (async () => {
    const m = await import('flexsearch');
    const FlexSearch = m && (m as any).Document ? m : ((m as any).default || m);

    const res = await fetch(api);
    if (!res.ok) throw new Error(`Failed to fetch search index: ${res.status}`);
    const data = await res.json();

    const doc = new FlexSearch.Document({
      tokenize: 'full',
      document: {
        id: 'id',
        index: ['content'],
        tag: ['tags'],
        store: true,
      },
    });

    for (const [k, v] of Object.entries(data.raw)) {
      doc.import(k, v);
    }

    return doc;
  })();

  return _docPromise;
}

export function StaticSearchDialog({
  open,
  onOpenChange,
  api = '/api/search',
  delayMs = 150,
}: Props) {
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<any[] | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Prefetch the search index when the dialog first opens
  useEffect(() => {
    if (open) {
      getSearchDoc(api).catch((e) => console.error('[Search] Prefetch error:', e));
    }
  }, [open, api]);

  // Search when query changes
  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    if (!search.trim()) {
      setResults(null);
      return;
    }

    timerRef.current = setTimeout(async () => {
      try {
        const doc = await getSearchDoc(api);
        const arr = await doc.searchAsync(search, {
          index: 'content',
          limit: 60,
        });

        if (!arr || arr.length === 0) {
          setResults([]);
          return;
        }

        const resultIds = arr[0].result;
        const out: any[] = [];
        const seen = new Set<string>();

        for (const id of resultIds) {
          const d = doc.get(id);
          if (!d) continue;

          // Deduplicate — only show each result once
          const key = d.type === 'page' ? d.id : (d.page_id + '|' + d.id);
          if (seen.has(key)) continue;
          seen.add(key);

          out.push({
            id: d.id,
            content: d.type === 'page' ? d.content : (d.content ?? '').substring(0, 200),
            breadcrumbs: d.breadcrumbs ?? [],
            type: d.type,
            url: d.url,
          });
        }

        setResults(out);
      } catch (e) {
        console.error('[Search] Error:', e);
        setResults([]);
      }
    }, delayMs);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [search, api, delayMs]);

  return (
    <SearchDialog
      open={open}
      onOpenChange={onOpenChange}
      search={search}
      onSearchChange={setSearch}
    >
      <SearchDialogOverlay />
      <SearchDialogContent onOpenAutoFocus={(e) => e.preventDefault()}>
        <SearchDialogHeader>
          <SearchDialogIcon>
            <SearchIcon className="size-4" />
          </SearchDialogIcon>
          <SearchDialogInput placeholder="搜索文档..." />
          <SearchDialogClose />
        </SearchDialogHeader>
        <SearchDialogList items={results} />
      </SearchDialogContent>
    </SearchDialog>
  );
}
