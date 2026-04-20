/** 오답 노트 (로컬 저장) */

export const WRONG_NOTE_STORAGE_KEY = 'gaesaegi-wrong-note' as const;

/** 문제당 보관하는 최대 기록 수 (로컬 용량 과다 방지) */
export const WRONG_NOTE_MAX_PER_PROBLEM = 40;

export type WrongNoteMcqEntry = { t: 'mcq'; choice: number; ts: number };
export type WrongNoteShortEntry = { t: 'short'; value: string; ts: number };
export type WrongNoteEntry = WrongNoteMcqEntry | WrongNoteShortEntry;

export type WrongNoteBucket = { entries: WrongNoteEntry[] };

type StoredV1 = { v: 1; byId: Record<string, WrongNoteBucket> };

const CIRCLED = ['', '①', '②', '③', '④', '⑤'] as const;

export function formatWrongNoteLine(e: WrongNoteEntry): string {
  if (e.t === 'mcq') {
    const lab = CIRCLED[e.choice] ?? `${e.choice}번`;
    return `객관식 ${lab} 선택`;
  }
  return `단답 "${e.value}"`;
}

export function loadWrongNoteMap(): Record<string, WrongNoteBucket> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(WRONG_NOTE_STORAGE_KEY);
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
      return pruneEmptyBuckets({ ...(parsed as StoredV1).byId });
    }
    return {};
  } catch {
    return {};
  }
}

function pruneEmptyBuckets(byId: Record<string, WrongNoteBucket>): Record<string, WrongNoteBucket> {
  const out: Record<string, WrongNoteBucket> = {};
  for (const [id, b] of Object.entries(byId)) {
    if (b?.entries?.length) out[id] = { entries: [...b.entries] };
  }
  return out;
}

export function saveWrongNoteMap(byId: Record<string, WrongNoteBucket>): void {
  if (typeof window === 'undefined') return;
  try {
    const cleaned = pruneEmptyBuckets(byId);
    const payload: StoredV1 = { v: 1, byId: cleaned };
    localStorage.setItem(WRONG_NOTE_STORAGE_KEY, JSON.stringify(payload));
  } catch {
    /* ignore */
  }
}

export function appendMcqWrong(
  byId: Record<string, WrongNoteBucket>,
  problemId: string,
  choice: number,
): Record<string, WrongNoteBucket> {
  const prev = byId[problemId]?.entries ?? [];
  const nextEntries = [
    ...prev,
    { t: 'mcq' as const, choice, ts: Date.now() },
  ].slice(-WRONG_NOTE_MAX_PER_PROBLEM);
  return { ...byId, [problemId]: { entries: nextEntries } };
}

export function appendShortWrong(
  byId: Record<string, WrongNoteBucket>,
  problemId: string,
  value: string,
): Record<string, WrongNoteBucket> {
  const prev = byId[problemId]?.entries ?? [];
  const nextEntries = [
    ...prev,
    { t: 'short' as const, value, ts: Date.now() },
  ].slice(-WRONG_NOTE_MAX_PER_PROBLEM);
  return { ...byId, [problemId]: { entries: nextEntries } };
}

export function problemIdsWithWrongNotes(byId: Record<string, WrongNoteBucket>): Set<string> {
  return new Set(
    Object.entries(byId)
      .filter(([, b]) => (b?.entries?.length ?? 0) > 0)
      .map(([id]) => id),
  );
}
