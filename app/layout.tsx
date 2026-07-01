import { ReactNode } from 'react';
import './globals.css';
import type { Metadata } from 'next';
import { APP_NAME } from '@/lib/titleMap';

export const metadata: Metadata = {
  title: {
    default: APP_NAME,
    template: `%s | ${APP_NAME}`,
  },
  icons: {
    icon: '/Icon-Elise.png',
    shortcut: '/Icon-Elise.png',
    apple: '/Icon-Elise.png',
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
