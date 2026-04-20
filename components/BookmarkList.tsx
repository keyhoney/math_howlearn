'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import type { Problem } from '@/data/problems';
import { useBookmark } from '@/components/BookmarkContext';

export function BookmarkList({ problems }: { problems: Problem[] }) {
  const { hydrated, getBookmarkedIds, getBookmarkTs } = useBookmark();

  const bookmarkIds = getBookmarkedIds();

  const listed = useMemo(() => {
    const withBm = problems.filter((p) => bookmarkIds.has(p.id));
    return withBm.sort((a, b) => {
      const ta = getBookmarkTs(a.id) ?? 0;
      const tb = getBookmarkTs(b.id) ?? 0;
      return tb - ta;
    });
  }, [problems, bookmarkIds, getBookmarkTs]);

  if (!hydrated) {
    return <p className="type-caption text-slate-500">스크랩 목록을 불러오는 중…</p>;
  }

  if (listed.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-8 text-center type-body text-slate-600 dark:border-slate-700 dark:bg-slate-900/90 dark:text-slate-400">
        아직 스크랩한 문제가 없습니다. 문제 상단의「스크랩」버튼으로 어려운 문제만 모아 두세요.
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {listed.map((p) => {
        const ts = getBookmarkTs(p.id);
        return (
          <div
            key={p.id}
            className="book-card--compact rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900/90 dark:shadow-none"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0 space-y-2">
                <h2 className="type-subhead text-slate-800 dark:text-slate-100">{p.source}</h2>
                <p className="type-caption text-slate-500 dark:text-slate-400">
                  {ts
                    ? `스크랩: ${new Date(ts).toLocaleString('ko-KR', { dateStyle: 'short', timeStyle: 'short' })}`
                    : '스크랩됨'}
                </p>
              </div>
              <Link
                href={`/problems/${p.id}`}
                className="inline-flex shrink-0 items-center justify-center gap-1 self-start rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 type-caption font-semibold text-indigo-600 hover:bg-indigo-50 dark:border-slate-600 dark:bg-slate-800 dark:text-indigo-400 dark:hover:bg-slate-700"
              >
                열기
                <ChevronRight className="h-4 w-4" aria-hidden />
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
}
