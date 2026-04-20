import { getEssayProblems } from '@/data/essay-problems';
import { EssayProblemsList } from '@/components/EssayProblemsList';

export default async function EssayProblemsPage() {
  const problems = await getEssayProblems();
  return (
    <EssayProblemsList
      problems={problems}
      title="논술 기출 문제"
      lead="아래에서 연도·대학명으로 골라 논술 문제를 풀 수 있습니다."
      problemBasePath="/essay-problems"
    />
  );
}
