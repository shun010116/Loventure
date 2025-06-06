// components/CalendarSection.tsx
import Calendar from "@/components/Calendar";

export default function CalendarSection() {
  return (
    <div className="bg-white p-4 rounded-xl sm:hidden">
      <Calendar editable={false} compact={true} />
    </div>
  );
}