import { getProblems } from '@/data/problems';
import { ProblemsList } from '@/components/ProblemsList';

export default async function ProblemsPage() {
  const problems = await getProblems();
  return <ProblemsList problems={problems} />;
}
