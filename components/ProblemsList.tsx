'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { CalendarDays, BookOpen, ChevronRight, ChevronLeft, Star } from 'lucide-react';
import type { Problem } from '@/data/problem-types';
import {
  PROBLEM_PROGRESS_LABEL,
  type ProblemProgressStatus,
} from '@/lib/problem-progress';
import { useProblemProgress } from '@/components/ProblemProgressContext';
import { useWrongNote } from '@/components/WrongNoteContext';
import { useBookmark } from '@/components/BookmarkContext';
import { AdPlaceholder } from '@/components/AdPlaceholder';

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

const selectClass =
  'min-h-[44px] w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-base sm:text-sm font-medium text-slate-800 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-400/25';
const filterModeBtnClass =
  'min-h-[44px] shrink-0 rounded px-4 py-2.5 text-sm font-medium transition-colors touch-manipulation';

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

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900/90 dark:shadow-none">
        <p className="mb-3 type-caption font-semibold text-slate-700 dark:text-slate-300">필터</p>
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <span className="type-caption shrink-0 text-slate-500 dark:text-slate-400">보기 방식</span>
          <div className="-mx-1 flex gap-2 overflow-x-auto pb-1 [-webkit-overflow-scrolling:touch] sm:mx-0 sm:flex-wrap sm:pb-0">
            <button
              type="button"
              onClick={goTopic}
              className={`flex items-center gap-2 ${filterModeBtnClass} ${
                filterMode === 'topic'
                  ? 'bg-indigo-600 text-white shadow-sm dark:bg-indigo-500 dark:text-white'
                  : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800'
              }`}
            >
              <BookOpen className="h-4 w-4 shrink-0" aria-hidden />
              분류별 (과목/단원/개념)
            </button>
            <button
              type="button"
              onClick={goExam}
              className={`flex items-center gap-2 ${filterModeBtnClass} ${
                filterMode === 'exam'
                  ? 'bg-indigo-600 text-white shadow-sm dark:bg-indigo-500 dark:text-white'
                  : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800'
              }`}
            >
              <CalendarDays className="h-4 w-4 shrink-0" aria-hidden />
              시험별 (연도/월)
            </button>
          </div>
        </div>

        {filterMode === 'topic' && (
          <div className="mt-4 border-t border-slate-200 pt-4 dark:border-slate-700">
            <p className="mb-3 type-caption font-medium text-slate-600 dark:text-slate-400">과목 · 단원 · 개념</p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <label htmlFor="topic-subject" className="block type-caption font-medium text-slate-500">
                  과목
                </label>
                <select
                  id="topic-subject"
                  value={topicSubject}
                  onChange={(e) => {
                    setTopicSubject(e.target.value);
                    setTopicChapter('');
                    setTopicConcept('');
                  }}
                  className={selectClass}
                >
                  <option value="">전체</option>
                  {topicSubjects.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label htmlFor="topic-chapter" className="block type-caption font-medium text-slate-500">
                  단원
                </label>
                <select
                  id="topic-chapter"
                  value={topicChapter}
                  onChange={(e) => {
                    setTopicChapter(e.target.value);
                    setTopicConcept('');
                  }}
                  className={selectClass}
                >
                  <option value="">전체</option>
                  {topicChapters.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label htmlFor="topic-concept" className="block type-caption font-medium text-slate-500">
                  개념
                </label>
                <select
                  id="topic-concept"
                  value={topicConcept}
                  onChange={(e) => setTopicConcept(e.target.value)}
                  className={selectClass}
                >
                  <option value="">전체</option>
                  {topicConcepts.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {filterMode === 'exam' && (
          <div className="mt-4 border-t border-slate-200 pt-4 dark:border-slate-700">
            <p className="mb-3 type-caption font-medium text-slate-600 dark:text-slate-400">시행 연·월</p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label htmlFor="exam-year" className="block type-caption font-medium text-slate-500">
                  연도
                </label>
                <select
                  id="exam-year"
                  value={examYear}
                  onChange={(e) => {
                    setExamYear(e.target.value);
                    setExamMonth('');
                  }}
                  className={selectClass}
                >
                  <option value="">전체</option>
                  {examYears.map((y) => (
                    <option key={y} value={String(y)}>
                      {y}년
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label htmlFor="exam-month" className="block type-caption font-medium text-slate-500">
                  월
                </label>
                <select
                  id="exam-month"
                  value={examMonth}
                  onChange={(e) => setExamMonth(e.target.value)}
                  className={selectClass}
                >
                  <option value="">전체</option>
                  {examMonths.map((mo) => (
                    <option key={mo} value={String(mo)}>
                      {mo}월
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        <div className="mt-4 border-t border-slate-200 pt-4 dark:border-slate-700">
          <label htmlFor="progress-filter" className="mb-1.5 block type-caption font-semibold text-slate-700 dark:text-slate-300">
            풀이 진행 상태
          </label>
          <select
            id="progress-filter"
            value={progressFilter}
            onChange={(e) => setProgressFilter(e.target.value as 'all' | ProblemProgressStatus)}
            className={selectClass}
          >
            <option value="all">전체</option>
            <option value="none">{PROBLEM_PROGRESS_LABEL.none}</option>
            <option value="progress">{PROBLEM_PROGRESS_LABEL.progress}</option>
            <option value="done">{PROBLEM_PROGRESS_LABEL.done}</option>
          </select>
          <p className="mt-2 type-caption text-slate-500">
            상태는 이 브라우저에만 저장됩니다. 정답을 맞히거나 최종 풀이를 열면 완료로 표시됩니다.
          </p>
          <div className="mt-4 space-y-3 border-t border-slate-200 pt-4 dark:border-slate-700">
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-6 sm:gap-y-2">
              <label className="flex min-h-[44px] cursor-pointer items-center gap-3 type-caption text-slate-700 touch-manipulation dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={wrongOnlyFilter}
                  onChange={(e) => setWrongOnlyFilter(e.target.checked)}
                  className="h-5 w-5 shrink-0 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-900"
                />
                오답 노트에 포함된 문제만 보기
              </label>
              <label className="flex min-h-[44px] cursor-pointer items-center gap-3 type-caption text-slate-700 touch-manipulation dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={bookmarkOnlyFilter}
                  onChange={(e) => setBookmarkOnlyFilter(e.target.checked)}
                  className="h-5 w-5 shrink-0 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-900"
                />
                스크랩한 문제만 보기
              </label>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-x-4">
              <Link
                href="/problems/wrong-note"
                className="inline-flex min-h-[44px] items-center type-caption font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
              >
                오답 노트 열기 →
              </Link>
              <Link
                href="/problems/bookmarks"
                className="inline-flex min-h-[44px] items-center type-caption font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
              >
                스크랩 모아보기 →
              </Link>
            </div>
          </div>
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
              <select
                id="problems-page-size"
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value) as (typeof PAGE_SIZE_OPTIONS)[number])}
                className={`${selectClass} w-auto min-w-[5.5rem] sm:min-w-0`}
              >
                {PAGE_SIZE_OPTIONS.map((n) => (
                  <option key={n} value={n}>
                    {n}개
                  </option>
                ))}
              </select>
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
