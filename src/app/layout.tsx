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
      <head>
        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-L8MK82ZMPY"
          strategy="afterInteractive"
        />
        <Script
          id="google-analytics"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-L8MK82ZMPY');
            `,
          }}
        />
      </head>
      <body>
        {children}
        <GAClient />
      </body>
    </html>
  );
}
