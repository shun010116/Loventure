"use client";

import Calendar from "@/components/Calendar"; // ✅ 컴포넌트 import

export default function CalendarPage() {
  return (
    <main className="min-h-screen p-4">
      <Calendar compact={false} editable={true} />
    </main>
  );
}