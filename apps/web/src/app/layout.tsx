import '@/styles/globals.css';
import localFont from 'next/font/local';
import { ClientLayout } from './ClientLayout';
import { DynamicLayoutProviders } from './DynamicLayoutProviders';
import { ThemeProvider } from '@/components/theme-provider';

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



export default async function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${robotoMono.variable}`}>
      <head />
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <DynamicLayoutProviders>
            <ClientLayout>
              {children}
            </ClientLayout>
          </DynamicLayoutProviders>
        </ThemeProvider>
      </body>
    </html>
  );
}
