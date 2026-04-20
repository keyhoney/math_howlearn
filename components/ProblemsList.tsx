'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  CalendarDays,
  BookOpen,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Star,
} from 'lucide-react';
import type { Problem } from '@/data/problem-types';
import {
  PROBLEM_PROGRESS_LABEL,
  type ProblemProgressStatus,
} from '@/lib/problem-progress';
import { useProblemProgress } from '@/components/ProblemProgressContext';
import { useWrongNote } from '@/components/WrongNoteContext';
import { useBookmark } from '@/components/BookmarkContext';
import { AdPlaceholder } from '@/components/AdPlaceholder';
import { FilterSelect, filterSelectClass } from '@/components/FilterSelect';

const PAGE_SIZE_OPTIONS = [10, 30, 50] as const;

interface ProblemsListProps {
  problems: Problem[];
  /** 기본: 수능 기출 문제 */
  title?: string;
  /** 목록 상단 설명 */
  lead?: string;
  /** 문제 상세 경로 접두어 (기본 `/problems`) */
  problemBasePath?: string;
}

const progressBadgeClass: Record<ProblemProgressStatus, string> = {
  none:
    'border-slate-200 bg-slate-100 text-slate-600 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-400',
  progress:
    'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800/50 dark:bg-amber-950/45 dark:text-amber-200',
  done:
    'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800/50 dark:bg-emerald-950/40 dark:text-emerald-200',
};

function ProblemCard({ problem, detailBasePath }: { problem: Problem; detailBasePath: string }) {
  const { getStatus } = useProblemProgress();
  const st = getStatus(problem.id);

  return (
    <Link
      href={`${detailBasePath}/${problem.id}`}
      className="group block book-card bg-white shadow-sm border border-slate-200 transition-all hover:shadow-md hover:border-indigo-300 dark:bg-slate-900/90 dark:border-slate-700 dark:shadow-none dark:hover:border-indigo-500/60"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-3 min-w-0">
          <div className="flex flex-wrap items-center gap-2 gap-y-2">
            <h2 className="type-heading group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              {problem.source}
            </h2>
            <span
              className={`type-overline shrink-0 rounded border px-2 py-0.5 normal-case tracking-normal font-bold ${progressBadgeClass[st]}`}
            >
              {PROBLEM_PROGRESS_LABEL[st]}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {problem.examDate.type === '논술' ? (
              <>
                <span className="type-overline bg-slate-200 text-slate-600 px-2 py-0.5 rounded dark:bg-slate-800 dark:text-slate-300">
                  시행 {problem.examDate.year}년
                </span>
                <span className="type-overline bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded normal-case tracking-normal font-bold dark:bg-indigo-950/60 dark:text-indigo-300">
                  대학 {problem.topic.subject}
                </span>
              </>
            ) : (
              <>
                <span className="type-overline bg-slate-200 text-slate-600 px-2 py-0.5 rounded dark:bg-slate-800 dark:text-slate-300">
                  {problem.examDate.year}년 {problem.examDate.month}월 {problem.examDate.type}
                </span>
                <span className="type-overline bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded normal-case tracking-normal font-bold dark:bg-indigo-950/60 dark:text-indigo-300">
                  {problem.topic.subject} &gt; {problem.topic.chapter} &gt; {problem.topic.concept}
                </span>
              </>
            )}
            <span
              className="type-overline inline-flex items-center gap-0.5 bg-orange-50 text-orange-700 px-2 py-0.5 rounded normal-case tracking-normal font-bold dark:bg-orange-950/40 dark:text-orange-300"
              aria-label={`난이도 ${problem.difficulty}단계, 최대 5단계`}
            >
              난이도
              <span className="flex ml-0.5" aria-hidden>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-3 w-3 ${i < problem.difficulty ? 'fill-orange-400 text-orange-400' : 'text-orange-200 dark:text-orange-900/50'}`}
                  />
                ))}
              </span>
            </span>
          </div>
        </div>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center self-end rounded bg-slate-50 text-slate-400 transition-colors group-hover:bg-indigo-50 group-hover:text-indigo-600 sm:self-center dark:bg-slate-800/80 dark:group-hover:bg-indigo-950/50 dark:text-slate-500 dark:group-hover:text-indigo-400">
          <ChevronRight className="h-5 w-5" aria-hidden />
        </div>
      </div>
    </Link>
  );
}

const DEFAULT_TITLE = '수능 기출 문제';
const DEFAULT_LEAD =
  '기본은 과목·단원·개념으로 고르고, 필요하면 시험 연·월로 바꿀 수 있습니다. 단계별 힌트와 함께 풀어보세요.';

export function ProblemsList({
  problems,
  title = DEFAULT_TITLE,
  lead = DEFAULT_LEAD,
  problemBasePath = '/problems',
}: ProblemsListProps) {
  const { getStatus } = useProblemProgress();
  const { getProblemIdsWithWrong } = useWrongNote();
  const { getBookmarkedIds } = useBookmark();
  const [filterMode, setFilterMode] = useState<'exam' | 'topic'>('topic');
  const [progressFilter, setProgressFilter] = useState<'all' | ProblemProgressStatus>('all');
  const [wrongOnlyFilter, setWrongOnlyFilter] = useState(false);
  const [bookmarkOnlyFilter, setBookmarkOnlyFilter] = useState(false);
  const [pageSize, setPageSize] = useState<(typeof PAGE_SIZE_OPTIONS)[number]>(10);
  const [page, setPage] = useState(1);

  const [examYear, setExamYear] = useState('');
  const [examMonth, setExamMonth] = useState('');

  const [topicSubject, setTopicSubject] = useState('');
  const [topicChapter, setTopicChapter] = useState('');
  const [topicConcept, setTopicConcept] = useState('');

  useEffect(() => {
    setPage(1);
  }, [
    filterMode,
    examYear,
    examMonth,
    topicSubject,
    topicChapter,
    topicConcept,
    pageSize,
    progressFilter,
    wrongOnlyFilter,
    bookmarkOnlyFilter,
  ]);

  const examYears = useMemo(
    () => [...new Set(problems.map((p) => p.examDate.year))].sort((a, b) => b - a),
    [problems],
  );

  /** 연도 미선택 시 전체 데이터에서 월 목록, 선택 시 해당 연도만 */
  const examMonths = useMemo(() => {
    if (examYear === '') {
      return [...new Set(problems.map((p) => p.examDate.month))].sort((a, b) => b - a);
    }
    const y = Number(examYear);
    return [...new Set(problems.filter((p) => p.examDate.year === y).map((p) => p.examDate.month))].sort(
      (a, b) => b - a,
    );
  }, [problems, examYear]);

  const filteredByExam = useMemo(() => {
    return problems.filter((p) => {
      if (examYear !== '' && p.examDate.year !== Number(examYear)) return false;
      if (examMonth !== '' && p.examDate.month !== Number(examMonth)) return false;
      return true;
    });
  }, [problems, examYear, examMonth]);

  const topicSubjects = useMemo(
    () => [...new Set(problems.map((p) => p.topic.subject))].sort((a, b) => a.localeCompare(b, 'ko')),
    [problems],
  );

  /** 현재 과목 필터에 맞는 문제 집합(과목 미선택이면 전체) */
  const problemsForChapterOptions = useMemo(() => {
    if (topicSubject === '') return problems;
    return problems.filter((p) => p.topic.subject === topicSubject);
  }, [problems, topicSubject]);

  const topicChapters = useMemo(
    () =>
      [...new Set(problemsForChapterOptions.map((p) => p.topic.chapter))].sort((a, b) =>
        a.localeCompare(b, 'ko'),
      ),
    [problemsForChapterOptions],
  );

  const problemsForConceptOptions = useMemo(() => {
    let list = problems;
    if (topicSubject !== '') list = list.filter((p) => p.topic.subject === topicSubject);
    if (topicChapter !== '') list = list.filter((p) => p.topic.chapter === topicChapter);
    return list;
  }, [problems, topicSubject, topicChapter]);

  const topicConcepts = useMemo(
    () =>
      [...new Set(problemsForConceptOptions.map((p) => p.topic.concept))].sort((a, b) =>
        a.localeCompare(b, 'ko'),
      ),
    [problemsForConceptOptions],
  );

  const filteredByTopic = useMemo(() => {
    return problems.filter((p) => {
      if (topicSubject !== '' && p.topic.subject !== topicSubject) return false;
      if (topicChapter !== '' && p.topic.chapter !== topicChapter) return false;
      if (topicConcept !== '' && p.topic.concept !== topicConcept) return false;
      return true;
    });
  }, [problems, topicSubject, topicChapter, topicConcept]);

  const baseList = useMemo(() => {
    return filterMode === 'exam' ? filteredByExam : filteredByTopic;
  }, [filterMode, filteredByExam, filteredByTopic]);

  const wrongIdSet = useMemo(() => getProblemIdsWithWrong(), [getProblemIdsWithWrong]);
  const bookmarkIdSet = useMemo(() => getBookmarkedIds(), [getBookmarkedIds]);

  const listAfterProgress = useMemo(() => {
    if (progressFilter === 'all') return baseList;
    return baseList.filter((p) => getStatus(p.id) === progressFilter);
  }, [baseList, progressFilter, getStatus]);

  const listAfterWrong = useMemo(() => {
    if (!wrongOnlyFilter) return listAfterProgress;
    return listAfterProgress.filter((p) => wrongIdSet.has(p.id));
  }, [listAfterProgress, wrongOnlyFilter, wrongIdSet]);

  const activeList = useMemo(() => {
    if (!bookmarkOnlyFilter) return listAfterWrong;
    return listAfterWrong.filter((p) => bookmarkIdSet.has(p.id));
  }, [listAfterWrong, bookmarkOnlyFilter, bookmarkIdSet]);

  const totalCount = activeList.length;
  const totalPages = totalCount === 0 ? 0 : Math.ceil(totalCount / pageSize);
  const safePage = totalPages === 0 ? 1 : Math.min(page, totalPages);
  const pageOffset = (safePage - 1) * pageSize;
  const pageItems = activeList.slice(pageOffset, pageOffset + pageSize);

  useEffect(() => {
    if (totalPages > 0 && page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const showExamTopicEmpty =
    problems.length > 0 && baseList.length === 0;

  const showProgressEmpty =
    problems.length > 0 && baseList.length > 0 && listAfterProgress.length === 0 && progressFilter !== 'all';

  const showWrongOnlyEmpty =
    problems.length > 0 &&
    baseList.length > 0 &&
    listAfterProgress.length > 0 &&
    wrongOnlyFilter &&
    listAfterWrong.length === 0;

  const showBookmarkOnlyEmpty =
    problems.length > 0 &&
    baseList.length > 0 &&
    listAfterWrong.length > 0 &&
    bookmarkOnlyFilter &&
    activeList.length === 0;

  function goExam() {
    setFilterMode('exam');
    setTopicSubject('');
    setTopicChapter('');
    setTopicConcept('');
  }

  function goTopic() {
    setFilterMode('topic');
    setExamYear('');
    setExamMonth('');
  }

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
            조건을 조합해 목록을 좁힐 수 있습니다. 진행 상태는 이 기기 브라우저에만 저장됩니다.
          </p>
        </div>

        <div className="space-y-6 p-5 sm:p-6">
          <section aria-label="보기 방식">
            <p className="mb-2.5 text-xs font-semibold tracking-tight text-slate-500 dark:text-slate-400">보기 방식</p>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-1.5 rounded-2xl bg-slate-100/95 p-1.5 dark:bg-slate-800/90">
              <button
                type="button"
                onClick={goTopic}
                className={`flex min-h-[48px] items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 touch-manipulation ${
                  filterMode === 'topic'
                    ? 'bg-white text-indigo-700 shadow-sm ring-1 ring-slate-200/90 dark:bg-slate-950 dark:text-indigo-300 dark:ring-slate-600/80'
                    : 'text-slate-600 hover:bg-white/60 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/70 dark:hover:text-slate-100'
                }`}
              >
                <BookOpen className="h-4 w-4 shrink-0 opacity-90" aria-hidden />
                <span className="text-center leading-snug sm:text-left">
                  분류별 <span className="text-slate-500 dark:text-slate-400">(과목/단원/개념)</span>
                </span>
              </button>
              <button
                type="button"
                onClick={goExam}
                className={`flex min-h-[48px] items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 touch-manipulation ${
                  filterMode === 'exam'
                    ? 'bg-white text-indigo-700 shadow-sm ring-1 ring-slate-200/90 dark:bg-slate-950 dark:text-indigo-300 dark:ring-slate-600/80'
                    : 'text-slate-600 hover:bg-white/60 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/70 dark:hover:text-slate-100'
                }`}
              >
                <CalendarDays className="h-4 w-4 shrink-0 opacity-90" aria-hidden />
                <span className="text-center leading-snug sm:text-left">
                  시험별 <span className="text-slate-500 dark:text-slate-400">(연도/월)</span>
                </span>
              </button>
            </div>
          </section>

          {filterMode === 'topic' && (
            <section
              className="rounded-2xl bg-slate-50/90 px-4 py-5 ring-1 ring-slate-200/60 dark:bg-slate-800/35 dark:ring-slate-700/50 sm:px-5"
              aria-label="과목·단원·개념 필터"
            >
              <p className="mb-4 text-xs font-semibold text-slate-700 dark:text-slate-300">과목 · 단원 · 개념</p>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 sm:gap-4">
                <FilterSelect
                  id="topic-subject"
                  label="과목"
                  value={topicSubject}
                  onChange={(e) => {
                    setTopicSubject(e.target.value);
                    setTopicChapter('');
                    setTopicConcept('');
                  }}
                >
                  <option value="">전체</option>
                  {topicSubjects.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </FilterSelect>
                <FilterSelect
                  id="topic-chapter"
                  label="단원"
                  value={topicChapter}
                  onChange={(e) => {
                    setTopicChapter(e.target.value);
                    setTopicConcept('');
                  }}
                >
                  <option value="">전체</option>
                  {topicChapters.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </FilterSelect>
                <FilterSelect
                  id="topic-concept"
                  label="개념"
                  value={topicConcept}
                  onChange={(e) => setTopicConcept(e.target.value)}
                >
                  <option value="">전체</option>
                  {topicConcepts.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </FilterSelect>
              </div>
            </section>
          )}

          {filterMode === 'exam' && (
            <section
              className="rounded-2xl bg-slate-50/90 px-4 py-5 ring-1 ring-slate-200/60 dark:bg-slate-800/35 dark:ring-slate-700/50 sm:px-5"
              aria-label="시행 연·월 필터"
            >
              <p className="mb-4 text-xs font-semibold text-slate-700 dark:text-slate-300">시행 연·월</p>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-4">
                <FilterSelect
                  id="exam-year"
                  label="연도"
                  value={examYear}
                  onChange={(e) => {
                    setExamYear(e.target.value);
                    setExamMonth('');
                  }}
                >
                  <option value="">전체</option>
                  {examYears.map((y) => (
                    <option key={y} value={String(y)}>
                      {y}년
                    </option>
                  ))}
                </FilterSelect>
                <FilterSelect id="exam-month" label="월" value={examMonth} onChange={(e) => setExamMonth(e.target.value)}>
                  <option value="">전체</option>
                  {examMonths.map((mo) => (
                    <option key={mo} value={String(mo)}>
                      {mo}월
                    </option>
                  ))}
                </FilterSelect>
              </div>
            </section>
          )}

          <section
            className="rounded-2xl border border-slate-200/70 bg-white/80 px-4 py-5 dark:border-slate-700/55 dark:bg-slate-950/40 sm:px-5"
            aria-label="진행 상태 및 모아보기"
          >
            <FilterSelect
              id="progress-filter"
              label="풀이 진행 상태"
              value={progressFilter}
              onChange={(e) => setProgressFilter(e.target.value as 'all' | ProblemProgressStatus)}
              className="w-full max-w-[min(100%,14rem)]"
            >
              <option value="all">전체</option>
              <option value="none">{PROBLEM_PROGRESS_LABEL.none}</option>
              <option value="progress">{PROBLEM_PROGRESS_LABEL.progress}</option>
              <option value="done">{PROBLEM_PROGRESS_LABEL.done}</option>
            </FilterSelect>
            <p className="mt-3 rounded-lg bg-slate-100/80 px-3.5 py-2.5 type-caption leading-relaxed text-slate-600 dark:bg-slate-800/60 dark:text-slate-400">
              정답을 맞히거나 최종 풀이를 열면 완료로 표시됩니다.
            </p>

            <div className="mt-5 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              <label className="flex min-h-[48px] cursor-pointer items-center gap-3 rounded-xl border border-slate-200/80 bg-slate-50/50 px-4 py-3.5 type-caption font-medium text-slate-800 transition-colors hover:border-indigo-200/90 hover:bg-indigo-50/40 dark:border-slate-700/60 dark:bg-slate-900/40 dark:text-slate-200 dark:hover:border-indigo-500/35 dark:hover:bg-indigo-950/25">
                <input
                  type="checkbox"
                  checked={wrongOnlyFilter}
                  onChange={(e) => setWrongOnlyFilter(e.target.checked)}
                  className="h-5 w-5 shrink-0 rounded-md border-slate-300 text-indigo-600 shadow-sm focus:ring-2 focus:ring-indigo-500/30 dark:border-slate-600 dark:bg-slate-900"
                />
                오답 노트에 포함된 문제만
              </label>
              <label className="flex min-h-[48px] cursor-pointer items-center gap-3 rounded-xl border border-slate-200/80 bg-slate-50/50 px-4 py-3.5 type-caption font-medium text-slate-800 transition-colors hover:border-indigo-200/90 hover:bg-indigo-50/40 dark:border-slate-700/60 dark:bg-slate-900/40 dark:text-slate-200 dark:hover:border-indigo-500/35 dark:hover:bg-indigo-950/25">
                <input
                  type="checkbox"
                  checked={bookmarkOnlyFilter}
                  onChange={(e) => setBookmarkOnlyFilter(e.target.checked)}
                  className="h-5 w-5 shrink-0 rounded-md border-slate-300 text-indigo-600 shadow-sm focus:ring-2 focus:ring-indigo-500/30 dark:border-slate-600 dark:bg-slate-900"
                />
                스크랩한 문제만
              </label>
            </div>

            <div className="mt-4 flex flex-col gap-2 border-t border-slate-200/60 pt-4 dark:border-slate-700/50 sm:flex-row sm:flex-wrap sm:gap-3">
              <Link
                href="/problems/wrong-note"
                className="inline-flex min-h-[44px] items-center gap-1.5 rounded-lg px-2 py-1.5 type-caption font-semibold text-indigo-600 transition-colors hover:bg-indigo-50 hover:text-indigo-700 dark:text-indigo-400 dark:hover:bg-indigo-950/50 dark:hover:text-indigo-300"
              >
                오답 노트 열기
                <ArrowRight className="h-3.5 w-3.5" aria-hidden />
              </Link>
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

      <AdPlaceholder region="problems-list" variant="inline" className="my-0" />

      {problems.length === 0 && (
        <div className="text-center py-20 type-body text-slate-500">등록된 문제가 없습니다.</div>
      )}

      {showExamTopicEmpty && (
        <p className="text-center type-caption text-slate-500">조건에 맞는 문제가 없습니다.</p>
      )}

      {showProgressEmpty && (
        <p className="text-center type-caption text-slate-500">선택한 진행 상태에 맞는 문제가 없습니다.</p>
      )}

      {showWrongOnlyEmpty && (
        <p className="text-center type-caption text-slate-500">
          오답 노트가 비어 있거나, 현재 필터와 겹치는 오답 문제가 없습니다.
        </p>
      )}

      {showBookmarkOnlyEmpty && (
        <p className="text-center type-caption text-slate-500">
          스크랩이 비어 있거나, 현재 필터(오답·진행 상태·분류)와 겹치는 문제가 없습니다.
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
              <label htmlFor="problems-page-size" className="type-caption font-medium text-slate-500 shrink-0">
                페이지당 보기
              </label>
              <div className="relative">
                <select
                  id="problems-page-size"
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
              <ProblemCard key={problem.id} problem={problem} detailBasePath={problemBasePath} />
            ))}
          </div>

          {totalPages > 1 && (
            <nav
              className="flex flex-col items-center gap-3 pt-2 sm:flex-row sm:justify-center sm:gap-4"
              aria-label="문제 목록 페이지"
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
