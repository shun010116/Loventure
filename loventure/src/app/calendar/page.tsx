"use client"

import React, { useState, useEffect } from "react";
import dayjs from "dayjs";
interface Schedule {
  _id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  repeat: string;
  isComplete: boolean;
  createdBy: string;
  participants: string[];
}

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(dayjs());
  const [selectedDate, setSelectedDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [schedule, setSchedule] = useState<Schedule[]>([]);
  const [newEvent, setNewEvent] = useState("");
  const [description, setDescription] = useState("");
  const [endDate, setEndDate] = useState(selectedDate);
  const [editingId, setEditingId] = useState<String | null>(null);

  // Fetch schedule data from the server
  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const res = await fetch("/api/schedule");
        const data = await res.json();
        if (res.ok) {
          setSchedule(data.schedules);
        } else {
          console.error("Failed to fetch schedules:", data.message);
        }
      } catch (err) {
        console.error("Error fetching schedules:", err);
      }
    };
    fetchSchedule();
  }, []);

  // Add a new event
  const handleAddEvent = async () => {
    if (newEvent.trim() === "") return;

    const payload = {
      title: newEvent,
      description,
      startDate: selectedDate,
      endDate,
      repeat: "none",
      isComplete: false,
      participants: [],
    };

    let res;
    if (editingId) {
      res = await fetch(`/api/schedule/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } else {
      res = await fetch("/api/schedule/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    }

    const data = await res.json();
    if (res.ok) {
      if (editingId) {
        setSchedule(schedule.map(s => s._id === editingId ? data.schedule : s));
      } else {
        setSchedule([...schedule, data.schedule]);
      }
      resetForm();
    } else {
      alert(data.message || "Failed to add Event");
    }
  };

  // Edit an event
  const handleEdit = (item: Schedule) => {
    setNewEvent(item.title);
    setDescription(item.description);
    setSelectedDate(dayjs(item.startDate).format("YYYY-MM-DD"));
    setEndDate(dayjs(item.endDate).format("YYYY-MM-DD"));
    setEditingId(item._id);
  };

  // Delete an event
  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/schedule/${id}`, { method: "DELETE" });
    if (res.ok) {
      setSchedule(schedule.filter((s) => s._id !== id));
    } else {
      alert ("Failed to delete event");
    }
  };

  const resetForm = () => {
    setNewEvent("");
    setDescription("");
    setEndDate(selectedDate);
    setEditingId(null);
  }

  // Get events for the selected date
  const getEventsForDate = (date: string) =>
    (schedule ?? []).filter((e) => dayjs(e.startDate).format("YYYY-MM-DD") === date);

  // Calculate Calendar days
  const startOfMonth = currentDate.startOf("month").startOf("week");
  const endOfMonth = currentDate.endOf("month").endOf("week");
  const days = [];
  let day = startOfMonth;

  while (day.isBefore(endOfMonth)) {
    days.push(day);
    day = day.add(1, "day");
  }

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
                  <span>{e.title}</span>
                  <div className="flex gap-1">
                    <button onClick={() => handleEdit(e)} className="text-blue-500">✏️</button>
                    <button onClick={() => handleDelete(e._id)} className="text-red-500">🗑️</button>
                  </div>
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
            <li key={idx} className="text-sm">• {e.title}</li>
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
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="상세 설명"
            className="border p-2 rounded"
          />

          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border p-2 rounded"
          />

          <button
            onClick={handleAddEvent}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            {editingId ? "수정 완료" : "일정 추가"}
          </button>
        </div>
      </div>
    </div>
  );
}