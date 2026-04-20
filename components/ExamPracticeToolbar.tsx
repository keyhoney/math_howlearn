'use client';

import { Timer, Pause, Play, Focus } from 'lucide-react';
import { useExamPractice } from '@/components/ExamPracticeContext';

function formatElapsed(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function ExamPracticeToolbar({ problemLabel }: { problemLabel: string }) {
  const {
    enabled,
    toggleEnabled,
    setEnabled,
    elapsedSec,
    isPaused,
    pause,
    resume,
  } = useExamPractice();

  return (
    <div
      className={
        enabled
          ? 'sticky top-0 z-40 -mx-4 mb-6 border-b border-slate-200/90 bg-slate-50/95 px-4 py-3 shadow-sm backdrop-blur-md dark:border-slate-700 dark:bg-slate-950/90 sm:-mx-0 sm:rounded-b-lg sm:rounded-t-xl sm:border sm:border-slate-200 sm:dark:border-slate-700'
          : 'mb-6 rounded-xl border border-dashed border-slate-200 bg-white/80 px-4 py-3 dark:border-slate-600 dark:bg-slate-900/50'
      }
      role="region"
      aria-label="수능 연습·집중 모드"
    >
      {!enabled ? (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="type-caption text-slate-600 dark:text-slate-400">
            시험장처럼 방해 요소를 줄이고 경과 시간만 보려면 모드를 켜세요.
          </p>
          <button
            type="button"
            onClick={toggleEnabled}
            className="inline-flex min-h-[44px] w-full shrink-0 touch-manipulation items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 type-caption font-semibold text-white shadow-sm hover:bg-indigo-700 sm:w-auto dark:bg-indigo-500 dark:hover:bg-indigo-400"
          >
            <Focus className="h-4 w-4" aria-hidden />
            집중 모드 켜기
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 flex-wrap items-center gap-x-4 gap-y-1">
            <span className="inline-flex items-center gap-1.5 type-caption font-semibold text-slate-800 dark:text-slate-100">
              <Timer className="h-4 w-4 shrink-0 text-indigo-600 dark:text-indigo-400" aria-hidden />
              <span className="tabular-nums tracking-tight">{formatElapsed(elapsedSec)}</span>
              {isPaused && (
                <span className="font-normal text-amber-700 dark:text-amber-300">· 일시정지</span>
              )}
            </span>
            <span className="type-caption truncate text-slate-500 dark:text-slate-400" title={problemLabel}>
              {problemLabel}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {isPaused ? (
              <button
                type="button"
                onClick={resume}
                className="inline-flex min-h-[44px] touch-manipulation items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2 type-caption font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                <Play className="h-4 w-4" aria-hidden />
                재개
              </button>
            ) : (
              <button
                type="button"
                onClick={pause}
                className="inline-flex min-h-[44px] touch-manipulation items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2 type-caption font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                <Pause className="h-4 w-4" aria-hidden />
                일시정지
              </button>
            )}
            <button
              type="button"
              onClick={() => setEnabled(false)}
              className="min-h-[44px] touch-manipulation rounded-lg border border-slate-200 bg-slate-100 px-4 py-2 type-caption font-semibold text-slate-700 hover:bg-slate-200 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              모드 끄기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
