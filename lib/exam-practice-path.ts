/** `/problems/[id]` 또는 `/essay-problems/[id]` 문제 상세인지(목록·오답·스크랩 페이지 제외) */

export function isProblemDetailPath(pathname: string | null): boolean {
  if (!pathname) return false;
  const parts = pathname.split('/').filter(Boolean);
  if (parts.length !== 2) return false;
  const [seg, id] = parts;
  if (seg === 'problems') {
    if (id === 'wrong-note' || id === 'bookmarks') return false;
    return true;
  }
  if (seg === 'essay-problems') return true;
  return false;
}
