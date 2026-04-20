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
  BOOKMARK_STORAGE_KEY,
  loadBookmarkMap,
  problemIdsBookmarked,
  saveBookmarkMap,
  toggleBookmark,
  type BookmarkEntry,
} from '@/lib/bookmark';

type BookmarkContextValue = {
  hydrated: boolean;
  isBookmarked: (problemId: string) => boolean;
  toggle: (problemId: string) => void;
  getBookmarkedIds: () => Set<string>;
  getBookmarkTs: (problemId: string) => number | undefined;
};

const BookmarkContext = createContext<BookmarkContextValue | null>(null);

export function BookmarkProvider({ children }: { children: ReactNode }) {
  const [byId, setById] = useState<Record<string, BookmarkEntry>>({});
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setById(loadBookmarkMap());
    setHydrated(true);
  }, []);

  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key !== BOOKMARK_STORAGE_KEY || e.newValue == null) return;
      try {
        const parsed = JSON.parse(e.newValue) as { byId?: Record<string, BookmarkEntry> };
        if (parsed?.byId && typeof parsed.byId === 'object') setById({ ...parsed.byId });
      } catch {
        /* ignore */
      }
    }
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const toggle = useCallback((problemId: string) => {
    setById((prev) => {
      const next = toggleBookmark(prev, problemId);
      saveBookmarkMap(next);
      return next;
    });
  }, []);

  const isBookmarked = useCallback(
    (problemId: string) => Boolean(byId[problemId]),
    [byId],
  );

  const getBookmarkedIds = useCallback(() => problemIdsBookmarked(byId), [byId]);

  const getBookmarkTs = useCallback(
    (problemId: string) => byId[problemId]?.ts,
    [byId],
  );

  const value = useMemo(
    () => ({
      hydrated,
      isBookmarked,
      toggle,
      getBookmarkedIds,
      getBookmarkTs,
    }),
    [hydrated, isBookmarked, toggle, getBookmarkedIds, getBookmarkTs],
  );

  return <BookmarkContext.Provider value={value}>{children}</BookmarkContext.Provider>;
}

export function useBookmark(): BookmarkContextValue {
  const ctx = useContext(BookmarkContext);
  if (!ctx) {
    throw new Error('useBookmark는 BookmarkProvider 안에서만 사용할 수 있습니다.');
  }
  return ctx;
}
