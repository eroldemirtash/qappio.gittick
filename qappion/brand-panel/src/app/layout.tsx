import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { BrandLayout } from "@/components/layout/BrandLayout";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Qappio Marka Paneli",
  description: "Markalar için görev ve ürün yönetim paneli",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body className={`${inter.variable} font-sans antialiased`}>
        <BrandLayout>{children}</BrandLayout>
      </body>
    </html>
  );
}
