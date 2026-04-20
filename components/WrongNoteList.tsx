'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import type { Problem } from '@/data/problems';
import { formatWrongNoteLine } from '@/lib/wrong-note';
import { useWrongNote } from '@/components/WrongNoteContext';

export function WrongNoteList({ problems }: { problems: Problem[] }) {
  const { hydrated, getProblemIdsWithWrong, getEntries } = useWrongNote();

  const wrongIds = getProblemIdsWithWrong();

  const listed = useMemo(() => {
    const withWrong = problems.filter((p) => wrongIds.has(p.id));
    return withWrong.sort((a, b) => {
      const ta = Math.max(0, ...getEntries(a.id).map((e) => e.ts));
      const tb = Math.max(0, ...getEntries(b.id).map((e) => e.ts));
      return tb - ta;
    });
  }, [problems, wrongIds, getEntries]);

  if (!hydrated) {
    return <p className="type-caption text-slate-500">오답 기록을 불러오는 중…</p>;
  }

  if (listed.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-8 text-center type-body text-slate-600 dark:border-slate-700 dark:bg-slate-900/90 dark:text-slate-400">
        아직 기록된 오답이 없습니다. 문제에서 틀린 보기를 고르거나 단답을 제출하면 여기에 쌓입니다.
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {listed.map((p) => {
        const entries = getEntries(p.id);
        return (
          <div
            key={p.id}
            className="book-card--compact rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900/90 dark:shadow-none"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0 space-y-2">
                <h2 className="type-subhead text-slate-800 dark:text-slate-100">{p.source}</h2>
                <ul className="type-caption space-y-1.5 text-slate-600 dark:text-slate-400">
                  {entries.map((e, i) => (
                    <li key={`${e.ts}-${i}`} className="flex flex-wrap gap-x-2 gap-y-0.5">
                      <span className="font-medium text-slate-700 dark:text-slate-300">
                        {formatWrongNoteLine(e)}
                      </span>
                      <span className="text-slate-400 dark:text-slate-500 tabular-nums">
                        {new Date(e.ts).toLocaleString('ko-KR', {
                          dateStyle: 'short',
                          timeStyle: 'short',
                        })}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              <Link
                href={`/problems/${p.id}`}
                className="inline-flex shrink-0 items-center justify-center gap-1 self-start rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 type-caption font-semibold text-indigo-600 hover:bg-indigo-50 dark:border-slate-600 dark:bg-slate-800 dark:text-indigo-400 dark:hover:bg-slate-700"
              >
                다시 풀기
                <ChevronRight className="h-4 w-4" aria-hidden />
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
}
