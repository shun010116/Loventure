"use client";

import Calendar from "@/components/Calendar"; 
import ClientLayout from "@/app/ClientLayout";

export default function CalendarPage() {
  return (
    <main className="min-h-screen p-4">
        <Calendar compact={false} editable={true} />
    </main>
  );
}