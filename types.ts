
export type OptionKey = 'A' | 'B' | 'C' | 'D';

export interface Question {
  id: number;
  text: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  answer: OptionKey;
}

export enum GameStatus {
  IDLE = 'IDLE',
  PLAYING = 'PLAYING',
  FINISHED = 'FINISHED'
}

export interface QuizResult {
  score: number;
  correctCount: number;
  wrongCount: number;
  unansweredCount: number;
  questions: Question[];
  userAnswers: (OptionKey | null)[];
}
