import type { AnswerOption, PracticeResult } from "@/types/quiz";

const resultsKey = "onthiloan-results";
const wrongKey = "onthiloan-wrong-question-ids";

export function getStoredResults(): PracticeResult[] {
  if (typeof window === "undefined") return [];
  return readJson<PracticeResult[]>(resultsKey, []);
}

export function getWrongQuestionIds(): string[] {
  if (typeof window === "undefined") return [];
  return readJson<string[]>(wrongKey, []);
}

export function recordAnswer(
  questionId: string,
  selectedAnswer: AnswerOption,
  correctAnswer: AnswerOption,
): PracticeResult {
  const result: PracticeResult = {
    questionId,
    selectedAnswer,
    correctAnswer,
    isCorrect: selectedAnswer === correctAnswer,
    answeredAt: new Date().toISOString(),
  };

  const results = getStoredResults();
  window.localStorage.setItem(resultsKey, JSON.stringify([...results, result]));

  const wrongIds = new Set(getWrongQuestionIds());
  if (result.isCorrect) {
    wrongIds.delete(questionId);
  } else {
    wrongIds.add(questionId);
  }
  window.localStorage.setItem(wrongKey, JSON.stringify([...wrongIds]));

  return result;
}

export function resetProgress() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(resultsKey);
  window.localStorage.removeItem(wrongKey);
}

function readJson<T>(key: string, fallback: T): T {
  try {
    const rawValue = window.localStorage.getItem(key);
    return rawValue ? (JSON.parse(rawValue) as T) : fallback;
  } catch {
    return fallback;
  }
}
