import path from 'path';
import type { Problem } from '@/data/problem-types';
import { loadProblemById, loadProblemsList } from '@/data/load-problems-from-fs';

export type { Problem } from '@/data/problem-types';

const problemsDirectory = path.join(process.cwd(), 'content/problems');
const PROBLEMS_META = 'problems-meta.csv';

const CIRCLED_ANSWER = ['', '①', '②', '③', '④', '⑤'] as const;

/** `MDXRenderer`의 `wrapFiveChoiceLineInMdx`와 동일한 한 줄 5지선다 판별 */
const MCQ_LINE_LABEL_BODY = /^([①②③④⑤])\s*([\s\S]*)$/;

/**
 * 문제 본문 MDX에 `① … ② … ⑤ …` 한 줄 보기가 있으면 오지선다형으로 본다.
 */
export function questionMdxHasFiveChoices(questionMdx: string): boolean {
  for (const line of questionMdx.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed.startsWith('①')) continue;
    const parts = trimmed.split(/(?=[②③④⑤]\s)/);
    if (parts.length !== 5 || !parts[0].startsWith('①')) continue;
    const ok = parts.every((p) => MCQ_LINE_LABEL_BODY.test(p.trim()));
    if (ok) return true;
  }
  return false;
}

/**
 * `<Answer>` 첫 줄 표시용. CSV `answer`가 1~5이면 ①~⑤, 0·6~999는 숫자 그대로(단답형 1도 ①).
 */
export function formatAnswerForDisplay(answer: number): string {
  if (answer >= 1 && answer <= 5) return CIRCLED_ANSWER[answer]!;
  return String(answer);
}

/**
 * MDX 본문 앞의 `정답: …` / 짧은 `정답은 … 입니다.` 한 줄 제거.
 * `정답은 … (` 처럼 괄호로 이어지는 서술은 설명이 섞인 줄이므로 두지 않는다.
 */
function stripLeadingAnswerLineFromMdx(body: string): string {
  const m = body.match(
    /^\s*((?:정답\s*[:：]\s*[^\n]+|정답은\s+[^\n]+))(?:\r?\n|$)/u,
  );
  if (!m) return body.trim();
  const lineText = m[1].trim();
  if (lineText.includes('정답은') && lineText.includes('(')) {
    return body.trim();
  }
  return body.slice(m[0].length).trim();
}

/**
 * 최종 풀이 MDX: 맨 위에 CSV 기준 **정답:** 줄을 두고, 기존 본문은 이어 붙인다.
 * 본문이 `정답:` / `정답은`으로 시작하면 그 줄은 제거해 중복을 막는다.
 */
export function composeAnswerMdxSource(answerCode: number, answerMdxBody: string): string {
  const rest = stripLeadingAnswerLineFromMdx(answerMdxBody);
  const head = `**정답:** ${formatAnswerForDisplay(answerCode)}`;
  return rest ? `${head}\n\n${rest}` : head;
}

export async function getProblems(): Promise<Problem[]> {
  return loadProblemsList(problemsDirectory, PROBLEMS_META);
}

export async function getProblem(id: string): Promise<Problem | null> {
  return loadProblemById(problemsDirectory, PROBLEMS_META, id);
}
