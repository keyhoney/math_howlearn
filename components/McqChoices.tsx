import type { ReactNode } from 'react';

/** MDX에서 ①~⑤ 보기 카드 그리드 컨테이너 (`McqChoiceItem` 자식) */
export function McqChoices({ children }: { children?: ReactNode }) {
  return (
    <div
      className={
        'not-prose my-5 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3'
      }
    >
      {children}
    </div>
  );
}
