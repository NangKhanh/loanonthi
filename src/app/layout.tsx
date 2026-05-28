import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Web Ôn Thi",
  description: "Luyện tập, thi thử và ôn lại câu sai bằng Next.js + Google Sheets",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
