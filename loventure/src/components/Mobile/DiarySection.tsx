// components/Moblie/DiarySection.tsx
// 테스트용
"use client";

/* 수정 필요한 사항 */
/* Line 247 부근 교환일기 구문 변경 */


import React, { useState, useEffect } from "react";
import dayjs from "dayjs";
import clsx from "clsx";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

import { SquareChevronLeft, SquareChevronRight, CalendarHeart, Sun, Cloudy, CloudRain, Snowflake, Pencil, BookX } from "lucide-react";
/* ------------------------------------------------------------------ */
/* 타입 정의                                                            */
/* ------------------------------------------------------------------ */
interface Journal {
  _id: string;
  date: string;
  title: string;
  content: string;
  mood?: string;
  weather?: string;
  createdAt: string;
  senderId: {
    _id: string;
    nickname: string;
    profileImage: string;
  };
  isReadBy?: string[];
}

/* ------------------------------------------------------------------ */
/* 컴포넌트                                                            */
/* ------------------------------------------------------------------ */
export default function DiarySection() {
  /* ----------공통 상태---------- */
  const router = useRouter();
  const { isLoggedIn, loading, user } = useAuth();

  /* ----------캘린더/폼 상태---------- */
  const [currentDate, setCurrentDate] = useState(dayjs());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  /* ----------일기 데이터 및 입력값---------- */
  const [journals, setJournals] = useState<Journal[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [mood, setMood] = useState("");
  const [selectedWeather, setSelectedWeather] = useState<string | null>(null);
  const [partnerId, setPartnerId] = useState<string | null>(null);

  /* ----------날씨 이모지 매핑---------- */
  const weatherEmojiMap: { [emoji: string]: string } = {
    
    "☀️": "sunny",
    "⛅": "cloudy",
    "🌧️": "rainy",
    "❄️": "snowy",
  };
  const weatherCodeToEmoji = Object.fromEntries(
    Object.entries(weatherEmojiMap).map(([emoji, code]) => [code, emoji])
  );

  /* ------------------------------------------------------------------ */
  /* API 통신                                                            */
  /* ------------------------------------------------------------------ */
  const fetchJournals = async () => {
    try {
      const res = await fetch("/api/journal");
      const data = await res.json();
      if (res.ok && data.data?.journals) {
        setJournals(data.data.journals);
        setPartnerId(data.data.partnerId);
      }
    } catch (err) {
      console.error("Error fetching journals:", err);
    }
  };

  const markAsRead = async (journalId: string) => {
    try {
      const res = await fetch(`/api/journal/${journalId}/read`, {
        method: "PATCH",
      });
      if (res.ok && user) {
        setJournals((prev) =>
          prev.map((j) =>
            j._id === journalId && !j.isReadBy?.includes(user._id)
              ? { ...j, isReadBy: [...(j.isReadBy || []), user._id] }
              : j
          )
        );
      }
    } catch (err) {
      console.error("Error marking journal as read:", err);
    }
  };

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      alert("Title and content are required.");
      return;
    }
    try {
      const res = await fetch("/api/journal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: selectedDate,
          title,
          content,
          mood,
          weather: weatherEmojiMap[selectedWeather || ""] || "etc",
        }),
      });

      const contentType = res.headers.get("content-type");
      const data = contentType?.includes("application/json")
        ? await res.json()
        : null;

      if (res.ok && data?.data.journal) {
        await fetchJournals(); // 목록 새로고침
        // 입력값 초기화
        setTitle("");
        setContent("");
        setMood("");
        setSelectedWeather(null);
        setSelectedDate(null);
      } else {
        alert(data?.message || "저장 실패");
      }
    } catch (err) {
      console.error("Error submitting journal:", err);
    }
  };

  /* ------------------------------------------------------------------ */
  /* 사이드 이펙트                                                       */
  /* ------------------------------------------------------------------ */
  // 로그인 검사
  useEffect(() => {
    if (!loading && !isLoggedIn) router.push("/login");
  }, [loading, isLoggedIn, router]);

  // 초기 데이터 로드
  useEffect(() => {
    fetchJournals();
  }, []);

  // 날짜·저널 동기화
  useEffect(() => {
    const journalForDate = journals.find(
      (j) => dayjs(j.createdAt).format("YYYY-MM-DD") === selectedDate
    );

    if (journalForDate) {
      setTitle(journalForDate.title || "");
      setContent(journalForDate.content || "");
      setMood(journalForDate.mood || "");
      setSelectedWeather(
        journalForDate.weather ? weatherCodeToEmoji[journalForDate.weather] : ""
      );
    } else {
      setTitle("");
      setContent("");
      setMood("");
      setSelectedWeather(null);
    }
  }, [selectedDate, journals]);

  // 읽음 처리
  const filteredJournal = journals.find(
    (j) => dayjs(j.date).format("YYYY-MM-DD") === selectedDate
  );

  useEffect(() => {
    if (!filteredJournal || !user) return;

    const isMine = filteredJournal.senderId._id === user._id;
    const alreadyRead = filteredJournal.isReadBy?.includes(user._id);
    if (!isMine && !alreadyRead) markAsRead(filteredJournal._id);
  }, [filteredJournal, user]);

  /* ------------------------------------------------------------------ */
  /* 렌더링 준비: 달력 날짜 배열                                          */
  /* ------------------------------------------------------------------ */
  const startOfMonth = currentDate.startOf("month").startOf("week");
  const endOfMonth = currentDate.endOf("month").endOf("week");
  const days: dayjs.Dayjs[] = [];
  let day = startOfMonth;
  while (day.isBefore(endOfMonth) || day.isSame(endOfMonth)) {
    days.push(day);
    day = day.add(1, "day");
  }

  /* ------------------------------------------------------------------ */
  /* 로딩 처리                                                           */
  /* ------------------------------------------------------------------ */

const isMobile =
    typeof window !== "undefined" && window.innerWidth < 640; // calendar.tsx 방식

  if (loading || !isLoggedIn || !user) return null;

  /* ----------- JSX ----------- */
  return (
    <div className="min-h-screen flex">
      {/* ─────────────── 날짜 선택 화면 ─────────────── */}
      {!selectedDate && (
        <div className="mx-auto bg-[#fdf6e3] rounded-2xl shadow p-6 w-full max-w-4xl">
          {/* 월 이동 헤더 (calendar.tsx 디자인) */}
          <div className="mb-4 text-center">
            <h2 className="text-lg sm:text:xl font-bold">
              {/* 지금 교환 일기라 되어 있는 부분 OO❤OO의 교환일기 이렇게 유저 이름으로 넣어주셈 */}
              교환 일기 
            </h2>
          </div>

          <div className="flex justify-between items-center mb-4">
            <button onClick={() => setCurrentDate(currentDate.subtract(1, "month"))}>
              <SquareChevronLeft size={24} />
            </button>
            <h2 className="text-xl font-bold">{currentDate.format("MMMM YYYY")}</h2>
            <button onClick={() => setCurrentDate(currentDate.add(1, "month"))}>
              <SquareChevronRight size={24} />
            </button>
          </div>

          {/* 요일 헤더 */}
          <div className="grid grid-cols-7 mb-2">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <div key={d} className="text-center font-semibold text-xs sm:text-sm">
                {d}
              </div>
            ))}
          </div>

          {/* 날짜 셀 (calendar.tsx 외형 차용) */}
          <div className="grid grid-cols-7 auto-rows-fr gap-2">
            {days.map((d) => {
              const formatted = d.format("YYYY-MM-DD");
              const isWritten = journals.some(
                (j) => dayjs(j.date).format("YYYY-MM-DD") === formatted
              );
              const isToday = formatted === dayjs().format("YYYY-MM-DD");

              return (
                <div
                  key={formatted}
                  onClick={() => setSelectedDate(formatted)}
                  className={clsx(
                    "rounded-2xl border cursor-pointer transition",
                    isMobile
                      ? "h-14 p-1 overflow-hidden text-[10px] bg-[#fdf6e3]"
                      : "aspect-square p-2 overflow-auto bg-[#fdf6e3]",
                    isWritten ? "bg-blue-100 hover:bg-blue-200" : "hover:bg-blue-100",
                    isToday && "ring-2 ring-blue-300"
                  )}
                >
                  <div className="font-bold text-[10px] sm:text-sm mb-1">{d.date()}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------- */}
      {/* 작성·열람 화면                                                 */}
      {/* -------------------------------------------------------------- */}
      {selectedDate && (
        <div className="w-full max-w-4xl bg-[#f6fde7] rounded-xl shadow-lg p-6 flex flex-col gap-4">
          {/* 뒤로가기(날짜 재선택) */}
          <div className="flex items-center justify-between">
            <button
              className="text-xl text-gray-700 hover:underline flex items-center gap-2 px-4 py-2 -ml-4"
              onClick={() => setSelectedDate(null)}
            >
              <span><CalendarHeart /></span>
            </button>
          </div>

          <h2 className="text-lg font-semibold">
            {dayjs(selectedDate).format("YYYY년 MM월 DD일")}
          </h2>

          {/* 이미 작성된 일기가 있는 경우 → 읽기 모드 */}
          {filteredJournal ? (
            <div className="border:none outline:none p-4 rounded border">
              <p className="text-lg font-bold">제목: {filteredJournal.title}</p>
              <p className="text-sm text-gray-500">
                작성자: {filteredJournal.senderId.nickname}
              </p>
              {filteredJournal.mood && <p>기분: {filteredJournal.mood}</p>}
              {filteredJournal.weather && (
                <p>날씨: {weatherCodeToEmoji[filteredJournal.weather]}</p>
              )}
              <p className="mt-2 whitespace-pre-wrap">{filteredJournal.content}</p>

              {/* 읽음 여부(내가 작성한 경우만 표시) */}
              {user && filteredJournal.senderId._id === user._id && (
                <p className="text-xs mt-2">
                  {filteredJournal.isReadBy?.includes(partnerId || "")
                    ? "✅ 상대방 읽음"
                    : "📖 상대방 읽지 않음"}
                </p>
              )}

              {/* 수정, 삭제 버튼 */}
              <div className="mt-10 flex justify-between">
                <button className="flex items-center gap-1 text-gray-600 hover:text-indigo-600">
                  <Pencil size={24} />
                </button>

                <button className="flex items-center gap-1 text-red-500 hover:text-red-600">
                  <BookX size={24} />
                </button>
              </div>
            
            </div>
          ) : (
            /* 작성 폼 */
            <>
              <input
                type="text"
                placeholder="제목"
                className="bg-[#f6fde7] p-3 border rounded-md w-full"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />

              {/* 날씨 선택 */}
              <div className="flex items-center gap-4">
                {/*<label className="text-sm font-medium whitespace-nowrap">날씨</label>*/}
                <div className="flex gap-2">
                  {Object.entries(weatherEmojiMap).map(([emoji, code]) => (
                    <button
                      key={code}
                      onClick={() => setSelectedWeather(emoji)}
                      className={`text-2xl p-2 rounded-full transition
                        ${
                          selectedWeather === emoji
                            ? "bg-blue-100 ring-1 ring-blue-400"
                            : "hover:bg-gray-100"
                        }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* 내용 입력 */}
              <textarea
                placeholder="내용을 입력해 주세요."
                className="bg-[#f6fde7] h-80 p-4 border rounded resize-none outline-none"
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />

              {/* 기분 입력(옵션) */}
              {/* <input
                type="text"
                placeholder="오늘의 기분(선택사항)"
                className="p-3 border rounded-md w-full"
                value={mood}
                onChange={(e) => setMood(e.target.value)}
              /> */}

              <div className="flex justify-end">
                <button
                  className="bg-blue-300 text-white px-4 py-2 rounded hover:bg-blue-300 disabled:bg-red-400"
                  onClick={handleSubmit}
                  disabled={!title.trim() || !content.trim()}
                >
                  작성완료
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}