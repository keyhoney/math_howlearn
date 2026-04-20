/** 로컬 저장용 문제 풀이 진행 상태 */
export type ProblemProgressStatus = 'none' | 'progress' | 'done';

export const PROBLEM_PROGRESS_STORAGE_KEY = 'gaesaegi-problem-progress' as const;

const STATUS_RANK: Record<ProblemProgressStatus, number> = {
  none: 0,
  progress: 1,
  done: 2,
};

export function mergeProblemProgress(
  current: ProblemProgressStatus | undefined,
  incoming: ProblemProgressStatus,
): ProblemProgressStatus {
  const a = current ?? 'none';
  return STATUS_RANK[incoming] > STATUS_RANK[a] ? incoming : a;
}

type StoredV1 = { v: 1; byId: Record<string, ProblemProgressStatus> };

export function loadProblemProgressMap(): Record<string, ProblemProgressStatus> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(PROBLEM_PROGRESS_STORAGE_KEY);
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

export function saveProblemProgressMap(byId: Record<string, ProblemProgressStatus>): void {
  if (typeof window === 'undefined') return;
  try {
    const payload: StoredV1 = { v: 1, byId };
    localStorage.setItem(PROBLEM_PROGRESS_STORAGE_KEY, JSON.stringify(payload));
  } catch {
    /* ignore quota / private mode */
  }
}

export const PROBLEM_PROGRESS_LABEL: Record<ProblemProgressStatus, string> = {
  none: '미시도',
  progress: '진행 중',
  done: '완료',
};
