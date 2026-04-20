import { ProblemProgressProvider } from '@/components/ProblemProgressContext';
import { WrongNoteProvider } from '@/components/WrongNoteContext';
import { BookmarkProvider } from '@/components/BookmarkContext';
import { ExamPracticeProvider } from '@/components/ExamPracticeContext';

export default function ProblemsLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProblemProgressProvider>
      <WrongNoteProvider>
        <BookmarkProvider>
          <ExamPracticeProvider>{children}</ExamPracticeProvider>
        </BookmarkProvider>
      </WrongNoteProvider>
    </ProblemProgressProvider>
  );
}
