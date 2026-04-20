import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { getProblems } from '@/data/problems';
import { WrongNoteList } from '@/components/WrongNoteList';

export default async function WrongNotePage() {
  const problems = await getProblems();

  return (
    <div className="max-w-4xl mx-auto pb-12 space-y-8">
      <Link
        href="/problems"
        className="type-caption inline-flex items-center gap-2 font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        기출문제 목록으로
      </Link>

      <div>
        <h1 className="type-article-title mb-3">오답 노트</h1>
        <p className="type-lead max-w-2xl">
          이 브라우저에서 틀렸던 문제가 시간 순으로 모아 둡니다.
        </p>
      </div>

      <WrongNoteList problems={problems} />
    </div>
  );
}
