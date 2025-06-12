"use client";

import React, { useState, useEffect } from "react";
import dayjs from "dayjs";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Schedule } from "./Types";

interface UserInfo {
  _id: string;
  nickname: string;
  email?: string;
}

interface CalendarProps {
  compact?: boolean;
  editable?: boolean;
}

export default function Calendar({ compact = false, editable = true }: CalendarProps) {
  const router = useRouter();
  const { isLoggedIn, loading, user } = useAuth();

  const [currentDate, setCurrentDate] = useState(dayjs());
  const [selectedDate, setSelectedDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [schedule, setSchedule] = useState<Schedule[]>([]);
  const [newEvent, setNewEvent] = useState("");
  const [description, setDescription] = useState("");
  const [endDate, setEndDate] = useState(selectedDate);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [selectedDaySchedules, setSelectedDaySchedules] = useState<Schedule[]>([]);

  const [allMembers, setAllMembers] = useState<UserInfo[]>([]);
  const [participants, setParticipants] = useState<string[]>([]);

  useEffect(() => {
    if (!loading && !isLoggedIn) {
      router.push("/login");
    }
  }, [loading, isLoggedIn, router]);

  useEffect(() => {
    if (!isLoggedIn) return;

    const fetchSchedule = async () => {
      try {
        const res = await fetch("/api/schedule");
        const data = await res.json();
        if (res.ok) {
          setSchedule(data.data.schedules);
        }
      } catch (err) {
        console.error("Error fetching schedules:", err);
      }
    };

    const fetchMembers = async () => {
      try {
        const res = await fetch("/api/couple/me");
        const data = await res.json();
        if (res.ok && data.data?.users) {
          setAllMembers(data.data.users);
          if (user) setParticipants([user._id]);
        }
      } catch (err) {
        console.error("Error fetching members:", err);
      }
    };

    fetchSchedule();
    fetchMembers();
  }, [isLoggedIn, user]);

  const toggleParticipant = (id: string) => {
    if (user && id === user._id) return;
    setParticipants((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const handleAddEvent = async () => {
    if (newEvent.trim() === "") return;
    const payload = {
      title: newEvent,
      description,
      startDate: selectedDate,
      endDate,
      repeat: "none",
      isCompleted,
      participants,
    };

    let res;
    if (editingId) {
      res = await fetch(`/api/schedule/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } else {
      res = await fetch("/api/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    }

    const data = await res.json();
    if (res.ok) {
      if (editingId && data?.data?.schedule) {
        setSchedule((prev) => prev.map((s) => s._id === editingId ? data.data.schedule : s));
      } else if (data?.data?.schedule) {
        setSchedule((prev) => [...prev, data.data.schedule]);
      }
      resetForm();
    } else {
      alert(data?.message || "Failed to add event");
    }
  };

  const handleEdit = (item: Schedule) => {
    setNewEvent(item.title);
    setDescription(item.description);
    setSelectedDate(dayjs(item.startDate).format("YYYY-MM-DD"));
    setEndDate(dayjs(item.endDate).format("YYYY-MM-DD"));
    setEditingId(item._id);
    setParticipants(item.participants);
    setIsCompleted(item.isCompleted);
  };

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/schedule/${id}`, { method: "DELETE" });
    if (res.ok) {
      setSchedule((prev) => prev.filter((s) => s._id !== id));
      resetForm();
    } else {
      alert("Failed to delete event");
    }
  };

  const resetForm = () => {
    setNewEvent("");
    setDescription("");
    setEndDate(selectedDate);
    setEditingId(null);
    setIsCompleted(false);
    setParticipants(user ? [user._id] : []);
    setSelectedDaySchedules([]);
  };

  const getEventsForDate = (date: string) =>
    (schedule ?? []).filter((e) => dayjs(e.startDate).format("YYYY-MM-DD") === date);

  const startOfMonth = currentDate.startOf("month").startOf("week");
  const endOfMonth = currentDate.endOf("month").endOf("week");
  const days = [];
  let day = startOfMonth;

  while (day.isBefore(endOfMonth)) {
    days.push(day);
    day = day.add(1, "day");
  }

  if (loading || !isLoggedIn || !user) return null;

  return (
    <div className={`mx-auto p-4 ${compact ? "max-w-3xl" : "max-w-4xl"}`}>
      <div className="flex justify-between items-center mb-4">
        <button onClick={() => setCurrentDate(currentDate.subtract(1, "month"))}>◀️</button>
        <h2 className="text-xl font-bold">{currentDate.format("MMMM YYYY")}</h2>
        <button onClick={() => setCurrentDate(currentDate.add(1, "month"))}>▶️</button>
      </div>

      {/* 달력 요일 header */}
      <div className="grid grid-cols-7 mb-2">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d} className="text-center font-semibold">{d}</div>
        ))}
      </div>

      {/* 달력 날짜 cell */}
      <div className="grid grid-cols-7 auto-rows-fr gap-2">
        {days.map((d) => {
          const formatted = d.format("YYYY-MM-DD");
          const isSelected = selectedDate === formatted;
          const events = getEventsForDate(formatted);

          return (
            <div
              key={formatted}
              className={`aspect-square rounded-2xl border p-2 cursor-pointer overflow-auto flex flex-col items-start justify-start text-sm transition-all ${
                isSelected ? "bg-blue-300" : "hover:bg-blue-100"
              }`}
              onClick={() => {
                setSelectedDate(formatted);
                setSelectedDaySchedules(events);
              }}
            >
              <div className="font-bold text-sm mb-1">{d.date()}</div>
              {events.map((e, idx) => (
                <div key={idx} className="text-xs text-left w-full bg-gray-100 rounded px-1">
                  <span>{e.title}</span>
                  {editable && e.isCompleted && <span className="ml-1 text-green-600">✔️</span>}
                </div>
              ))}
            </div>
          );
        })}
      </div>

      {editable && (
        <div className="mt-4 border-t pt-4">
          <h3 className="font-bold mb-2">{dayjs(selectedDate).format("YYYY-MM-DD")} 일정</h3>

          <ul className="mb-4 space-y-2">
            {selectedDaySchedules.map((e) => (
              <li key={e._id} className="flex justify-between items-center text-sm">
                <div>
                  • {e.title} {e.isCompleted && <span className="ml-1 text-green-600">✔️</span>}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(e)}
                    className="text-blue-500 hover:underline"
                  >
                    ✏️ 수정
                  </button>
                  <button
                    onClick={() => handleDelete(e._id)}
                    className="text-red-500 hover:underline"
                  >
                    🗑️ 삭제
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <div className="mb-2">
            <span className="text-sm font-semibold">참가자:</span>
            <div className="flex gap-2 mt-1 flex-wrap">
              {allMembers.map((member) => (
                <label key={member._id} className="flex items-center gap-1 text-sm">
                  <input
                    type="checkbox"
                    checked={participants.includes(member._id)}
                    onChange={() => toggleParticipant(member._id)}
                    disabled={member._id === user._id}
                  />
                  {member.nickname}
                </label>
              ))}
            </div>
          </div>

          <div className="flex gap-2 items-center mb-4">
            <input
              type="checkbox"
              checked={!!isCompleted}
              onChange={() => setIsCompleted(!isCompleted)}
            />
            <span className="text-sm">완료</span>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={newEvent}
              onChange={(e) => setNewEvent(e.target.value)}
              className="border p-2 rounded w-1/3"
              placeholder="일정을 입력하세요"
            />
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="상세 설명"
              className="border p-2 rounded w-1/2"
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
            {editingId && (
              <button
                onClick={resetForm}
                className="bg-red-500 text-white px-4 py-2 rounded"
              >
                취소
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
