import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ToastProvider } from "@/components/admin/Toast";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "송도 캠핑장 버스킹 & 플리마켓 | 매주 열리는 음악과 마켓",
  description:
    "매주 주말 송도 국제캠핑장에서 열리는 버스킹 공연과 플리마켓. 버스커와 셀러를 모집합니다. 음악과 마켓이 있는 특별한 주말을 송도에서 만나보세요.",
  keywords: "송도캠핑장, 버스킹, 플리마켓, 인천, 주말공연, 야외무대, 핸드메이드마켓",
  openGraph: {
    title: "송도 캠핑장 버스킹 & 플리마켓",
    description: "매주 주말 송도에서 열리는 음악과 마켓",
    type: "website",
    url: "https://songdo-busking-market.com/",
    images: [
      {
        url: "https://songdo-busking-market.com/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "송도 캠핑장 버스킹 & 플리마켓",
      },
    ],
  },
  other: {
    "geo.region": "KR-28",
    "geo.placename": "Incheon, Songdo",
    "geo.position": "37.3886;126.6432",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="scroll-smooth">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/remixicon@4.0.0/fonts/remixicon.css"
        />
      </head>
      <body
        className="font-sans antialiased bg-white text-gray-900 selection:bg-orange-200 selection:text-orange-900"
        style={{
          fontFamily: "'Noto Sans KR', 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif",
          ['--font-noto-sans-kr' as string]: "'Noto Sans KR', 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif",
          ['--font-playfair' as string]: "'Times New Roman', Georgia, serif",
        }}
      >
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
