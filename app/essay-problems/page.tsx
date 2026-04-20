import { getEssayProblems } from '@/data/essay-problems';
import { EssayProblemsList } from '@/components/EssayProblemsList';

export default async function EssayProblemsPage() {
  const problems = await getEssayProblems();
  return (
    <EssayProblemsList
      problems={problems}
      title="논술 기출 문제"
      lead="각 문제 MDX frontmatter에 시행연도·대학을 적습니다. 아래에서 연도·대학명으로 골라 풀 수 있습니다."
      problemBasePath="/essay-problems"
    />
  );
}
