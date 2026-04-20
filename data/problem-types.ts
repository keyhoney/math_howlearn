export interface Problem {
  id: string;
  source: string;
  examDate: { year: number; month: number; type: '수능' | '평가원' | '교육청' | '논술' };
  topic: { subject: string; chapter: string; concept: string };
  /**
   * 정답 코드. 오지선다형: 1~5(선택 번호), 단답형: 0~999 정수.
   * CSV `answer` 열과 동일.
   */
  answer: number;
  difficulty: number;
  questionMdx: string;
  hintsMdx: string[];
  answerMdx: string;
}
