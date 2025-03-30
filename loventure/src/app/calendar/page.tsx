"use client"

import React, { useState } from "react";
import dayjs from "dayjs";

interface Schedule {
  date: string;  // YYYY-MM-DD
  text: string;
}

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(dayjs());
  const [selectedDate, setSelectedDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [schedule, setSchedule] = useState<Schedule[]>([]);
  const [newEvent, setNewEvent] = useState("");

  const startOfMonth = currentDate.startOf("month").startOf("week");
  const endOfMonth = currentDate.endOf("month").endOf("week");
  const days = [];
  let day = startOfMonth;

  while (day.isBefore(endOfMonth)) {
    days.push(day);
    day = day.add(1, "day");
  }

  const handleAddEvent = () => {
    if (newEvent.trim() === "") return;
    setSchedule([...schedule, { date: selectedDate, text: newEvent }]);
    setNewEvent("");
  };

  const getEventsForDate = (date: string) =>
    schedule.filter((e) => e.date === date);

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <button onClick={() => setCurrentDate(currentDate.subtract(1, "month"))}>
          ◀️
        </button>
        <h2 className="text-xl font-bold">{currentDate.format("MMMM YYYY")}</h2>
        <button onClick={() => setCurrentDate(currentDate.add(1, "month"))}>
          ▶️
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d} className="text-center font-semibold">{d}</div>
        ))}
        {days.map((d) => {
          const formatted = d.format("YYYY-MM-DD");
          const isSelected = selectedDate === formatted;
          const events = getEventsForDate(formatted);  

          return (
            <div
              key={formatted}
              className={`border rounded cursor-pointer flex flex-col items-start p-2 h-32 overflow-auto ${
                isSelected ? "bg-blue-300" : "hover:bg-blue-100"
              }`}  
              onClick={() => setSelectedDate(formatted)}
            >
              <div className="font-bold">{d.date()}</div>
              {events.map((e, idx) => (  
                <div key={idx} className="text-xs text-left mt-1 bg-gray-100 rounded px-1">
                  {e.text}
                </div>
              ))} 
            </div>
          );
        })}
      </div>

      {/* Schedule Panel */}
      <div className="mt-4 border-t pt-4">
        <h3 className="font-bold mb-2">
          {dayjs(selectedDate).format("YYYY-MM-DD")} 일정
        </h3>
        <ul className="mb-2">
          {getEventsForDate(selectedDate).map((e, idx) => (
            <li key={idx} className="text-sm">• {e.text}</li>
          ))}
        </ul>
        <div className="flex gap-2">
          <input
            type="text"
            value={newEvent}
            onChange={(e) => setNewEvent(e.target.value)}
            className="border p-2 rounded w-full"
            placeholder="일정을 입력하세요"
          />
          <button
            onClick={handleAddEvent}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            추가
          </button>
        </div>
      </div>
    </div>
  );
}