import type { Question } from "@/types/quiz";
import Spinner from "@/components/Spinner";

type TextAnswerMap = Record<string, string>;

export default function TheoryPanel({
  isLoading,
  errorText,
  questions,
  answers,
  isReviewing,
  reviewItems,
  onAnswerChange,
  onSubmit,
  onRetry,
}: {
  isLoading: boolean;
  errorText: string;
  questions: Question[];
  answers: TextAnswerMap;
  isReviewing: boolean;
  reviewItems: Array<{ question: Question; answer: string }>;
  onAnswerChange: (questionId: string, value: string) => void;
  onSubmit: () => void;
  onRetry: () => void;
}) {
  if (isLoading) {
    return (
      <div className="panel empty">
        <Spinner size={48} />
      </div>
    );
  }

  if (questions.length === 0) {
    return <div className="panel empty">{errorText || "Sheet lý thuyết chưa có câu hỏi."}</div>;
  }

  if (isReviewing) {
    return (
      <article className="panel">
        <div className="reviewList">
          {reviewItems.map(({ question, answer }, index) => (
            <div className="reviewItem" key={question.id}>
              <div className="questionMeta">
                <span>Câu {index + 1}</span>
              </div>
              <h3>{question.question}</h3>
              <p className="muted">
                Bạn nhập: <strong>{answer || "Chưa nhập"}</strong>
              </p>
              <p>
                Đáp án: <strong>{question.answer}</strong>
              </p>
              <p className="muted">{question.explanation}</p>
            </div>
          ))}
        </div>
        <div className="actions">
          <button className="primaryButton" type="button" onClick={onRetry}>
            Làm lại
          </button>
        </div>
      </article>
    );
  }

  return (
    <article className="panel theoryPanel">
      {questions.map((question, index) => (
        <label className="textQuestion" key={question.id}>
          <span>Câu {index + 1}</span>
          <strong>{question.question}</strong>
          <textarea
            value={answers[question.id] ?? ""}
            onChange={(event) => onAnswerChange(question.id, event.target.value)}
            placeholder="Nhập câu trả lời"
          />
        </label>
      ))}
      <div className="actions">
        <button className="primaryButton" type="button" onClick={onSubmit}>
          Xem lại kết quả
        </button>
      </div>
    </article>
  );
}
