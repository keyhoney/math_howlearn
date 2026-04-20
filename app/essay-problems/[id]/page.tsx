import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, BookOpen, ChevronRight } from 'lucide-react';
import { getEssayProblem, getEssayProblems } from '@/data/essay-problems';
import { MDXRenderer } from '@/components/MDXRenderer';
import { HintReveal } from '@/components/HintReveal';
import { AdPlaceholder } from '@/components/AdPlaceholder';
import { ProblemBookmarkButton } from '@/components/ProblemBookmarkButton';
import { ExamPracticeToolbar } from '@/components/ExamPracticeToolbar';
import {
  ExamPracticeProblemTimerSync,
  WhenExamFocus,
  WhenNotExamFocus,
} from '@/components/ExamPracticeGates';

export async function generateStaticParams() {
  const problems = await getEssayProblems();
  return problems.map((p) => ({ id: p.id }));
}

export default async function EssayProblemDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const problem = await getEssayProblem(id);

  if (!problem) {
    notFound();
  }

  const hintContents = problem.hintsMdx.map((hint, idx) => (
    <MDXRenderer key={idx} source={hint} />
  ));

  const answerContent = <MDXRenderer source={problem.answerMdx} />;

  const allProblems = await getEssayProblems();
  const relatedProblems = allProblems.filter(
    (p) =>
      p.id !== id &&
      p.examDate.type === '논술' &&
      p.topic.subject === problem.topic.subject &&
      p.topic.concept === problem.topic.concept,
  );

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <ExamPracticeProblemTimerSync problemId={problem.id} />
      <ExamPracticeToolbar problemLabel={problem.source} />

      <WhenNotExamFocus>
        <Link
          href="/essay-problems"
          className="type-caption inline-flex items-center gap-2 font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          목록으로 돌아가기
        </Link>
      </WhenNotExamFocus>

      <div className="mb-6 flex flex-col gap-2">
        <WhenNotExamFocus>
          <div className="flex flex-wrap gap-2 mb-2 items-center">
            <span className="type-overline bg-slate-200 text-slate-600 px-2 py-0.5 rounded dark:bg-slate-800 dark:text-slate-300">
              시행 {problem.examDate.year}년 · 논술
            </span>
            <span className="type-overline bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded normal-case tracking-normal font-bold dark:bg-indigo-950/60 dark:text-indigo-300">
              대학 {problem.topic.subject}
            </span>
          </div>
        </WhenNotExamFocus>
        <WhenExamFocus>
          <p className="type-caption text-slate-500 dark:text-slate-400 mb-2">
            집중 모드: 힌트·모범 풀이·광고·관련 문제·목록 링크는 끄면 다시 볼 수 있습니다.
          </p>
        </WhenExamFocus>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <h1 className="type-title min-w-0 flex-1">{problem.source}</h1>
          <WhenNotExamFocus>
            <ProblemBookmarkButton problemId={problem.id} />
          </WhenNotExamFocus>
        </div>
      </div>

      <div className="book-card bg-white border border-slate-200 rounded-xl flex flex-col shadow-sm dark:bg-slate-900/90 dark:border-slate-700 dark:shadow-none">
        <MDXRenderer source={problem.questionMdx} />
      </div>

      <WhenNotExamFocus>
        <AdPlaceholder region="essay-problem-between-q-hints" variant="inline" className="my-6" />

        <HintReveal
          problemId={problem.id}
          totalHints={problem.hintsMdx.length}
          hintContents={hintContents}
          answerContent={answerContent}
        />

        {relatedProblems.length > 0 && (
          <div className="mt-16 border-t border-slate-200 pt-10 dark:border-slate-800">
            <h2 className="type-heading mb-6 flex items-center gap-2">
              <BookOpen className="h-5 w-5 shrink-0 text-indigo-500 dark:text-indigo-400" />
              같은 대학·시행연도의 다른 문제
            </h2>
            <div className="grid gap-4">
              {relatedProblems.map((rp) => (
                <Link
                  key={rp.id}
                  href={`/essay-problems/${rp.id}`}
                  className="group block book-card--compact bg-white border border-slate-200 hover:border-indigo-300 transition-colors shadow-sm dark:bg-slate-900/90 dark:border-slate-700 dark:hover:border-indigo-500/55 dark:shadow-none"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="space-y-2 min-w-0">
                      <h3 className="type-subhead text-slate-800 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {rp.source}
                      </h3>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="type-overline text-slate-600 bg-slate-100 px-2 py-0.5 rounded dark:bg-slate-800 dark:text-slate-300">
                          시행 {rp.examDate.year}년 · {rp.topic.subject}
                        </span>
                      </div>
                    </div>
                    <div className="h-8 w-8 flex items-center justify-center rounded-lg bg-slate-50 group-hover:bg-indigo-50 text-slate-400 group-hover:text-indigo-600 transition-colors dark:bg-slate-800/80 dark:group-hover:bg-indigo-950/50 dark:text-slate-500 dark:group-hover:text-indigo-400">
                      <ChevronRight className="h-5 w-5" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </WhenNotExamFocus>
    </div>
  );
}
