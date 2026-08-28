import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "團購文案產生器",
  description: "輸入商品資料，產生 Facebook、Instagram、LINE 團購文案與一致風格的圖片、影片 Prompt。",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-Hant">
      <body>{children}</body>
    </html>
  );
}
