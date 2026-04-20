'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronDown, ChevronRight, ChevronLeft } from 'lucide-react';
import type { Problem } from '@/data/problem-types';
import { useBookmark } from '@/components/BookmarkContext';
import { AdPlaceholder } from '@/components/AdPlaceholder';
import { FilterSelect, filterSelectClass } from '@/components/FilterSelect';

const PAGE_SIZE_OPTIONS = [10, 30, 50] as const;

function EssayProblemCard({ problem, detailBasePath }: { problem: Problem; detailBasePath: string }) {
  return (
    <Link
      href={`${detailBasePath}/${problem.id}`}
      className="group block book-card bg-white shadow-sm border border-slate-200 transition-all hover:shadow-md hover:border-indigo-300 dark:bg-slate-900/90 dark:border-slate-700 dark:shadow-none dark:hover:border-indigo-500/60"
    >
      <div className="flex flex-row items-start justify-between gap-3 sm:items-center">
        <div className="min-w-0 flex-1 space-y-3">
          <h2 className="type-heading break-words group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
            {problem.source}
          </h2>
          <div className="flex flex-wrap gap-2">
            <span className="type-overline bg-slate-200 text-slate-600 px-2 py-0.5 rounded dark:bg-slate-800 dark:text-slate-300">
              시행 {problem.examDate.year}년
            </span>
            <span className="type-overline bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded normal-case tracking-normal font-bold dark:bg-indigo-950/60 dark:text-indigo-300">
              대학 {problem.topic.subject}
            </span>
          </div>
        </div>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-slate-50 text-slate-400 transition-colors group-hover:bg-indigo-50 group-hover:text-indigo-600 dark:bg-slate-800/80 dark:group-hover:bg-indigo-950/50 dark:text-slate-500 dark:group-hover:text-indigo-400">
          <ChevronRight className="h-5 w-5" aria-hidden />
        </div>
      </div>
    </Link>
  );
}

type EssayProblemsListProps = {
  problems: Problem[];
  title?: string;
  lead?: string;
  problemBasePath?: string;
};

const DEFAULT_TITLE = '논술 기출 문제';
const DEFAULT_LEAD =
  '시행연도와 대학명으로 문제를 골라 풀 수 있습니다. 스크랩은 이 브라우저에만 저장됩니다.';

export function EssayProblemsList({
  problems,
  title = DEFAULT_TITLE,
  lead = DEFAULT_LEAD,
  problemBasePath = '/essay-problems',
}: EssayProblemsListProps) {
  const { getBookmarkedIds } = useBookmark();
  const [year, setYear] = useState('');
  const [university, setUniversity] = useState('');
  const [bookmarkOnlyFilter, setBookmarkOnlyFilter] = useState(false);
  const [pageSize, setPageSize] = useState<(typeof PAGE_SIZE_OPTIONS)[number]>(10);
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [year, university, pageSize, bookmarkOnlyFilter]);

  const years = useMemo(
    () => [...new Set(problems.map((p) => p.examDate.year))].sort((a, b) => b - a),
    [problems],
  );

  const universities = useMemo(() => {
    let list = problems;
    if (year !== '') {
      const y = Number(year);
      list = list.filter((p) => p.examDate.year === y);
    }
    return [...new Set(list.map((p) => p.topic.subject))].sort((a, b) => a.localeCompare(b, 'ko'));
  }, [problems, year]);

  const filteredByMeta = useMemo(() => {
    return problems.filter((p) => {
      if (year !== '' && p.examDate.year !== Number(year)) return false;
      if (university !== '' && p.topic.subject !== university) return false;
      return true;
    });
  }, [problems, year, university]);

  const bookmarkIdSet = useMemo(() => getBookmarkedIds(), [getBookmarkedIds]);

  const activeList = useMemo(() => {
    if (!bookmarkOnlyFilter) return filteredByMeta;
    return filteredByMeta.filter((p) => bookmarkIdSet.has(p.id));
  }, [filteredByMeta, bookmarkOnlyFilter, bookmarkIdSet]);

  const totalCount = activeList.length;
  const totalPages = totalCount === 0 ? 0 : Math.ceil(totalCount / pageSize);
  const safePage = totalPages === 0 ? 1 : Math.min(page, totalPages);
  const pageOffset = (safePage - 1) * pageSize;
  const pageItems = activeList.slice(pageOffset, pageOffset + pageSize);

  useEffect(() => {
    if (totalPages > 0 && page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const showFilterEmpty =
    problems.length > 0 && filteredByMeta.length === 0 && (year !== '' || university !== '');

  const showBookmarkOnlyEmpty =
    problems.length > 0 &&
    filteredByMeta.length > 0 &&
    bookmarkOnlyFilter &&
    activeList.length === 0;

  return (
    <div className="space-y-10">
      <div>
        <h1 className="type-article-title mb-3">{title}</h1>
        <p className="type-lead max-w-2xl">{lead}</p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-[0_2px_8px_-2px_rgba(15,23,42,0.06),0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-900/[0.03] dark:border-slate-700/85 dark:bg-slate-900/95 dark:shadow-none dark:ring-white/[0.04]">
        <div className="border-b border-indigo-100/80 bg-gradient-to-br from-indigo-50/90 via-white to-slate-50/40 px-5 py-4 sm:px-6 sm:py-5 dark:border-indigo-950/40 dark:from-indigo-950/35 dark:via-slate-950 dark:to-slate-900/80">
          <h2 className="type-heading text-slate-900 dark:text-slate-50">필터</h2>
          <p className="mt-1 max-w-xl type-caption leading-relaxed text-slate-600 dark:text-slate-400">
            시행연도와 대학명으로 목록을 좁힐 수 있습니다. 스크랩은 이 기기 브라우저에만 저장됩니다.
          </p>
        </div>

        <div className="space-y-6 p-5 sm:p-6">
          <section
            className="rounded-2xl bg-slate-50/90 px-4 py-5 ring-1 ring-slate-200/60 dark:bg-slate-800/35 dark:ring-slate-700/50 sm:px-5"
            aria-label="시행연도·대학명 필터"
          >
            <p className="mb-4 text-xs font-semibold text-slate-700 dark:text-slate-300">시행연도 · 대학명</p>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-4">
              <FilterSelect
                id="essay-filter-year"
                label="시행연도"
                value={year}
                onChange={(e) => {
                  setYear(e.target.value);
                  setUniversity('');
                }}
              >
                <option value="">전체</option>
                {years.map((y) => (
                  <option key={y} value={String(y)}>
                    {y}년
                  </option>
                ))}
              </FilterSelect>
              <FilterSelect id="essay-filter-university" label="대학명" value={university} onChange={(e) => setUniversity(e.target.value)}>
                <option value="">전체</option>
                {universities.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </FilterSelect>
            </div>
          </section>

          <section
            className="rounded-2xl border border-slate-200/70 bg-white/80 px-4 py-5 dark:border-slate-700/55 dark:bg-slate-950/40 sm:px-5"
            aria-label="스크랩 필터"
          >
            <label className="flex min-h-[48px] cursor-pointer items-center gap-3 rounded-xl border border-slate-200/80 bg-slate-50/50 px-4 py-3.5 type-caption font-medium text-slate-800 transition-colors hover:border-indigo-200/90 hover:bg-indigo-50/40 dark:border-slate-700/60 dark:bg-slate-900/40 dark:text-slate-200 dark:hover:border-indigo-500/35 dark:hover:bg-indigo-950/25">
              <input
                type="checkbox"
                checked={bookmarkOnlyFilter}
                onChange={(e) => setBookmarkOnlyFilter(e.target.checked)}
                className="h-5 w-5 shrink-0 rounded-md border-slate-300 text-indigo-600 shadow-sm focus:ring-2 focus:ring-indigo-500/30 dark:border-slate-600 dark:bg-slate-900"
              />
              스크랩한 문제만 보기
            </label>
            <div className="mt-4 border-t border-slate-200/60 pt-4 dark:border-slate-700/50">
              <Link
                href="/problems/bookmarks"
                className="inline-flex min-h-[44px] items-center gap-1.5 rounded-lg px-2 py-1.5 type-caption font-semibold text-indigo-600 transition-colors hover:bg-indigo-50 hover:text-indigo-700 dark:text-indigo-400 dark:hover:bg-indigo-950/50 dark:hover:text-indigo-300"
              >
                스크랩 모아보기
                <ArrowRight className="h-3.5 w-3.5" aria-hidden />
              </Link>
            </div>
          </section>
        </div>
      </div>

      <AdPlaceholder region="essay-problems-list" variant="inline" className="my-0" />

      {problems.length === 0 && (
        <div className="text-center py-20 type-body text-slate-500">등록된 문제가 없습니다.</div>
      )}

      {showFilterEmpty && (
        <p className="text-center type-caption text-slate-500">선택한 시행연도·대학 조건에 맞는 문제가 없습니다.</p>
      )}

      {showBookmarkOnlyEmpty && (
        <p className="text-center type-caption text-slate-500">
          스크랩이 비어 있거나, 현재 필터와 겹치는 문제가 없습니다.
        </p>
      )}

      {problems.length > 0 && activeList.length > 0 && (
        <div className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="type-caption text-slate-600">
              전체 <span className="font-semibold text-slate-800 dark:text-slate-100">{totalCount}</span>개 중{' '}
              <span className="font-semibold text-slate-800 dark:text-slate-100">
                {pageOffset + 1}–{Math.min(pageOffset + pageSize, totalCount)}
              </span>
              번째
            </p>
            <div className="flex items-center gap-2">
              <label htmlFor="essay-page-size" className="type-caption font-medium text-slate-500 shrink-0">
                페이지당 보기
              </label>
              <div className="relative">
                <select
                  id="essay-page-size"
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value) as (typeof PAGE_SIZE_OPTIONS)[number])}
                  className={`${filterSelectClass} w-auto min-w-[5.5rem] pr-9 sm:min-w-0`}
                >
                  {PAGE_SIZE_OPTIONS.map((n) => (
                    <option key={n} value={n}>
                      {n}개
                    </option>
                  ))}
                </select>
                <ChevronDown
                  className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 opacity-80 dark:text-slate-500"
                  aria-hidden
                />
              </div>
            </div>
          </div>

          <div className="grid gap-6">
            {pageItems.map((problem) => (
              <EssayProblemCard key={problem.id} problem={problem} detailBasePath={problemBasePath} />
            ))}
          </div>

          {totalPages > 1 && (
            <nav
              className="flex flex-col items-center gap-3 pt-2 sm:flex-row sm:justify-center sm:gap-4"
              aria-label="논술 문제 목록 페이지"
            >
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={safePage <= 1}
                  className="inline-flex min-h-[44px] min-w-[44px] touch-manipulation items-center justify-center gap-1 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 disabled:pointer-events-none disabled:opacity-40 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  <ChevronLeft className="h-4 w-4" aria-hidden />
                  이전
                </button>
                <span className="min-w-[5.5rem] text-center text-sm tabular-nums text-slate-600">
                  {safePage} / {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={safePage >= totalPages}
                  className="inline-flex min-h-[44px] min-w-[44px] touch-manipulation items-center justify-center gap-1 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 disabled:pointer-events-none disabled:opacity-40 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  다음
                  <ChevronRight className="h-4 w-4" aria-hidden />
                </button>
              </div>
            </nav>
          )}
        </div>
      )}
    </div>
  );
}
