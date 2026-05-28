import { NextResponse } from "next/server";
import type { AnswerOption, Question } from "@/types/quiz";

type SheetMeta = {
  gid: string;
  name: string;
};

type GvizCell = {
  v?: string | number | boolean;
  f?: string;
};

type GvizRow = {
  c?: Array<GvizCell | null>;
};

type GvizResponse = {
  table?: {
    rows?: GvizRow[];
  };
};

const sheetId = process.env.SHEET_ID || process.env.NEXT_PUBLIC_SHEET_ID;

export const dynamic = "force-dynamic";

export async function GET() {
  if (!sheetId) {
    return NextResponse.json({ error: "Missing SHEET_ID or NEXT_PUBLIC_SHEET_ID." }, { status: 500 });
  }

  try {
    const sheets = await fetchSheetList(sheetId);
    const topics = await Promise.all(
      sheets.map(async (sheet) => ({
        name: sheet.name,
        gid: sheet.gid,
        questions: await fetchSheetQuestions(sheetId, sheet),
      })),
    );

    return NextResponse.json(topics);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown Google Sheets error.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

async function fetchSheetList(spreadsheetId: string): Promise<SheetMeta[]> {
  const response = await fetch(`https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit?usp=sharing`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Không đọc được metadata của Google Sheet. Hãy bật quyền Anyone with the link -> Viewer.");
  }

  const html = await response.text();
  const matches = [...html.matchAll(/\[21350203,"\[\d+,0,\\"(\d+)\\",.*?\[\[0,0,\\"(.*?)\\"\]/g)];
  const sheets = matches
    .map((match) => {
      const gid = match[1];
      const name = match[2]?.replaceAll('\\"', '"');

      return gid && name ? { gid, name } : null;
    })
    .filter((sheet): sheet is SheetMeta => sheet !== null);

  if (sheets.length === 0) {
    throw new Error("Không tìm thấy tab nào trong Google Sheet.");
  }

  return sheets;
}

async function fetchSheetQuestions(spreadsheetId: string, sheet: SheetMeta): Promise<Question[]> {
  const url = new URL(`https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq`);
  url.searchParams.set("tqx", "out:json");
  url.searchParams.set("gid", sheet.gid);

  const response = await fetch(url, {
    cache: "no-store",
  });

  if (!response.ok) {
    return [];
  }

  const text = await response.text();
  const data = parseGvizJson(text);
  const rows = data.table?.rows ?? [];
  const values = rows.map((row) => row.c?.map((cell) => String(cell?.v ?? cell?.f ?? "")) ?? []);
  const [headers, ...questionRows] = values;

  if (!headers) {
    return [];
  }

  return questionRows
    .map((row, index) => normalizeRow(headers, row, sheet, index))
    .filter((question): question is Question => question !== null);
}

function parseGvizJson(text: string): GvizResponse {
  const jsonStart = text.indexOf("{");
  const jsonEnd = text.lastIndexOf("}");

  if (jsonStart === -1 || jsonEnd === -1) {
    throw new Error("Google Sheets trả về dữ liệu không đúng định dạng.");
  }

  return JSON.parse(text.slice(jsonStart, jsonEnd + 1)) as GvizResponse;
}

function normalizeRow(headers: string[], row: string[], sheet: SheetMeta, index: number): Question | null {
  const value = (key: string) => row[headers.findIndex((header) => header.trim() === key)]?.trim() ?? "";

  const question = value("question");
  const A = value("A");
  const B = value("B");
  const C = value("C");
  const D = value("D");
  const answer = normalizeAnswer(value("answer"));

  if (!question || !A || !B || !C || !D || !answer) {
    return null;
  }

  return {
    id: value("id") || `${sheet.gid}-${index + 1}`,
    question,
    A,
    B,
    C,
    D,
    answer,
    explanation: value("explanation") || "Chưa có lời giải.",
    level: value("level") || "Normal",
  };
}

function normalizeAnswer(answer: string): AnswerOption | null {
  const normalized = answer.trim().toUpperCase();
  return normalized === "A" || normalized === "B" || normalized === "C" || normalized === "D" ? normalized : null;
}
