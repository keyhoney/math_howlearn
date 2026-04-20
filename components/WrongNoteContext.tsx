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
  WRONG_NOTE_STORAGE_KEY,
  appendMcqWrong,
  appendShortWrong,
  loadWrongNoteMap,
  problemIdsWithWrongNotes,
  saveWrongNoteMap,
  type WrongNoteBucket,
  type WrongNoteEntry,
} from '@/lib/wrong-note';

type WrongNoteContextValue = {
  hydrated: boolean;
  recordMcqWrong: (problemId: string, choice: number) => void;
  recordShortWrong: (problemId: string, value: string) => void;
  getEntries: (problemId: string) => WrongNoteEntry[];
  getProblemIdsWithWrong: () => Set<string>;
};

const WrongNoteContext = createContext<WrongNoteContextValue | null>(null);

export function WrongNoteProvider({ children }: { children: ReactNode }) {
  const [byId, setById] = useState<Record<string, WrongNoteBucket>>({});
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setById(loadWrongNoteMap());
    setHydrated(true);
  }, []);

  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key !== WRONG_NOTE_STORAGE_KEY || e.newValue == null) return;
      try {
        const parsed = JSON.parse(e.newValue) as { byId?: Record<string, WrongNoteBucket> };
        if (parsed?.byId && typeof parsed.byId === 'object') setById({ ...parsed.byId });
      } catch {
        /* ignore */
      }
    }
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const recordMcqWrong = useCallback((problemId: string, choice: number) => {
    setById((prev) => {
      const next = appendMcqWrong(prev, problemId, choice);
      saveWrongNoteMap(next);
      return next;
    });
  }, []);

  const recordShortWrong = useCallback((problemId: string, value: string) => {
    setById((prev) => {
      const next = appendShortWrong(prev, problemId, value);
      saveWrongNoteMap(next);
      return next;
    });
  }, []);

  const getEntries = useCallback(
    (problemId: string): WrongNoteEntry[] => byId[problemId]?.entries ?? [],
    [byId],
  );

  const getProblemIdsWithWrong = useCallback(
    () => problemIdsWithWrongNotes(byId),
    [byId],
  );

  const value = useMemo(
    () => ({
      hydrated,
      recordMcqWrong,
      recordShortWrong,
      getEntries,
      getProblemIdsWithWrong,
    }),
    [hydrated, recordMcqWrong, recordShortWrong, getEntries, getProblemIdsWithWrong],
  );

  return <WrongNoteContext.Provider value={value}>{children}</WrongNoteContext.Provider>;
}

export function useWrongNote(): WrongNoteContextValue {
  const ctx = useContext(WrongNoteContext);
  if (!ctx) {
    throw new Error('useWrongNote는 WrongNoteProvider 안에서만 사용할 수 있습니다.');
  }
  return ctx;
}
