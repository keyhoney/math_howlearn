'use client';

import { useEffect, type ReactNode } from 'react';
import { useExamPractice } from '@/components/ExamPracticeContext';

/** 집중 모드가 꺼져 있을 때만 자식 표시 */
export function WhenNotExamFocus({ children }: { children: ReactNode }) {
  const { enabled } = useExamPractice();
  if (enabled) return null;
  return <>{children}</>;
}

/** 집중 모드가 켜져 있을 때만 자식 표시 */
export function WhenExamFocus({ children }: { children: ReactNode }) {
  const { enabled } = useExamPractice();
  if (!enabled) return null;
  return <>{children}</>;
}

/** 문제 ID가 바뀔 때 경과 시간 초기화(집중 모드일 때) */
export function ExamPracticeProblemTimerSync({ problemId }: { problemId: string }) {
  const { enabled, resetTimer } = useExamPractice();

  useEffect(() => {
    if (enabled) resetTimer();
  }, [problemId, enabled, resetTimer]);

  return null;
}
