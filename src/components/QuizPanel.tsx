import type { AnswerOption, Question } from "@/types/quiz";
import ChoiceGrid from "@/components/ChoiceGrid";
import Spinner from "@/components/Spinner";

export default function QuizPanel({
  question,
  currentIndex,
  total,
  selectedAnswer,
  showAnswer,
  isLoading,
  emptyText,
  errorText,
  onAnswer,
  onNext,
}: {
  question?: Question;
  currentIndex: number;
  total: number;
  selectedAnswer: AnswerOption | null;
  showAnswer: boolean;
  isLoading: boolean;
  emptyText: string;
  errorText: string;
  onAnswer: (answer: AnswerOption) => void;
  onNext: () => void;
}) {
  if (isLoading) {
    return (
      <div className="panel empty">
        <Spinner size={48} />
      </div>
    );
  }

  if (!question) {
    return <div className="panel empty">{errorText || emptyText}</div>;
  }

  return (
    <article className="panel">
      <div className="questionMeta">
        <span>Câu {currentIndex + 1}/{total}</span>
      </div>
      <h2>{question.question}</h2>
      <ChoiceGrid question={question} selectedAnswer={selectedAnswer} showAnswer={showAnswer} onAnswer={onAnswer} />
      {showAnswer ? (
        <div className="explanation">
          <strong>Đáp án {question.answer}</strong>
          <p>{question.explanation}</p>
        </div>
      ) : null}
      <div className="actions">
        <button className="primaryButton" type="button" onClick={onNext}>
          Câu tiếp theo
        </button>
      </div>
    </article>
  );
}
