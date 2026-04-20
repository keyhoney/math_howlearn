import { MDXRemote } from 'next-mdx-remote/rsc';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { McqChoices } from '@/components/McqChoices';
import { McqChoiceItem } from '@/components/McqChoiceItem';

interface MDXRendererProps {
  source: string;
}

/** MDX 안의 `<Question>` 등 JSX 블록 속 `$...$`는 remark 단계에서 inlineMath로 잡히지 않는 경우가 있어, 소스 전체에서 치환합니다. */
function fracToDfracInSource(source: string) {
  return source.replace(/\\frac/g, '\\dfrac');
}

const MCQ_LABEL_BODY = /^([①②③④⑤])\s*([\s\S]*)$/;

/**
 * 한 줄에 `① … ② … ⑤ …` 형태의 5지선다를 `<McqChoices>` + `<McqChoiceItem>`으로 바꾼다.
 * 번호는 왼쪽 고정, 본문(`$…$` 등)은 카드 안에서만 중앙 정렬된다.
 */
function wrapFiveChoiceLineInMdx(source: string): string {
  return source
    .split('\n')
    .map((line) => {
      const trimmed = line.trim();
      if (!trimmed.startsWith('①')) return line;
      const parts = trimmed.split(/(?=[②③④⑤]\s)/);
      if (parts.length !== 5) return line;
      if (!parts[0].startsWith('①')) return line;
      const indent = line.match(/^\s*/)?.[0] ?? '';
      const items = parts
        .map((p) => {
          const m = MCQ_LABEL_BODY.exec(p.trim());
          if (!m) return null;
          const [, lab, body] = m;
          const inner = body.trim();
          return `${indent}<McqChoiceItem label="${lab}">${inner}</McqChoiceItem>`;
        })
        .filter(Boolean)
        .join('\n\n');
      if (!items) return line;
      return `${indent}<McqChoices>\n\n${items}\n\n${indent}</McqChoices>`;
    })
    .join('\n');
}

export function MDXRenderer({ source }: MDXRendererProps) {
  const normalized = wrapFiveChoiceLineInMdx(fracToDfracInSource(source));
  return (
    <div className="prose prose-book prose-slate prose-indigo max-w-none dark:prose-invert prose-pre:bg-slate-900 prose-pre:text-slate-100 dark:prose-pre:bg-slate-950 dark:prose-pre:text-slate-200 prose-blockquote:border-l-indigo-400 prose-blockquote:bg-indigo-50 prose-blockquote:py-1 prose-blockquote:px-4 prose-blockquote:not-italic prose-blockquote:rounded-r-lg prose-headings:tracking-tight dark:prose-a:text-indigo-400">
      <MDXRemote
        source={normalized}
        components={{ McqChoices, McqChoiceItem }}
        options={{
          mdxOptions: {
            remarkPlugins: [remarkMath],
            // KaTeX: https://katex.org/docs/options.html — 수식 오류 시 빌드 전체가 죽지 않게
            rehypePlugins: [
              [
                rehypeKatex,
                {
                  throwOnError: false,
                  strict: 'warn',
                  errorColor: '#cc0000',
                },
              ],
            ],
          },
        }}
      />
    </div>
  );
}
