"use client";

// components/CalendarSection.tsx
import Calendar from "@/components/Calendar";

export default function CalendarSection() {
  return (
    <div className="bg-[#fdf6e3] p-4 rounded-xl sm:hidden">
      <Calendar editable={true} compact={true} />
    </div>
  );
}