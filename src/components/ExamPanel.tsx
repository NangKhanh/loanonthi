import type { AnswerOption, Question } from "@/types/quiz";

const options: AnswerOption[] = ["A", "B", "C", "D"];

export default function ExamPanel({
  questions,
  answers,
  score,
  wrongQuestions,
  submitted,
  onAnswer,
  onSubmit,
  onRetry,
  onBackToStart,
}: {
  questions: Question[];
  answers: Record<string, AnswerOption>;
  score: number;
  wrongQuestions: Question[];
  submitted: boolean;
  onAnswer: (questionId: string, answer: AnswerOption) => void;
  onSubmit: () => void;
  onRetry: () => void;
  onBackToStart: () => void;
}) {
  if (questions.length === 0) {
    return <div className="panel empty">Chưa có câu hỏi để thi thử.</div>;
  }

  if (submitted) {
    return (
      <article className="panel examResultPanel">
        <div className="scoreBox">
          <span>Điểm thi thử</span>
          <strong>{score}/{questions.length}</strong>
        </div>
        <p className="muted">Bạn làm sai {wrongQuestions.length} câu.</p>
        {wrongQuestions.length > 0 ? (
          <div className="reviewList">
            {wrongQuestions.map((question, index) => (
              <div className="reviewItem" key={question.id}>
                <div className="questionMeta">
                  <span>Câu sai {index + 1}</span>
                </div>
                <h3>{question.question}</h3>
                <p className="muted">
                  Bạn chọn: <strong>{answers[question.id] || "Chưa chọn"}</strong>. Đáp án đúng: <strong>{question.answer}</strong>.
                </p>
                <p>{question.explanation}</p>
              </div>
            ))}
          </div>
        ) : null}
        <div className="actions">
          <button className="primaryButton" type="button" onClick={onRetry}>
            Thi lại
          </button>
          <button className="secondaryButton" type="button" onClick={onBackToStart}>
            Chuyển về từ đầu
          </button>
        </div>
      </article>
    );
  }

  return (
    <article className="examShell">
      <div className="examHeader">
        <div>
          <p className="eyebrow dark">Thi thử</p>
          <h2>{questions.length} câu ngẫu nhiên</h2>
        </div>
        <div className="examCounter">
          <strong>{Object.keys(answers).length}</strong>
          <span>đã chọn</span>
        </div>
      </div>
      <div className="examQuestionList">
        {questions.map((question, index) => (
          <section className="examQuestion" key={question.id}>
            <div className="questionMeta">
              <span>Câu {index + 1}</span>
            </div>
            <h3>{question.question}</h3>
            <div className="compactAnswerGrid">
              {options.map((option) => (
                <button
                  key={option}
                  className={answers[question.id] === option ? "compactAnswer active" : "compactAnswer"}
                  type="button"
                  onClick={() => onAnswer(question.id, option)}
                >
                  <strong>{option}</strong>
                  <span>{question[option]}</span>
                </button>
              ))}
            </div>
          </section>
        ))}
      </div>
      <div className="stickyActions">
        <button className="primaryButton" type="button" onClick={onSubmit}>
          Hoàn thành
        </button>
      </div>
    </article>
  );
}
