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
import { usePathname } from 'next/navigation';
import { isProblemDetailPath } from '@/lib/exam-practice-path';

type ExamPracticeContextValue = {
  enabled: boolean;
  setEnabled: (v: boolean) => void;
  toggleEnabled: () => void;
  elapsedSec: number;
  isPaused: boolean;
  pause: () => void;
  resume: () => void;
  resetTimer: () => void;
};

const ExamPracticeContext = createContext<ExamPracticeContextValue | null>(null);

export function ExamPracticeProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const onDetail = isProblemDetailPath(pathname);

  const [enabled, setEnabledState] = useState(false);
  const [elapsedSec, setElapsedSec] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (!onDetail) setEnabledState(false);
  }, [onDetail]);

  useEffect(() => {
    const active = enabled && onDetail;
    if (active) document.body.classList.add('exam-focus-active');
    else document.body.classList.remove('exam-focus-active');
    return () => document.body.classList.remove('exam-focus-active');
  }, [enabled, onDetail]);

  useEffect(() => {
    if (!enabled || !onDetail || isPaused) return;
    const id = window.setInterval(() => setElapsedSec((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [enabled, onDetail, isPaused]);

  useEffect(() => {
    if (enabled) {
      setElapsedSec(0);
      setIsPaused(false);
    }
  }, [enabled]);

  const setEnabled = useCallback((v: boolean) => {
    setEnabledState(v);
  }, []);

  const toggleEnabled = useCallback(() => {
    setEnabledState((p) => !p);
  }, []);

  const pause = useCallback(() => setIsPaused(true), []);
  const resume = useCallback(() => setIsPaused(false), []);

  const resetTimer = useCallback(() => {
    setElapsedSec(0);
    setIsPaused(false);
  }, []);

  const value = useMemo(
    () => ({
      enabled,
      setEnabled,
      toggleEnabled,
      elapsedSec,
      isPaused,
      pause,
      resume,
      resetTimer,
    }),
    [enabled, setEnabled, toggleEnabled, elapsedSec, isPaused, pause, resume, resetTimer],
  );

  return <ExamPracticeContext.Provider value={value}>{children}</ExamPracticeContext.Provider>;
}

export function useExamPractice(): ExamPracticeContextValue {
  const ctx = useContext(ExamPracticeContext);
  if (!ctx) {
    throw new Error('useExamPractice는 ExamPracticeProvider 안에서만 사용할 수 있습니다.');
  }
  return ctx;
}
