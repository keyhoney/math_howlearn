'use client';

import { Bookmark } from 'lucide-react';
import { useBookmark } from '@/components/BookmarkContext';

export function ProblemBookmarkButton({ problemId }: { problemId: string }) {
  const { hydrated, isBookmarked, toggle } = useBookmark();
  const on = isBookmarked(problemId);

  return (
    <button
      type="button"
      onClick={() => toggle(problemId)}
      disabled={!hydrated}
      title={on ? '스크랩에서 제거' : '스크랩에 담기'}
      aria-pressed={on}
      aria-label={on ? '스크랩에서 제거' : '스크랩에 담기'}
      className={`inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-lg border px-4 py-2 type-caption font-semibold transition-colors touch-manipulation disabled:opacity-50 ${
        on
          ? 'border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100 dark:border-amber-700 dark:bg-amber-950/50 dark:text-amber-100 dark:hover:bg-amber-950/70'
          : 'border-slate-200 bg-white text-slate-600 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-indigo-500/50 dark:hover:bg-indigo-950/40 dark:hover:text-indigo-300'
      }`}
    >
      <Bookmark className={`h-4 w-4 shrink-0 ${on ? 'fill-amber-400 text-amber-600 dark:fill-amber-500/80 dark:text-amber-300' : ''}`} />
      {on ? '스크랩됨' : '스크랩'}
    </button>
  );
}
