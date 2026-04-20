import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import type { Problem } from '@/data/problem-types';
import { parseProblemMdxBody } from '@/data/load-problems-from-fs';

type EssayFrontmatter = Record<string, unknown>;

function readYear(data: EssayFrontmatter): number | null {
  const v = data.시행연도 ?? data.year;
  if (v === undefined || v === null || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) && Number.isInteger(n) ? n : null;
}

function readUniversity(data: EssayFrontmatter): string | null {
  const v = data.대학 ?? data.university;
  if (v === undefined || v === null) return null;
  const s = String(v).trim();
  return s.length > 0 ? s : null;
}

function readOptionalAnswer(data: EssayFrontmatter): number {
  const v = data.answer;
  if (v === undefined || v === null || v === '') return 1;
  const n = Number(v);
  if (!Number.isInteger(n) || n < 0 || n > 999) return 1;
  return n;
}

function readOptionalDifficulty(data: EssayFrontmatter): number {
  const v = data.difficulty ?? data.난이도;
  if (v === undefined || v === null || v === '') return 3;
  const n = Number(v);
  if (!Number.isFinite(n)) return 3;
  return Math.min(5, Math.max(1, Math.round(n)));
}

function readSourceTitle(data: EssayFrontmatter, university: string, year: number): string {
  const raw = data.제목 ?? data.title ?? data.source;
  if (typeof raw === 'string' && raw.trim()) return raw.trim();
  return `${university} (${year})`;
}

function essayMatterToProblem(
  id: string,
  data: EssayFrontmatter,
  bodyContent: string,
  fileLabel: string,
): Problem {
  const year = readYear(data);
  const university = readUniversity(data);
  if (year === null) {
    throw new Error(`${fileLabel}: frontmatter에 시행연도(또는 year) 정수가 필요합니다.`);
  }
  if (university === null) {
    throw new Error(`${fileLabel}: frontmatter에 대학(또는 university) 문자열이 필요합니다.`);
  }

  const body = parseProblemMdxBody(bodyContent);
  const answer = readOptionalAnswer(data);
  const difficulty = readOptionalDifficulty(data);
  const source = readSourceTitle(data, university, year);

  return {
    id,
    source,
    examDate: { year, month: 1, type: '논술' },
    topic: {
      subject: university,
      chapter: '논술 기출',
      concept: String(year),
    },
    answer,
    difficulty,
    questionMdx: body.questionMdx,
    answerMdx: body.answerMdx,
    hintsMdx: body.hintsMdx,
  };
}

function sortEssayProblems(problems: Problem[]): Problem[] {
  return [...problems].sort((a, b) => {
    if (a.examDate.year !== b.examDate.year) return b.examDate.year - a.examDate.year;
    const ua = a.topic.subject.localeCompare(b.topic.subject, 'ko');
    if (ua !== 0) return ua;
    return a.id.localeCompare(b.id, 'ko');
  });
}

export function loadEssayProblemsFromDir(contentDir: string): Problem[] {
  if (!fs.existsSync(contentDir)) return [];

  const names = fs.readdirSync(contentDir).filter((f) => f.endsWith('.mdx'));
  const problems: Problem[] = [];

  for (const name of names) {
    const id = path.basename(name, '.mdx');
    const fullPath = path.join(contentDir, name);
    const raw = fs.readFileSync(fullPath, 'utf8');
    let parsed: ReturnType<typeof matter>;
    try {
      parsed = matter(raw);
    } catch (e) {
      console.warn(`[essay-problems] ${name}: frontmatter 파싱 실패`, e);
      continue;
    }
    try {
      problems.push(essayMatterToProblem(id, parsed.data as EssayFrontmatter, parsed.content, name));
    } catch (e) {
      console.warn(`[essay-problems] ${name}:`, e);
    }
  }

  return sortEssayProblems(problems);
}

export function loadEssayProblemFromDir(contentDir: string, id: string): Problem | null {
  const fullPath = path.join(contentDir, `${id}.mdx`);
  if (!fs.existsSync(fullPath)) return null;

  const raw = fs.readFileSync(fullPath, 'utf8');
  const parsed = matter(raw);
  try {
    return essayMatterToProblem(id, parsed.data as EssayFrontmatter, parsed.content, `${id}.mdx`);
  } catch (e) {
    console.warn(`[essay-problems] ${id}.mdx:`, e);
    return null;
  }
}
