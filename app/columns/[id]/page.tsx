import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, CalendarDays } from 'lucide-react';
import { getColumn, getColumns } from '@/data/columns';
import { MDXRenderer } from '@/components/MDXRenderer';
import { AdPlaceholder } from '@/components/AdPlaceholder';

export async function generateStaticParams() {
  const columns = await getColumns();
  return columns.map((c) => ({ id: c.id }));
}

export default async function ColumnDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const column = await getColumn(id);

  if (!column) {
    notFound();
  }

  return (
    <article className="max-w-3xl mx-auto pb-12">
      <Link
        href="/columns"
        className="type-caption inline-flex items-center gap-2 font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 mb-8 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        목록으로 돌아가기
      </Link>

      <header className="mb-12 space-y-6">
        <div className="flex items-center gap-2 type-caption font-bold tracking-tight text-indigo-700 bg-indigo-100 px-3 py-1.5 rounded w-max dark:bg-indigo-950/70 dark:text-indigo-300">
          <CalendarDays className="h-4 w-4 shrink-0" />
          {column.date}
        </div>
        <h1 className="type-article-title">{column.title}</h1>
        <p className="type-hero-kicker font-medium text-slate-600 dark:text-slate-400 max-w-3xl">
          {column.summary}
        </p>
      </header>

      <AdPlaceholder region="column-before-body" variant="inline" className="my-0 mb-8" />

      <div className="book-card bg-white shadow-sm border border-slate-200 dark:bg-slate-900/90 dark:border-slate-700 dark:shadow-none">
        <MDXRenderer source={column.contentMdx} />
      </div>
    </article>
  );
}
