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
        <span>{question.level}</span>
      </div>
      <button className={isFlipped ? "flashcard flipped" : "flashcard"} type="button" onClick={onFlip}>
        <span>{isFlipped ? question.explanation : question.question}</span>
      </button>
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
