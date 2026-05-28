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
const examQuestionCount = 35;

type Mode = "practice" | "exam" | "flashcard" | "wrong" | "stats";
type ExamAnswerMap = Record<string, AnswerOption>;
type TextAnswerMap = Record<string, string>;

export default function Home() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedTopicId, setSelectedTopicId] = useState("");
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
  const [examQuestions, setExamQuestions] = useState<Question[]>([]);
  const [examAnswers, setExamAnswers] = useState<ExamAnswerMap>({});
  const [examSubmitted, setExamSubmitted] = useState(false);
  const [textAnswers, setTextAnswers] = useState<TextAnswerMap>({});
  const [textSubmitted, setTextSubmitted] = useState(false);

  useEffect(() => {
    async function loadTopics() {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const nextTopics = await fetchTopics();
        const firstTopic = nextTopics[0];
        const nextChoiceQuestions = nextTopics
          .filter((topic) => topic.type === "choice")
          .flatMap((topic) => topic.questions);

        setTopics(nextTopics);
        setSelectedTopicId(firstTopic?.gid ?? "");
        setQuestions(shuffleQuestions(nextChoiceQuestions));
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : "Không tải được dữ liệu.");
      } finally {
        setIsLoading(false);
      }
    }

    loadTopics();
  }, []);

  const selectedTopic = topics.find((topic) => topic.gid === selectedTopicId);
  const isTheoryTopic = selectedTopic?.type === "theory";
  const choiceTopics = useMemo(() => topics.filter((topic) => topic.type === "choice"), [topics]);
  const choiceQuestions = useMemo(() => choiceTopics.flatMap((topic) => topic.questions), [choiceTopics]);
  const theoryQuestions = selectedTopic?.type === "theory" ? selectedTopic.questions : [];
  const wrongQuestions = useMemo(
    () => choiceQuestions.filter((question) => wrongIds.includes(question.id)),
    [choiceQuestions, wrongIds],
  );
  const activeQuestions = mode === "wrong" ? wrongQuestions : questions;
  const activeQuestion = activeQuestions[currentIndex];
  const correctCount = results.filter((result) => result.isCorrect).length;
  const wrongCount = results.length - correctCount;
  const completionRate = results.length > 0 ? Math.round((correctCount / results.length) * 100) : 0;
  const examScore = getExamScore(examQuestions, examAnswers);
  const examWrongQuestions = examQuestions.filter((question) => examAnswers[question.id] !== question.answer);
  const textReviewItems = theoryQuestions.map((question) => ({
    question,
    answer: textAnswers[question.id]?.trim() ?? "",
    isCorrect: isTextAnswerCorrect(textAnswers[question.id] ?? "", question.answer),
  }));

  function handleModeChange(nextMode: Mode) {
    setMode(nextMode);
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setShowAnswer(false);
    setFlashcardFlipped(false);

    if (nextMode === "practice") {
      setQuestions(shuffleQuestions(choiceQuestions));
    }

    if (nextMode === "exam") {
      startExam();
    }
  }

  function selectTopic(topic: Topic) {
    setSelectedTopicId(topic.gid);
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setShowAnswer(false);
    setFlashcardFlipped(false);
    setTextAnswers({});
    setTextSubmitted(false);

    if (topic.type === "theory") {
      setMode("practice");
      setQuestions([]);
      return;
    }

    setMode("practice");
    setQuestions(shuffleQuestions(choiceQuestions));
  }

  function startExam() {
    setExamQuestions(shuffleQuestions(choiceQuestions).slice(0, examQuestionCount));
    setExamAnswers({});
    setExamSubmitted(false);
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

  function submitTextAnswers() {
    theoryQuestions.forEach((question) => {
      recordAnswer(question.id, textAnswers[question.id] ?? "", question.answer);
    });
    setResults(getStoredResults());
    setWrongIds(getWrongQuestionIds());
    setTextSubmitted(true);
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
              className={topic.gid === selectedTopicId ? "topicButton active" : "topicButton"}
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
          {isTheoryTopic ? (
            <div className="tabs" role="tablist" aria-label="Chế độ lý thuyết">
              <button className={!textSubmitted ? "tab active" : "tab"} type="button" onClick={() => setTextSubmitted(false)}>
                Làm thử
              </button>
              <button className={textSubmitted ? "tab active" : "tab"} type="button" onClick={() => setTextSubmitted(true)}>
                Xem lại kết quả
              </button>
            </div>
          ) : (
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
          )}
        </header>

        {isTheoryTopic ? (
          <TheoryPanel
            isLoading={isLoading}
            errorText={errorMessage}
            questions={theoryQuestions}
            answers={textAnswers}
            isReviewing={textSubmitted}
            reviewItems={textReviewItems}
            onAnswerChange={(questionId, value) => setTextAnswers((current) => ({ ...current, [questionId]: value }))}
            onSubmit={submitTextAnswers}
            onRetry={() => {
              setTextAnswers({});
              setTextSubmitted(false);
            }}
          />
        ) : mode === "stats" ? (
          <StatsPanel
            completionRate={completionRate}
            correctCount={correctCount}
            resultsCount={results.length}
            wrongCount={wrongCount}
            wrongIdsCount={wrongIds.length}
            onReset={handleReset}
          />
        ) : mode === "exam" ? (
          <ExamPanel
            questions={examQuestions}
            answers={examAnswers}
            score={examScore}
            wrongQuestions={examWrongQuestions}
            submitted={examSubmitted}
            onAnswer={(questionId, answer) => setExamAnswers((current) => ({ ...current, [questionId]: answer }))}
            onSubmit={() => setExamSubmitted(true)}
            onRetry={startExam}
            onBackToStart={() => handleModeChange("practice")}
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

function ChoiceGrid({
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

function ExamPanel({
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
  answers: ExamAnswerMap;
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
                  <span>{question.level}</span>
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
              <span>{question.level}</span>
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

function TheoryPanel({
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
  reviewItems: Array<{ question: Question; answer: string; isCorrect: boolean }>;
  onAnswerChange: (questionId: string, value: string) => void;
  onSubmit: () => void;
  onRetry: () => void;
}) {
  if (isLoading) {
    return <div className="panel empty">Đang tải câu hỏi...</div>;
  }

  if (questions.length === 0) {
    return <div className="panel empty">{errorText || "Sheet lý thuyết chưa có câu hỏi."}</div>;
  }

  if (isReviewing) {
    const correctCount = reviewItems.filter((item) => item.isCorrect).length;
    return (
      <article className="panel">
        <div className="scoreBox inline">
          <span>Kết quả lý thuyết</span>
          <strong>{correctCount}/{reviewItems.length}</strong>
        </div>
        <div className="reviewList">
          {reviewItems.map(({ question, answer, isCorrect }, index) => (
            <div className={isCorrect ? "reviewItem correctBorder" : "reviewItem wrongBorder"} key={question.id}>
              <div className="questionMeta">
                <span>Câu {index + 1}</span>
                <span>{isCorrect ? "Đúng" : "Sai"}</span>
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
          <input
            type="text"
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

function getExamScore(questions: Question[], answers: ExamAnswerMap) {
  return questions.filter((question) => answers[question.id] === question.answer).length;
}

function isTextAnswerCorrect(answer: string, correctAnswer: string) {
  return normalizeText(answer) === normalizeText(correctAnswer);
}

function normalizeText(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function shuffleQuestions<T>(items: T[]) {
  return [...items].sort(() => Math.random() - 0.5);
}
