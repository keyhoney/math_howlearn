'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';
import { useProblemProgress } from '@/components/ProblemProgressContext';
import { useWrongNote } from '@/components/WrongNoteContext';

export type McqFeedback = 'idle' | 'correct' | 'wrong';

export type ProblemMcqContextValue = {
  correctAnswer: number;
  lastChoice: number | null;
  feedback: McqFeedback;
  onChoiceClick: (choice: number) => void;
  reset: () => void;
};

const ProblemMcqContext = createContext<ProblemMcqContextValue | null>(null);

export function useProblemMcq(): ProblemMcqContextValue | null {
  return useContext(ProblemMcqContext);
}

type ProblemMcqProviderProps = {
  children: ReactNode;
  enabled: boolean;
  correctAnswer: number;
  problemId: string;
  /** false이면 오답 노트에 기록하지 않음 (논술 등) */
  recordWrongToNote?: boolean;
};

export function ProblemMcqProvider({
  children,
  enabled,
  correctAnswer,
  problemId,
  recordWrongToNote = true,
}: ProblemMcqProviderProps) {
  const { recordMcqWrong } = useWrongNote();
  const [lastChoice, setLastChoice] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<McqFeedback>('idle');

  const onChoiceClick = useCallback(
    (choice: number) => {
      setLastChoice(choice);
      const ok = choice === correctAnswer;
      setFeedback(ok ? 'correct' : 'wrong');
      if (!ok && enabled && recordWrongToNote) recordMcqWrong(problemId, choice);
    },
    [correctAnswer, enabled, problemId, recordMcqWrong, recordWrongToNote],
  );

  const reset = useCallback(() => {
    setLastChoice(null);
    setFeedback('idle');
  }, []);

  const value = useMemo<ProblemMcqContextValue | null>(() => {
    if (!enabled) return null;
    return { correctAnswer, lastChoice, feedback, onChoiceClick, reset };
  }, [enabled, correctAnswer, lastChoice, feedback, onChoiceClick, reset]);

  return <ProblemMcqContext.Provider value={value}>{children}</ProblemMcqContext.Provider>;
}

/** 오지선다: 카드 클릭 채점 후 안내·초기화 (중복 번호 버튼 없음) */
export function ProblemMcqAnswerBar({ problemId }: { problemId: string }) {
  const ctx = useProblemMcq();
  const { markDone } = useProblemProgress();
  if (!ctx) return null;

  const { feedback, reset, lastChoice } = ctx;
  const showReset = lastChoice !== null;

  useEffect(() => {
    if (feedback === 'correct') markDone(problemId);
  }, [feedback, problemId, markDone]);

  return (
    <div className="not-prose mt-8 border-t border-slate-200 pt-6 dark:border-slate-700">
      <h3 className="type-subhead text-slate-800 dark:text-slate-100 mb-2">정답 확인</h3>
      <p className="type-caption mb-4">위 보기 카드를 누르면 바로 정답 여부를 확인할 수 있습니다.</p>

      {showReset && (
        <button
          type="button"
          onClick={reset}
          className="mb-4 type-caption font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
        >
          초기화
        </button>
      )}

      {feedback === 'correct' && (
        <p className="motion-fade-in flex items-start gap-2 type-caption text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2 dark:text-emerald-200 dark:bg-emerald-950/35 dark:border-emerald-800/50">
          <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" aria-hidden />
          <span>정답입니다.</span>
        </p>
      )}
      {feedback === 'wrong' && (
        <p className="motion-fade-in flex items-start gap-2 type-caption text-rose-800 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2 dark:text-rose-200 dark:bg-rose-950/35 dark:border-rose-800/55">
          <XCircle className="h-4 w-4 shrink-0 mt-0.5" aria-hidden />
          <span>오답입니다. 다른 보기를 눌러 다시 확인해 보세요.</span>
        </p>
      )}
    </div>
  );
}
