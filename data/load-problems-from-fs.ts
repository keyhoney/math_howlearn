import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import type { Problem } from '@/data/problem-types';

const EXAM_TYPES = ['수능', '평가원', '교육청'] as const;

type ExamType = (typeof EXAM_TYPES)[number];

function isExamType(s: string): s is ExamType {
  return (EXAM_TYPES as readonly string[]).includes(s);
}

interface MetaRow {
  id: string;
  source: string;
  year: number;
  month: number;
  type: ExamType;
  subject: string;
  chapter: string;
  concept: string;
  answer: number;
  difficulty: number;
}

function parseAnswerCell(raw: string | undefined, id: string, metaCsvLabel: string): number {
  const s = raw?.trim() ?? '';
  if (s === '') {
    throw new Error(`${metaCsvLabel} (${id}): answer 열은 필수입니다. (오지선다: 1~5, 단답: 0~999)`);
  }
  const n = Number(s);
  if (!Number.isInteger(n) || n < 0 || n > 999) {
    throw new Error(
      `${metaCsvLabel} (${id}): answer는 0 이상 999 이하의 정수여야 합니다. (오지선다형 1~5, 단답형 0~999)`,
    );
  }
  return n;
}

function loadMetaRows(metaCsvPath: string, metaCsvLabel: string): MetaRow[] {
  if (!fs.existsSync(metaCsvPath)) return [];
  const raw = fs.readFileSync(metaCsvPath, 'utf8');
  const records = parse(raw, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    cast: false,
  }) as Record<string, string>[];

  return records.map((row, index) => {
    const id = row.id?.trim();
    if (!id) {
      throw new Error(`${metaCsvLabel}: 행 ${index + 2}에 id가 없습니다.`);
    }
    const type = row.type?.trim() ?? '';
    if (!isExamType(type)) {
      throw new Error(
        `${metaCsvLabel} (${id}): type은 수능, 평가원, 교육청 중 하나여야 합니다. (현재: ${type})`,
      );
    }
    const year = Number(row.year);
    const month = Number(row.month);
    const difficulty = Number(row.difficulty);
    if (!Number.isFinite(year) || !Number.isFinite(month)) {
      throw new Error(`${metaCsvLabel} (${id}): year, month는 숫자여야 합니다.`);
    }
    const answer = parseAnswerCell(row.answer, id, metaCsvLabel);
    return {
      id,
      source: row.source?.trim() ?? '',
      year,
      month,
      type,
      subject: row.subject?.trim() ?? '',
      chapter: row.chapter?.trim() ?? '',
      concept: row.concept?.trim() ?? '',
      answer,
      difficulty: Number.isFinite(difficulty) ? difficulty : 3,
    };
  });
}

export function parseProblemMdxBody(fileContents: string) {
  const questionMatch = fileContents.match(/<Question>([\s\S]*?)<\/Question>/);
  const answerMatch = fileContents.match(/<Answer>([\s\S]*?)<\/Answer>/);
  const hintMatches = [...fileContents.matchAll(/<Hint>([\s\S]*?)<\/Hint>/g)].map((m) => m[1].trim());
  return {
    questionMdx: questionMatch ? questionMatch[1].trim() : '',
    answerMdx: answerMatch ? answerMatch[1].trim() : '',
    hintsMdx: hintMatches,
  };
}

function metaRowToProblem(meta: MetaRow, body: ReturnType<typeof parseProblemMdxBody>): Problem {
  return {
    id: meta.id,
    source: meta.source,
    examDate: { year: meta.year, month: meta.month, type: meta.type },
    topic: { subject: meta.subject, chapter: meta.chapter, concept: meta.concept },
    answer: meta.answer,
    difficulty: meta.difficulty,
    questionMdx: body.questionMdx,
    answerMdx: body.answerMdx,
    hintsMdx: body.hintsMdx,
  };
}

function sortProblems(problems: Problem[]): Problem[] {
  return [...problems].sort((a, b) => {
    if (a.examDate.year !== b.examDate.year) return b.examDate.year - a.examDate.year;
    return b.examDate.month - a.examDate.month;
  });
}

/**
 * @param contentDir `content/problems` 또는 `content/essay-problems` 등 절대 경로
 * @param metaFileName 예: `problems-meta.csv`
 */
export function loadProblemsList(contentDir: string, metaFileName: string): Problem[] {
  const metaCsvPath = path.join(contentDir, metaFileName);
  const metaCsvLabel = metaFileName;
  const rows = loadMetaRows(metaCsvPath, metaCsvLabel);
  const problems: Problem[] = [];

  for (const meta of rows) {
    const fullPath = path.join(contentDir, `${meta.id}.mdx`);
    if (!fs.existsSync(fullPath)) {
      console.warn(
        `[problems] ${metaFileName}에 있는 "${meta.id}"에 해당하는 MDX 파일이 없습니다. 건너뜁니다.`,
      );
      continue;
    }
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const body = parseProblemMdxBody(fileContents);
    problems.push(metaRowToProblem(meta, body));
  }

  return sortProblems(problems);
}

export function loadProblemById(
  contentDir: string,
  metaFileName: string,
  id: string,
): Problem | null {
  const metaCsvPath = path.join(contentDir, metaFileName);
  const metaCsvLabel = metaFileName;
  const rows = loadMetaRows(metaCsvPath, metaCsvLabel);
  const meta = rows.find((r) => r.id === id);
  if (!meta) return null;

  const fullPath = path.join(contentDir, `${id}.mdx`);
  if (!fs.existsSync(fullPath)) return null;

  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const body = parseProblemMdxBody(fileContents);
  return metaRowToProblem(meta, body);
}
