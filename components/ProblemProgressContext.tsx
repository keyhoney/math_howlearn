'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  PROBLEM_PROGRESS_STORAGE_KEY,
  loadProblemProgressMap,
  mergeProblemProgress,
  saveProblemProgressMap,
  type ProblemProgressStatus,
} from '@/lib/problem-progress';

type ProblemProgressContextValue = {
  /** localStorage 하이드레이션 완료 여부 */
  hydrated: boolean;
  getStatus: (problemId: string) => ProblemProgressStatus;
  touchProgress: (problemId: string) => void;
  markDone: (problemId: string) => void;
};

const ProblemProgressContext = createContext<ProblemProgressContextValue | null>(null);

export function ProblemProgressProvider({ children }: { children: ReactNode }) {
  const [byId, setById] = useState<Record<string, ProblemProgressStatus>>({});
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setById(loadProblemProgressMap());
    setHydrated(true);
  }, []);

  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key !== PROBLEM_PROGRESS_STORAGE_KEY || e.newValue == null) return;
      try {
        const parsed = JSON.parse(e.newValue) as { byId?: Record<string, ProblemProgressStatus> };
        if (parsed?.byId && typeof parsed.byId === 'object') setById({ ...parsed.byId });
      } catch {
        /* ignore */
      }
    }
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const getStatus = useCallback(
    (problemId: string): ProblemProgressStatus => byId[problemId] ?? 'none',
    [byId],
  );

  const touchProgress = useCallback((problemId: string) => {
    setById((prev) => {
      const merged = mergeProblemProgress(prev[problemId], 'progress');
      if (merged === (prev[problemId] ?? 'none')) return prev;
      const next = { ...prev, [problemId]: merged };
      saveProblemProgressMap(next);
      return next;
    });
  }, []);

  const markDone = useCallback((problemId: string) => {
    setById((prev) => {
      const merged = mergeProblemProgress(prev[problemId], 'done');
      if (merged === (prev[problemId] ?? 'none')) return prev;
      const next = { ...prev, [problemId]: merged };
      saveProblemProgressMap(next);
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({ hydrated, getStatus, touchProgress, markDone }),
    [hydrated, getStatus, touchProgress, markDone],
  );

  return <ProblemProgressContext.Provider value={value}>{children}</ProblemProgressContext.Provider>;
}

export function useProblemProgress(): ProblemProgressContextValue {
  const ctx = useContext(ProblemProgressContext);
  if (!ctx) {
    throw new Error('useProblemProgress는 ProblemProgressProvider 안에서만 사용할 수 있습니다.');
  }
  return ctx;
}
