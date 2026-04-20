'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';
import { useProblemProgress } from '@/components/ProblemProgressContext';
import { useWrongNote } from '@/components/WrongNoteContext';

type ProblemAnswerCheckProps = {
  problemId: string;
  correctAnswer: number;
  /** false이면 오답 노트에 기록하지 않음 (논술 등) */
  recordWrongToNote?: boolean;
};

/** 단답형: 숫자 입력 후 정답 확인 (오지선다는 보기 카드 클릭으로 처리) */
export function ProblemAnswerCheck({
  problemId,
  correctAnswer,
  recordWrongToNote = true,
}: ProblemAnswerCheckProps) {
  const { markDone } = useProblemProgress();
  const { recordShortWrong } = useWrongNote();
  const [textValue, setTextValue] = useState('');
  const [feedback, setFeedback] = useState<'idle' | 'correct' | 'wrong' | 'invalid'>('idle');

  function resetAll() {
    setTextValue('');
    setFeedback('idle');
  }

  function checkShort() {
    const raw = textValue.trim();
    if (raw === '') {
      setFeedback('invalid');
      return;
    }
    const n = Number(raw);
    if (!Number.isInteger(n) || n < 0 || n > 999) {
      setFeedback('invalid');
      return;
    }
    if (n === correctAnswer) {
      setFeedback('correct');
    } else {
      setFeedback('wrong');
      if (recordWrongToNote) recordShortWrong(problemId, raw);
    }
  }

  useEffect(() => {
    if (feedback === 'correct') markDone(problemId);
  }, [feedback, problemId, markDone]);

  return (
    <div className="not-prose mt-8 border-t border-slate-200 pt-6 dark:border-slate-700">
      <h3 className="type-subhead text-slate-800 dark:text-slate-100 mb-3">정답 확인</h3>
      <p className="type-caption mb-4">단답형입니다. 구한 답을 숫자로 입력한 뒤 확인하세요.</p>

      <div className="space-y-4 max-w-md">
        <input
          id="short-answer-input"
          type="text"
          inputMode="numeric"
          autoComplete="off"
          aria-label="0-999 사이의 정수"
          value={textValue}
          onChange={(e) => {
            setTextValue(e.target.value);
            setFeedback('idle');
          }}
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-500/30 placeholder:text-slate-400 dark:placeholder:text-slate-500"
          placeholder="0-999 사이의 정수"
        />
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={checkShort}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-400"
          >
            답안 제출
          </button>
          <button
            type="button"
            onClick={resetAll}
            className="text-sm font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
          >
            초기화
          </button>
        </div>
      </div>

      {feedback === 'invalid' && (
        <p className="motion-fade-in mt-4 flex items-start gap-2 type-caption text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 dark:text-amber-200 dark:bg-amber-950/40 dark:border-amber-800/60">
          <XCircle className="h-4 w-4 shrink-0 mt-0.5" aria-hidden />
          <span>0 이상 999 이하의 정수를 입력해 주세요.</span>
        </p>
      )}
      {feedback === 'correct' && (
        <p className="motion-fade-in mt-4 flex items-start gap-2 type-caption text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2 dark:text-emerald-200 dark:bg-emerald-950/35 dark:border-emerald-800/50">
          <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" aria-hidden />
          <span>정답입니다.</span>
        </p>
      )}
      {feedback === 'wrong' && (
        <p className="motion-fade-in mt-4 flex items-start gap-2 type-caption text-rose-800 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2 dark:text-rose-200 dark:bg-rose-950/35 dark:border-rose-800/55">
          <XCircle className="h-4 w-4 shrink-0 mt-0.5" aria-hidden />
          <span>오답입니다. 다시 시도해 보세요.</span>
        </p>
      )}
    </div>
  );
}
