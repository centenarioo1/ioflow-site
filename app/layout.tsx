// app/layout.tsx
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
  title: {
    default: "BIOFLOW® - Nutrição Organomineral & Solo Vivo",
    template: "%s | BIOFLOW®",
  },
  description: "Nutrição vegetal de alta performance, substratos calibrados e adubos orgânicos fracionados para horticultura intensiva e solo vivo.",
  keywords: ["nutrientes organominerais", "solo vivo", "hidroponia", "bioflow", "fertilizante orgânico"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}