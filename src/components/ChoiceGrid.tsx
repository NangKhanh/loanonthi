import type { AnswerOption, Question } from "@/types/quiz";

const options: AnswerOption[] = ["A", "B", "C", "D"];

export default function ChoiceGrid({
  question,
  selectedAnswer,
  showAnswer,
  onAnswer,
}: {
  question: Question;
  selectedAnswer?: AnswerOption | null;
  showAnswer: boolean;
  onAnswer: (answer: AnswerOption) => void;
}) {
  return (
    <div className="answerGrid">
      {options.map((option) => {
        const isCorrect = showAnswer && option === question.answer;
        const isWrong = showAnswer && option === selectedAnswer && selectedAnswer !== question.answer;
        return (
          <button
            key={option}
            className={`answerButton ${isCorrect ? "correct" : ""} ${isWrong ? "wrong" : ""}`}
            type="button"
            onClick={() => onAnswer(option)}
          >
            <strong>{option}</strong>
            <span>{question[option]}</span>
          </button>
        );
      })}
    </div>
  );
}
