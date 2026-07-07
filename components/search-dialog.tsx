'use client';

import { flexsearchStaticClient } from 'fumadocs-core/search/client/flexsearch-static';
import { useOnChange } from 'fumadocs-core/utils/use-on-change';
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
import { useI18n } from 'fumadocs-ui/contexts/i18n';
import { SearchIcon } from 'lucide-react';
import { useMemo, useState } from 'react';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  api?: string;
  delayMs?: number;
}

export function StaticSearchDialog({
  open,
  onOpenChange,
  api = '/api/search',
  delayMs = 150,
}: Props) {
  const { locale } = useI18n();
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<any[] | null>(null);

  const client = useMemo(
    () => flexsearchStaticClient({ from: api, locale: locale ?? undefined }),
    [api, locale]
  );

  useOnChange(search, () => {
    const timer = setTimeout(async () => {
      if (!search) { setResults(null); return; }
      const res = await client.search(search);
      setResults(res);
    }, delayMs);
    return () => clearTimeout(timer);
  });

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
          <SearchDialogInput placeholder="Search documentation..." />
          <SearchDialogClose />
        </SearchDialogHeader>
        <SearchDialogList items={results} />
      </SearchDialogContent>
    </SearchDialog>
  );
}
