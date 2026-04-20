import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import { Inter, Noto_Sans_KR } from 'next/font/google';
import './globals.css';
import { Navigation } from '@/components/Navigation';
import { AdPlaceholder } from '@/components/AdPlaceholder';
import { THEME_STORAGE_KEY } from '@/lib/theme';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

const notoSansKR = Noto_Sans_KR({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-kr',
});

export const metadata: Metadata = {
  title: 'GaeSaeGi Math',
  description: '수능 및 모의평가, 대학별 논술 수학 기출 문제와 단계별 풀이 힌트, 그리고 학습 과학에 기반한 수학 학습 칼럼을 제공합니다.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const themeInit = `(function(){try{var k=${JSON.stringify(THEME_STORAGE_KEY)};var t=localStorage.getItem(k);var d=!1;if(t==="dark")d=!0;else if(t==="light")d=!1;else d=window.matchMedia("(prefers-color-scheme: dark)").matches;document.documentElement.classList.toggle("dark",d);}catch(e){}})();`;

  return (
    <html lang="ko" suppressHydrationWarning className={`${inter.variable} ${notoSansKR.variable}`}>
      <body
        className="min-h-screen bg-slate-50 font-sans text-slate-900 antialiased transition-colors dark:bg-slate-950 dark:text-slate-100"
        suppressHydrationWarning
      >
        <Script id="theme-init" strategy="beforeInteractive">
          {themeInit}
        </Script>
        <Navigation />
        <main className="book-main mx-auto w-full max-w-5xl flex-1">
          {children}
          <div id="app-site-bottom-ad">
            <AdPlaceholder region="site-bottom" variant="banner" className="mt-16 mb-0" />
          </div>
        </main>
        <footer
          id="app-site-footer"
          className="w-full border-t border-slate-200 bg-white py-12 mt-20 dark:border-slate-800 dark:bg-slate-950"
        >
          <div className="book-nav-inner mx-auto max-w-5xl text-center type-caption flex flex-col items-center gap-2 pb-[max(0,env(safe-area-inset-bottom))]">
            <span>© {new Date().getFullYear()} GaeSaeGi Math. All rights reserved.</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
