import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: "Web Ôn Thi",
  description: "Luyện tập, thi thử và ôn lại câu sai bằng Next.js + Google Sheets",
};

import GAClient from "@/components/GAClient";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body>
        {children}
        <GAClient />
      </body>
    </html>
  );
}
