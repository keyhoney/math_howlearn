'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BookOpen,
  Bookmark,
  Calculator,
  ClipboardList,
  LayoutDashboard,
  Menu,
  PenLine,
  X,
} from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';

function isNavActive(pathname: string, href: string): boolean {
  if (href === '/') return pathname === '/';
  if (href === '/problems/wrong-note') return pathname.startsWith('/problems/wrong-note');
  if (href === '/problems/bookmarks') return pathname.startsWith('/problems/bookmarks');
  if (href === '/problems') {
    if (pathname === '/problems') return true;
    if (pathname.startsWith('/problems/wrong-note') || pathname.startsWith('/problems/bookmarks')) {
      return false;
    }
    return pathname.startsWith('/problems/');
  }
  if (href === '/essay-problems') {
    if (pathname === '/essay-problems') return true;
    return pathname.startsWith('/essay-problems/');
  }
  return pathname.startsWith(href);
}

const navItems = [
  { href: '/', label: '홈', icon: LayoutDashboard },
  { href: '/problems', label: '수능 기출 문제', icon: Calculator },
  { href: '/essay-problems', label: '논술 기출 문제', icon: PenLine },
  { href: '/problems/wrong-note', label: '오답 노트', icon: ClipboardList },
  { href: '/problems/bookmarks', label: '스크랩', icon: Bookmark },
  { href: '/columns', label: '학습 과학 칼럼', icon: BookOpen },
] as const;

export function Navigation() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

  useEffect(() => {
    if (!mobileOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setMobileOpen(false);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [mobileOpen]);

  return (
    <nav
      id="app-site-nav"
      className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/85"
    >
      <div className="book-nav-inner mx-auto flex h-14 min-h-[3.5rem] max-w-5xl items-center justify-between gap-2 sm:h-16 sm:min-h-[4rem] sm:gap-3">
        <Link
          href="/"
          className="flex min-h-[44px] min-w-0 flex-1 items-center space-x-2 py-1 group sm:min-h-0 sm:flex-none"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded bg-indigo-600 transition-transform group-hover:scale-105 group-active:scale-95 dark:bg-indigo-500">
            <Calculator className="h-5 w-5 text-white" />
          </div>
          <span className="type-nav-brand truncate">GaeSaeGi Math</span>
        </Link>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-4">
          <div className="hidden items-center gap-0.5 lg:flex lg:gap-2">
            {navItems.map((item) => {
              const isActive = isNavActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative flex min-h-[44px] items-center space-x-1.5 rounded-lg px-2 py-2 text-sm font-medium transition-colors sm:min-h-0 sm:px-3 ${
                    isActive
                      ? 'text-indigo-600 dark:text-indigo-400'
                      : 'text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400'
                  }`}
                >
                  <item.icon className="h-4 w-4 shrink-0" aria-hidden />
                  <span className="whitespace-nowrap">{item.label}</span>
                  {isActive && (
                    <span
                      className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full bg-indigo-600 dark:bg-indigo-400 sm:left-3 sm:right-3"
                      aria-hidden
                    />
                  )}
                </Link>
              );
            })}
          </div>

          <ThemeToggle />

          <button
            type="button"
            className="flex h-11 w-11 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 shadow-sm transition-colors hover:bg-slate-50 lg:hidden dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            onClick={() => setMobileOpen(true)}
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav-panel"
            aria-label="메뉴 열기"
          >
            <Menu className="h-5 w-5" aria-hidden />
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden" role="dialog" aria-modal="true" aria-label="사이트 메뉴">
          <button
            type="button"
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
            aria-label="메뉴 닫기"
            onClick={() => setMobileOpen(false)}
          />
          <div
            id="mobile-nav-panel"
            className="absolute inset-y-0 right-0 flex w-[min(100%,20rem)] flex-col border-l border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-950"
          >
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-700">
              <span className="type-caption font-semibold text-slate-800 dark:text-slate-100">메뉴</span>
              <button
                type="button"
                className="flex h-11 w-11 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                onClick={() => setMobileOpen(false)}
                aria-label="메뉴 닫기"
              >
                <X className="h-5 w-5" aria-hidden />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto overscroll-contain px-2 py-3 pb-[max(1rem,env(safe-area-inset-bottom))]">
              <ul className="flex flex-col gap-1">
                {navItems.map((item) => {
                  const isActive = isNavActive(pathname, item.href);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        className={`flex min-h-[48px] items-center gap-3 rounded-xl px-4 py-3 text-base font-medium transition-colors ${
                          isActive
                            ? 'bg-indigo-50 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-200'
                            : 'text-slate-800 hover:bg-slate-50 dark:text-slate-100 dark:hover:bg-slate-800/80'
                        }`}
                      >
                        <item.icon className="h-5 w-5 shrink-0 opacity-80" aria-hidden />
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </div>
        </div>
      )}
    </nav>
  );
}
