import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@/styles/globals.css";
import Link from 'next/link';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Loventure",
  description: "Generated by create next app",
};

export default function RootLayout({
  return (
    <header>
      {/* Header */}
      <header className="flex justify-between items-center border-b pb-2 mb-4">
      <h1 className="text-2xl font-bold">Loventure</h1>
      <div className="relative">
        <Link href="/login"> Login </Link>
        <button className="text-xl">🔔</button>
        <span className="absolute -top-1 -right-1 text-xs text-red-500 font-bold">0</span>
      </div>
    </header>
  );
}
