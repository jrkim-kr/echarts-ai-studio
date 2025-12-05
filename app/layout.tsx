import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ECharts AI Studio - AI 기반 데이터 시각화",
  description: "LLM을 활용한 프롬프트 기반 차트 생성 대시보드",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}

