'use client';

import type { ReactNode } from 'react';
import { useProblemMcq } from '@/components/ProblemMcqInteraction';

const LABEL_TO_CHOICE: Record<string, number> = {
  '①': 1,
  '②': 2,
  '③': 3,
  '④': 4,
  '⑤': 5,
};

const baseClass =
  'flex min-h-[3rem] w-full flex-row items-stretch rounded-lg border px-3 py-3 text-left shadow-sm ' +
  'text-slate-800 dark:text-slate-100 ' +
  'bg-gradient-to-b from-white to-slate-50/90 dark:from-slate-800/95 dark:to-slate-900/95 ' +
  'transition-colors';

/** 오지선다 한 칸: 왼쪽에 ①~⑤ 고정, 오른쪽 영역에 보기 내용만 중앙 정렬 */
export function McqChoiceItem({ label, children }: { label: string; children?: ReactNode }) {
  const ctx = useProblemMcq();
  const choice = LABEL_TO_CHOICE[label];
  const interactive = Boolean(ctx && choice !== undefined);

  const isLast = interactive && ctx!.lastChoice === choice;
  const fb = interactive ? ctx!.feedback : 'idle';

  let stateClass = 'border-slate-200 dark:border-slate-600';
  if (interactive) {
    stateClass =
      'cursor-pointer border-slate-200 dark:border-slate-600 ' +
      'hover:border-indigo-300 hover:bg-indigo-50/30 ' +
      'dark:hover:border-indigo-400/65 dark:hover:bg-indigo-500/10 ' +
      'focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 dark:focus-visible:ring-indigo-500 ' +
      'focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-950';
    if (isLast && fb === 'correct') {
      stateClass =
        'cursor-pointer border-emerald-500 bg-emerald-50/60 ring-1 ring-emerald-400/50 ' +
        'dark:border-emerald-500/80 dark:bg-emerald-950/45 dark:ring-emerald-500/35 ' +
        'focus-visible:ring-emerald-500';
    } else if (isLast && fb === 'wrong') {
      stateClass =
        'cursor-pointer border-rose-400 bg-rose-50/50 ring-1 ring-rose-300/50 ' +
        'dark:border-rose-400/85 dark:bg-rose-950/40 dark:ring-rose-500/30 ' +
        'focus-visible:ring-rose-500';
    }
  }

  const inner = (
    <>
      <span
        className="flex w-9 shrink-0 select-none items-center justify-start font-serif text-lg leading-none text-slate-500 dark:text-slate-400"
        aria-hidden
      >
        {label}
      </span>
      <div
        className={
          'flex min-w-0 flex-1 items-center justify-center text-center leading-snug pointer-events-none ' +
          '[&_.katex]:text-[1.05em] [&_p]:mb-0'
        }
      >
        {children}
      </div>
    </>
  );

  if (interactive && choice !== undefined) {
    return (
      <button
        type="button"
        className={`${baseClass} ${stateClass}`}
        aria-pressed={isLast}
        onClick={() => ctx!.onChoiceClick(choice)}
      >
        {inner}
      </button>
    );
  }

  return <div className={`${baseClass} ${stateClass}`}>{inner}</div>;
}
