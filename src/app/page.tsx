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
import QuizPanel from "@/components/QuizPanel";
import ChoiceGrid from "@/components/ChoiceGrid";
import ExamPanel from "@/components/ExamPanel";
import TheoryPanel from "@/components/TheoryPanel";
import FlashcardPanel from "@/components/FlashcardPanel";
import StatsPanel from "@/components/StatsPanel";

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
  }));

  function handleModeChange(nextMode: Mode) {
    setMode(nextMode);
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setShowAnswer(false);
    setFlashcardFlipped(false);

    if (nextMode === "practice") {
      const topicQuestions = selectedTopic?.type === "choice" ? selectedTopic.questions : [];
      setQuestions(shuffleQuestions(topicQuestions));
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
    setQuestions(shuffleQuestions(topic.questions));
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



function getExamScore(questions: Question[], answers: ExamAnswerMap) {
  return questions.filter((question) => answers[question.id] === question.answer).length;
}

function shuffleQuestions<T>(items: T[]) {
  return [...items].sort(() => Math.random() - 0.5);
}
