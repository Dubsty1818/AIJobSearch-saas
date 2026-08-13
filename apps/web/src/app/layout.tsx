import '@/styles/globals.css';
import localFont from 'next/font/local';
import { DynamicLayoutProviders } from './DynamicLayoutProviders';
import { ClientLayout } from './ClientLayout';

const inter = localFont({
  src: [
    { path: '../../node_modules/@fontsource/inter/files/inter-latin-400-normal.woff2', weight: '400', style: 'normal' },
    { path: '../../node_modules/@fontsource/inter/files/inter-latin-500-normal.woff2', weight: '500', style: 'normal' },
    { path: '../../node_modules/@fontsource/inter/files/inter-latin-600-normal.woff2', weight: '600', style: 'normal' },
    { path: '../../node_modules/@fontsource/inter/files/inter-latin-700-normal.woff2', weight: '700', style: 'normal' },
  ],
  variable: '--font-inter',
  display: 'swap',
});

const robotoMono = localFont({
  src: [
    { path: '../../node_modules/@fontsource/roboto-mono/files/roboto-mono-latin-400-normal.woff2', weight: '400', style: 'normal' },
    { path: '../../node_modules/@fontsource/roboto-mono/files/roboto-mono-latin-700-normal.woff2', weight: '700', style: 'normal' },
  ],
  variable: '--font-roboto-mono',
  display: 'swap',
});

export const metadata = {
  title: 'JobMatchAI — AI-Powered Job Search',
  description: 'Automate your job search with custom scoring rules, CV analysis, and real-time job matches.',
};

import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getLocale } from 'next-intl/server';

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const messages = await getMessages();
  const locale = await getLocale();

  return (
    <html lang={locale} suppressHydrationWarning className={`${inter.variable} ${robotoMono.variable}`}>
      <head />
      <body>
        <NextIntlClientProvider messages={messages}>
          <DynamicLayoutProviders>
            <ClientLayout>
              {children}
            </ClientLayout>
          </DynamicLayoutProviders>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
