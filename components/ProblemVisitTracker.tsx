'use client';

import { useEffect } from 'react';
import { useProblemProgress } from '@/components/ProblemProgressContext';

/** 문제 상세 진입 시 미시도 → 진행 중 반영 (완료는 유지) */
export function ProblemVisitTracker({ problemId }: { problemId: string }) {
  const { hydrated, touchProgress } = useProblemProgress();

  useEffect(() => {
    if (!hydrated) return;
    touchProgress(problemId);
  }, [hydrated, problemId, touchProgress]);

  return null;
}
