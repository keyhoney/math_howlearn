import Link from 'next/link';
import { CalendarDays, ChevronRight } from 'lucide-react';
import { getColumns } from '@/data/columns';
import { AdPlaceholder } from '@/components/AdPlaceholder';

export default async function ColumnsPage() {
  const columns = await getColumns();
  
  return (
    <div className="space-y-10">
      <div>
        <h1 className="type-article-title mb-3">학습 과학 칼럼</h1>
        <p className="type-lead max-w-2xl">학습 과학 이론에 기반한, 현직 교사의 수학 공부법 칼럼을 읽어보세요.</p>
      </div>

      <AdPlaceholder region="columns-list" variant="inline" className="my-0" />

      <div className="grid gap-6">
        {columns.map((column) => (
          <Link
            key={column.id}
            href={`/columns/${column.id}`}
            className="group block book-card bg-white shadow-sm border border-slate-200 transition-all hover:shadow-md hover:border-indigo-300 dark:bg-slate-900/90 dark:border-slate-700 dark:shadow-none dark:hover:border-indigo-500/60"
          >
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2 type-caption font-semibold text-slate-500">
                <CalendarDays className="h-4 w-4 shrink-0" />
                {column.date}
              </div>
              <div>
                <h2 className="type-heading group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors mb-2">
                  {column.title}
                </h2>
                <p className="type-lead">
                  {column.summary}
                </p>
              </div>
              <div className="flex items-center gap-1 type-caption font-bold text-indigo-600 dark:text-indigo-400 mt-2">
                칼럼 읽기 <ChevronRight className="h-4 w-4" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
