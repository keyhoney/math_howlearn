import path from 'path';
import type { Problem } from '@/data/problem-types';
import { loadEssayProblemFromDir, loadEssayProblemsFromDir } from '@/data/load-essay-problems-from-mdx';

export type { Problem } from '@/data/problem-types';

const essayProblemsDirectory = path.join(process.cwd(), 'content/essay-problems');

export async function getEssayProblems(): Promise<Problem[]> {
  return loadEssayProblemsFromDir(essayProblemsDirectory);
}

export async function getEssayProblem(id: string): Promise<Problem | null> {
  return loadEssayProblemFromDir(essayProblemsDirectory, id);
}
