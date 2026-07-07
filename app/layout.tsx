import type { ReactNode } from 'react';
import { RootProvider } from 'fumadocs-ui/provider/next';
import { JetBrains_Mono } from 'next/font/google';
import { StaticSearchDialog } from '@/components/search-dialog';
import './global.css';

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
});

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-CN" className={jetbrainsMono.variable} suppressHydrationWarning>
      <body className="min-h-screen">
        <RootProvider
          search={{
            SearchDialog: StaticSearchDialog,
            options: {
              api: '/ec-firmware-manual/api/search.json',
            },
          }}
        >
          {children}
        </RootProvider>
      </body>
    </html>
  );
}
