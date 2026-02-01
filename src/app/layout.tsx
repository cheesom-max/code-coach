import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "code-coach | 바이브코더를 위한 교육형 AI 코드 리뷰",
  description: "AI로 코드 짜는 바이브코더가 실력도 키울 수 있는 교육형 코드 리뷰 서비스. 문제 + 이유 + 해결책 + 학습자료를 한번에!",
  keywords: ["코드 리뷰", "AI", "바이브코더", "개발자 교육", "코딩 학습"],
  openGraph: {
    title: "code-coach | 바이브코더를 위한 교육형 AI 코드 리뷰",
    description: "AI로 코드 짜는 바이브코더가 실력도 키울 수 있는 교육형 코드 리뷰 서비스",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50`}
      >
        {children}
      </body>
    </html>
  );
}
