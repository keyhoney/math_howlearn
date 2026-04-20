import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, BookOpen, Star, ChevronRight } from 'lucide-react';
import { composeAnswerMdxSource, getProblem, getProblems, questionMdxHasFiveChoices } from '@/data/problems';
import { MDXRenderer } from '@/components/MDXRenderer';
import { HintReveal } from '@/components/HintReveal';
import { AdPlaceholder } from '@/components/AdPlaceholder';
import { ProblemAnswerCheck } from '@/components/ProblemAnswerCheck';
import { ProblemMcqAnswerBar, ProblemMcqProvider } from '@/components/ProblemMcqInteraction';
import { ProblemVisitTracker } from '@/components/ProblemVisitTracker';
import { ProblemBookmarkButton } from '@/components/ProblemBookmarkButton';
import { ExamPracticeToolbar } from '@/components/ExamPracticeToolbar';
import {
  ExamPracticeProblemTimerSync,
  WhenExamFocus,
  WhenNotExamFocus,
} from '@/components/ExamPracticeGates';

export async function generateStaticParams() {
  const problems = await getProblems();
  return problems.map((p) => ({ id: p.id }));
}

export default async function ProblemDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const problem = await getProblem(id);

  if (!problem) {
    notFound();
  }

  // Pre-render the hint MDX content as array of React elements
  const hintContents = problem.hintsMdx.map((hint, idx) => (
    <MDXRenderer key={idx} source={hint} />
  ));

  const answerContent = (
    <MDXRenderer source={composeAnswerMdxSource(problem.answer, problem.answerMdx)} />
  );

  const allProblems = await getProblems();
  const relatedProblems = allProblems.filter(p => 
    p.id !== id && 
    p.topic.subject === problem.topic.subject &&
    p.topic.chapter === problem.topic.chapter &&
    p.topic.concept === problem.topic.concept
  );

  const isMcq = questionMdxHasFiveChoices(problem.questionMdx);

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <ProblemVisitTracker problemId={problem.id} />
      <ExamPracticeProblemTimerSync problemId={problem.id} />
      <ExamPracticeToolbar problemLabel={problem.source} />

      <WhenNotExamFocus>
        <Link
          href="/problems"
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
              {problem.examDate.year}년 {problem.examDate.month}월 {problem.examDate.type}
            </span>
            <span className="type-overline bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded normal-case tracking-normal font-bold dark:bg-indigo-950/60 dark:text-indigo-300">
              {problem.topic.subject} &gt; {problem.topic.chapter} &gt; {problem.topic.concept}
            </span>
            <span className="type-overline flex items-center gap-0.5 bg-orange-50 text-orange-700 px-2 py-0.5 rounded normal-case tracking-normal font-bold ml-0 sm:ml-1 dark:bg-orange-950/40 dark:text-orange-300">
              난이도
              <span className="flex ml-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-3 w-3 ${i < problem.difficulty ? 'fill-orange-400 text-orange-400' : 'text-orange-200 dark:text-orange-900/50'}`}
                  />
                ))}
              </span>
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

      <ProblemMcqProvider enabled={isMcq} correctAnswer={problem.answer} problemId={problem.id}>
        <div className="book-card bg-white border border-slate-200 rounded-xl flex flex-col shadow-sm dark:bg-slate-900/90 dark:border-slate-700 dark:shadow-none">
          <MDXRenderer source={problem.questionMdx} />
          {isMcq ? (
            <ProblemMcqAnswerBar problemId={problem.id} />
          ) : (
            <ProblemAnswerCheck problemId={problem.id} correctAnswer={problem.answer} />
          )}
        </div>
      </ProblemMcqProvider>

      <WhenNotExamFocus>
        <AdPlaceholder region="problem-between-q-hints" variant="inline" className="my-6" />

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
              같은 개념의 관련 문제
            </h2>
            <div className="grid gap-4">
              {relatedProblems.map(rp => (
                <Link
                  key={rp.id}
                  href={`/problems/${rp.id}`}
                  className="group block book-card--compact bg-white border border-slate-200 hover:border-indigo-300 transition-colors shadow-sm dark:bg-slate-900/90 dark:border-slate-700 dark:hover:border-indigo-500/55 dark:shadow-none"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="space-y-2 min-w-0">
                      <h3 className="type-subhead text-slate-800 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {rp.source}
                      </h3>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="type-overline text-slate-600 bg-slate-100 px-2 py-0.5 rounded dark:bg-slate-800 dark:text-slate-300">
                          {rp.examDate.year}년 {rp.examDate.month}월 {rp.examDate.type}
                        </span>
                        <span className="flex items-center gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3 w-3 ${i < rp.difficulty ? 'fill-orange-400 text-orange-400' : 'text-slate-200 dark:text-slate-600'}`}
                            />
                          ))}
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
