# Web Ôn Thi với Next.js + Google Sheets

## Mục tiêu

Xây dựng website ôn thi sử dụng:

-   Next.js
-   Google Sheets làm database
-   Không cần CMS
-   Dễ cập nhật dữ liệu
-   Chi phí gần như bằng 0

------------------------------------------------------------------------

## Kiến trúc

``` text
Google Sheets
       ↓
Google Sheets API
       ↓
Next.js
       ↓
Người dùng
```

------------------------------------------------------------------------

## Cấu trúc Google Sheets

Mỗi Sheet tương ứng một dạng bài.

Ví dụ:

``` text
Hàm số
Tích phân
Hình học
Xác suất
```

### Cấu trúc dữ liệu

  ---------------------------------------------------------------------------
  id   question      A   B    C    D   answer      explanation      level
  ---- ------------- --- ---- ---- --- ----------- ---------------- ---------
  1    Đạo hàm x² là x   2x   x²   2   B           Công thức cơ bản Easy
       gì?                                                          

  ---------------------------------------------------------------------------

------------------------------------------------------------------------

## Chức năng chính

### 1. Danh sách chuyên đề

Tự động đọc tên các sheet và sinh menu.

### 2. Luyện tập

-   Random câu hỏi
-   Chọn đáp án
-   Kiểm tra kết quả
-   Lưu kết quả trong localstogare hoặc

### 3. Thi thử

-   Trộn câu hỏi từ nhiều sheet
-   Sinh đề ngẫu nhiên

### 4. Xem lời giải

Hiển thị cột `explanation`.

### 5. Ôn lại câu sai

Lưu bằng LocalStorage.

### 6. Flashcard

Hiển thị mặt trước / mặt sau.

### 7. Thống kê

-   Số câu đúng
-   Số câu sai
-   Tỷ lệ hoàn thành

------------------------------------------------------------------------

## Lấy dữ liệu Google Sheets

### Cách 1: OpenSheet

Ví dụ:

``` text
https://opensheet.elk.sh/SHEET_ID/Hàm số
```

Trả về JSON.

Ưu điểm:

-   Không cần backend
-   Không cần API key

Nhược điểm:

-   Dữ liệu public

------------------------------------------------------------------------

### Cách 2: Google Sheets API

Sử dụng Service Account.

Package:

``` bash
npm install googleapis
```

Ví dụ:

``` ts
const result = await sheets.spreadsheets.values.get({
  spreadsheetId: process.env.SHEET_ID,
  range: "Hàm số!A:H",
});
```

Ưu điểm:

-   An toàn
-   Production-ready

------------------------------------------------------------------------

## Cấu trúc Next.js

``` text
src/
├── app/
├── components/
├── services/
│   └── sheets.ts
├── types/
├── hooks/
└── utils/
```

------------------------------------------------------------------------

------------------------------------------------------------------------

