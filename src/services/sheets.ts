import type { Topic } from "@/types/quiz";

export async function fetchTopics(): Promise<Topic[]> {
  const response = await fetch("/api/topics", {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Không tải được dữ liệu Google Sheets.");
  }

  return (await response.json()) as Topic[];
}
