"use client";

import { useEffect, useMemo, useState } from "react";
import { fetchTopics } from "@/services/sheets";
import type { AnswerOption, PracticeResult, Question, Topic } from "@/types/quiz";
import {
  getStoredResults,
  getWrongQuestionIds,
  recordAnswer,
  resetProgress,
} from "@/utils/storage";

const options: AnswerOption[] = ["A", "B", "C", "D"];

type Mode = "practice" | "exam" | "flashcard" | "wrong" | "stats";

export default function Home() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedTopic, setSelectedTopic] = useState("");
  const [mode, setMode] = useState<Mode>("practice");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<AnswerOption | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [results, setResults] = useState<PracticeResult[]>(() => getStoredResults());
  const [wrongIds, setWrongIds] = useState<string[]>(() => getWrongQuestionIds());
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [flashcardFlipped, setFlashcardFlipped] = useState(false);

  useEffect(() => {
    async function loadTopics() {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const nextTopics = await fetchTopics();
        const firstTopic = nextTopics[0];

        setTopics(nextTopics);
        setSelectedTopic(firstTopic?.name ?? "");
        setQuestions(shuffleQuestions(firstTopic?.questions ?? []));
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : "Không tải được dữ liệu.");
      } finally {
        setIsLoading(false);
      }
    }

    loadTopics();
  }, []);

  const currentQuestion = questions[currentIndex];
  const allQuestions = useMemo(() => topics.flatMap((topic) => topic.questions), [topics]);
  const wrongQuestions = useMemo(() => allQuestions.filter((question) => wrongIds.includes(question.id)), [allQuestions, wrongIds]);
  const activeQuestions = mode === "wrong" ? wrongQuestions : questions;
  const activeQuestion = mode === "wrong" ? activeQuestions[currentIndex] : currentQuestion;
  const correctCount = results.filter((result) => result.isCorrect).length;
  const wrongCount = results.length - correctCount;
  const completionRate = results.length > 0 ? Math.round((correctCount / results.length) * 100) : 0;

  function handleModeChange(nextMode: Mode) {
    setMode(nextMode);
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setShowAnswer(false);
    setFlashcardFlipped(false);

    if (nextMode === "exam") {
      const mixedQuestions = shuffleQuestions(allQuestions).slice(0, 12);
      setQuestions(mixedQuestions);
    }
  }

  function selectTopic(topic: Topic) {
    setSelectedTopic(topic.name);
    setQuestions(shuffleQuestions(topic.questions));
    handleModeChange("practice");
  }

  function submitAnswer(answer: AnswerOption) {
    if (!activeQuestion || showAnswer) return;

    setSelectedAnswer(answer);
    setShowAnswer(true);
    const result = recordAnswer(activeQuestion.id, answer, activeQuestion.answer);
    setResults(getStoredResults());
    setWrongIds(getWrongQuestionIds());

    if (result.isCorrect && mode === "wrong") {
      setWrongIds(getWrongQuestionIds());
    }
  }

  function goNext() {
    if (activeQuestions.length === 0) return;
    setCurrentIndex((currentIndex + 1) % activeQuestions.length);
    setSelectedAnswer(null);
    setShowAnswer(false);
    setFlashcardFlipped(false);
  }

  function handleReset() {
    resetProgress();
    setResults([]);
    setWrongIds([]);
  }

  return (
    <main className="shell">
      <aside className="sidebar">
        <div>
          <p className="eyebrow">Next.js + Google Sheets</p>
          <h1>Web Ôn Thi</h1>
        </div>

        <nav className="topicList" aria-label="Danh sách chuyên đề">
          {topics.length === 0 ? <p className="sidebarHint">Chưa có chuyên đề.</p> : null}
          {topics.map((topic) => (
            <button
              key={topic.gid}
              className={topic.name === selectedTopic ? "topicButton active" : "topicButton"}
              type="button"
              onClick={() => selectTopic(topic)}
            >
              <span>{topic.name}</span>
              <strong>{topic.questions.length}</strong>
            </button>
          ))}
        </nav>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div className="tabs" role="tablist" aria-label="Chế độ ôn thi">
            <button className={mode === "practice" ? "tab active" : "tab"} type="button" onClick={() => handleModeChange("practice")}>
              Luyện tập
            </button>
            <button className={mode === "exam" ? "tab active" : "tab"} type="button" onClick={() => handleModeChange("exam")}>
              Thi thử
            </button>
            <button className={mode === "flashcard" ? "tab active" : "tab"} type="button" onClick={() => handleModeChange("flashcard")}>
              Flashcard
            </button>
            <button className={mode === "wrong" ? "tab active" : "tab"} type="button" onClick={() => handleModeChange("wrong")}>
              Câu sai
            </button>
            <button className={mode === "stats" ? "tab active" : "tab"} type="button" onClick={() => handleModeChange("stats")}>
              Thống kê
            </button>
          </div>
        </header>

        {mode === "stats" ? (
          <StatsPanel
            completionRate={completionRate}
            correctCount={correctCount}
            resultsCount={results.length}
            wrongCount={wrongCount}
            wrongIdsCount={wrongIds.length}
            onReset={handleReset}
          />
        ) : mode === "flashcard" ? (
          <FlashcardPanel
            question={activeQuestion}
            currentIndex={currentIndex}
            total={activeQuestions.length}
            isFlipped={flashcardFlipped}
            onFlip={() => setFlashcardFlipped(!flashcardFlipped)}
            onNext={goNext}
          />
        ) : (
          <QuizPanel
            question={activeQuestion}
            currentIndex={currentIndex}
            total={activeQuestions.length}
            selectedAnswer={selectedAnswer}
            showAnswer={showAnswer}
            isLoading={isLoading}
            emptyText={mode === "wrong" ? "Chưa có câu sai nào để ôn lại." : "Chưa có câu hỏi."}
            errorText={errorMessage}
            onAnswer={submitAnswer}
            onNext={goNext}
          />
        )}
      </section>
    </main>
  );
}

function QuizPanel({
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
    return <div className="panel empty">Đang tải câu hỏi...</div>;
  }

  if (!question) {
    return <div className="panel empty">{errorText || emptyText}</div>;
  }

  return (
    <article className="panel">
      <div className="questionMeta">
        <span>Câu {currentIndex + 1}/{total}</span>
        <span>{question.level}</span>
      </div>
      <h2>{question.question}</h2>
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

function FlashcardPanel({
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

function StatsPanel({
  completionRate,
  correctCount,
  resultsCount,
  wrongCount,
  wrongIdsCount,
  onReset,
}: {
  completionRate: number;
  correctCount: number;
  resultsCount: number;
  wrongCount: number;
  wrongIdsCount: number;
  onReset: () => void;
}) {
  return (
    <article className="panel">
      <h2>Thống kê học tập</h2>
      <div className="statsGrid">
        <div>
          <span>Đã trả lời</span>
          <strong>{resultsCount}</strong>
        </div>
        <div>
          <span>Đúng</span>
          <strong>{correctCount}</strong>
        </div>
        <div>
          <span>Sai</span>
          <strong>{wrongCount}</strong>
        </div>
        <div>
          <span>Tỷ lệ đúng</span>
          <strong>{completionRate}%</strong>
        </div>
      </div>
      <div className="progressTrack">
        <span style={{ width: `${completionRate}%` }} />
      </div>
      <p className="muted">Đang lưu {wrongIdsCount} câu sai trong LocalStorage để ôn lại.</p>
      <button className="secondaryButton" type="button" onClick={onReset}>
        Xóa tiến độ
      </button>
    </article>
  );
}

function shuffleQuestions<T>(items: T[]) {
  return [...items].sort(() => Math.random() - 0.5);
}
