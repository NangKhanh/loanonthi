import type { Question } from "@/types/quiz";

export default function FlashcardPanel({
  question,
  currentIndex,
  total,
  isFlipped,
  onFlip,
  onNext,
}: {
  question?: Question;
  currentIndex: number;
  total: number;
  isFlipped: boolean;
  onFlip: () => void;
  onNext: () => void;
}) {
  if (!question) {
    return <div className="panel empty">Chưa có flashcard.</div>;
  }

  return (
    <article className="panel flashcardPanel">
      <div className="questionMeta">
        <span>Thẻ {currentIndex + 1}/{total}</span>
      </div>
      <div className={isFlipped ? "flashcard flipped" : "flashcard"} onClick={onFlip} role="button" tabIndex={0}>
        <div className="flashcardInner">
          <div className="flashcardFace front">
            <span>{question.question}</span>
          </div>
          <div className="flashcardFace back">
            <span>{question.explanation}</span>
          </div>
        </div>
      </div>
      <div className="actions">
        <button className="secondaryButton" type="button" onClick={onFlip}>
          Lật thẻ
        </button>
        <button className="primaryButton" type="button" onClick={onNext}>
          Thẻ tiếp theo
        </button>
      </div>
    </article>
  );
}
