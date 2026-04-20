import Link from 'next/link';
import { BookOpen, Calculator, ArrowRight, BrainCircuit, PenLine } from 'lucide-react';
import { AdPlaceholder } from '@/components/AdPlaceholder';

export default function Home() {
  return (
    <div className="flex flex-col gap-20 py-12">
      <section className="text-center space-y-6">
        <h1 className="type-display max-w-4xl mx-auto">
          올바른 방법으로 <br className="hidden sm:inline" />
          <span className="text-indigo-600 dark:text-indigo-400">수학적 사고력</span>을 기르세요
        </h1>
        <p className="type-hero-kicker mx-auto max-w-2xl">
          수능 및 모의평가 수학 기출문제를 단계별 풀이 힌트와 함께 풀어보고,
          학습 과학 이론에 기반한 효율적인 수학 학습 전략을 배워보세요.
        </p>
        <div className="mx-auto flex w-full max-w-md flex-col items-stretch justify-center gap-3 pt-4 sm:max-w-none sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
          <Link
            href="/problems"
            className="flex min-h-[48px] touch-manipulation items-center justify-center gap-2 rounded-lg bg-indigo-600 px-6 py-3.5 text-base font-medium text-white shadow-sm transition-all hover:bg-indigo-700 active:scale-[0.98] sm:min-h-0 sm:px-8 dark:bg-indigo-500 dark:hover:bg-indigo-400"
          >
            <Calculator className="h-5 w-5" />
            수능 기출 문제
          </Link>
          <Link
            href="/essay-problems"
            className="flex min-h-[48px] touch-manipulation items-center justify-center gap-2 rounded-lg border border-indigo-200 bg-indigo-50 px-6 py-3.5 text-base font-medium text-indigo-800 shadow-sm transition-all hover:bg-indigo-100 active:scale-[0.98] sm:min-h-0 sm:px-8 dark:border-indigo-800/60 dark:bg-indigo-950/50 dark:text-indigo-200 dark:hover:bg-indigo-950/80"
          >
            <PenLine className="h-5 w-5" />
            논술 기출 문제
          </Link>
          <Link
            href="/columns"
            className="flex min-h-[48px] touch-manipulation items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-6 py-3.5 text-base font-medium text-slate-600 shadow-sm transition-all hover:bg-slate-50 active:scale-[0.98] sm:min-h-0 sm:px-8 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <BookOpen className="h-5 w-5" />
            학습 과학 칼럼 읽기
          </Link>
        </div>
      </section>

      <AdPlaceholder region="home-mid" variant="banner" className="my-0" />

      <section className="grid sm:grid-cols-2 gap-8 lg:gap-12 mt-8">
        <div className="book-card bg-white shadow-sm border border-slate-200 dark:bg-slate-900/90 dark:border-slate-700 dark:shadow-none">
          <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded bg-indigo-100 text-indigo-700 dark:bg-indigo-950/70 dark:text-indigo-300">
            <BrainCircuit className="h-6 w-6" />
          </div>
          <h3 className="type-subhead mb-3">단계별 힌트로 인출 훈련</h3>
          <p className="type-lead mb-6">
            모르겠다고 바로 해설지를 보지 마세요. 막힌 부분만 확인하고, 스스로 다음 단계를 추론하는 훈련이 진짜 수학 실력을 만듭니다.
          </p>
          <Link
            href="/problems"
            className="inline-flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
          >
            수능 기출 보러 가기 <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="book-card bg-white shadow-sm border border-slate-200 dark:bg-slate-900/90 dark:border-slate-700 dark:shadow-none">
          <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            <BookOpen className="h-6 w-6" />
          </div>
          <h3 className="type-subhead mb-3">현직 교사의 학습 전략</h3>
          <p className="type-lead mb-6">
            학습 과학 이론을 수능 수학 공부에 직접 적용하는 구체적인 방법을 제시한 칼럼을 통해 수학 학습 전략을 세워보세요.
          </p>
          <Link
            href="/columns"
            className="inline-flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
          >
            칼럼 읽으러 가기 <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
