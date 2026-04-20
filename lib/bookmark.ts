/** 스크랩(북마크) — 어려운 문제를 로컬에 모아 두는 컬렉션 */

export const BOOKMARK_STORAGE_KEY = 'gaesaegi-bookmarks' as const;

export type BookmarkEntry = { ts: number };

type StoredV1 = { v: 1; byId: Record<string, BookmarkEntry> };

export function loadBookmarkMap(): Record<string, BookmarkEntry> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(BOOKMARK_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (
      parsed &&
      typeof parsed === 'object' &&
      'v' in parsed &&
      (parsed as StoredV1).v === 1 &&
      'byId' in parsed &&
      typeof (parsed as StoredV1).byId === 'object' &&
      (parsed as StoredV1).byId !== null
    ) {
      return { ...(parsed as StoredV1).byId };
    }
    return {};
  } catch {
    return {};
  }
}

export function saveBookmarkMap(byId: Record<string, BookmarkEntry>): void {
  if (typeof window === 'undefined') return;
  try {
    const payload: StoredV1 = { v: 1, byId: { ...byId } };
    localStorage.setItem(BOOKMARK_STORAGE_KEY, JSON.stringify(payload));
  } catch {
    /* ignore */
  }
}

export function toggleBookmark(
  byId: Record<string, BookmarkEntry>,
  problemId: string,
): Record<string, BookmarkEntry> {
  const next = { ...byId };
  if (next[problemId]) {
    delete next[problemId];
  } else {
    next[problemId] = { ts: Date.now() };
  }
  return next;
}

export function problemIdsBookmarked(byId: Record<string, BookmarkEntry>): Set<string> {
  return new Set(Object.keys(byId));
}
