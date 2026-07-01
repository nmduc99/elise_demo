import { ReactNode } from 'react';
import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  icons: {
    icon: '/images/BMG_LOGO_sitemap.png',
    shortcut: '/images/BMG_LOGO_sitemap.png',
    apple: '/images/BMG_LOGO_sitemap.png',
  },
};

type Props = {
  children: ReactNode;
};

export default function RootLayout({ children }: Props) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <head>
        <meta name="robots" content="noindex, nofollow" />
      </head>
      <body className="bg-[#f7f8f9]" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
