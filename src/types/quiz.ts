export type AnswerOption = "A" | "B" | "C" | "D";

export type Question = {
  id: string;
  question: string;
  A: string;
  B: string;
  C: string;
  D: string;
  answer: AnswerOption;
  explanation: string;
  level: string;
};

export type Topic = {
  name: string;
  gid: string;
  questions: Question[];
};

export type PracticeResult = {
  questionId: string;
  selectedAnswer: AnswerOption;
  correctAnswer: AnswerOption;
  isCorrect: boolean;
  answeredAt: string;
};
