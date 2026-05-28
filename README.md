# Web Ôn Thi

Ứng dụng ôn thi bằng Next.js, có thể chạy bằng dữ liệu mẫu hoặc đọc dữ liệu public từ Google Sheets qua OpenSheet.

## Chạy local

```bash
npm install
npm run dev
```

Mở `http://localhost:3000`.

## Cắm Google Sheets

Tạo file `.env.local`:

```bash
NEXT_PUBLIC_SHEET_ID=your_google_sheet_id
```

Mỗi sheet là một chuyên đề. Dòng đầu tiên cần có các cột:

```text
id, question, A, B, C, D, answer, explanation, level
```

Nếu không có `NEXT_PUBLIC_SHEET_ID`, app dùng dữ liệu mẫu trong `src/data/sampleQuestions.ts`.
