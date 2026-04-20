import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { getProblems } from '@/data/problems';
import { BookmarkList } from '@/components/BookmarkList';

export default async function BookmarksPage() {
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
        <h1 className="type-article-title mb-3">스크랩(북마크)</h1>
        <p className="type-lead max-w-2xl">
        이 브라우저에서 스크랩한 문제만 모아 둡니다.
        </p>
      </div>

      <BookmarkList problems={problems} />
    </div>
  );
}
