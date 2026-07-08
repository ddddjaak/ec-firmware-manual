import type { ReactNode } from 'react';
import { RootProvider } from 'fumadocs-ui/provider/next';
import localFont from 'next/font/local';
import { StaticSearchDialog } from '@/components/search-dialog';
import './global.css';

const jetbrainsMono = localFont({
  src: './fonts/JetBrainsMono.ttf',
  variable: '--font-mono',
  display: 'swap',
});

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-CN" className={jetbrainsMono.variable} suppressHydrationWarning>
      <body className="min-h-screen">
        <RootProvider
          theme={{ defaultTheme: 'dark' }}
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
