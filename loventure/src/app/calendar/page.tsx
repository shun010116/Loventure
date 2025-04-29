"use client";

import Calendar from "@/components/Calendar"; // ✅ 컴포넌트 import

export default function CalendarPage() {
  return (
    <main className="min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-4">전체 달력</h1>
      <Calendar compact={false} editable={true} />
    </main>
  );
}