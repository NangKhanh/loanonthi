export type AnswerOption = "A" | "B" | "C" | "D";
export type QuestionType = "choice" | "text";
export type TopicType = "choice" | "theory";

export type Question = {
  id: string;
  question: string;
  A?: string;
  B?: string;
  C?: string;
  D?: string;
  answer: string;
  explanation: string;
  level: string;
  type: QuestionType;
};

export type Topic = {
  name: string;
  gid: string;
  type: TopicType;
  questions: Question[];
};

export type PracticeResult = {
  questionId: string;
  selectedAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  answeredAt: string;
};
