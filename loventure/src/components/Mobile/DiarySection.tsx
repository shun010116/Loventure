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

import {
  SquareChevronLeft,
  SquareChevronRight,
  CalendarHeart,
  Sun,
  Cloudy,
  CloudRain,
  Snowflake,
  Pencil,
  BookX,
  BookCheck,
  SquareX,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/* 타입 정의                                                            */
/* ------------------------------------------------------------------ */
interface Journal {
  _id: string;
  date: string;
  title: string;
  content: string;
  mood?: string;
  weather?: string; // "sunny" | "cloudy" | "rainy" | "snowy" | "etc"
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
  const { isLoggedIn, loading, user, partner } = useAuth();

  /* ----------캘린더/폼 상태---------- */
  const [currentDate, setCurrentDate] = useState(dayjs());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  /* ----------일기 데이터 및 입력값---------- */
  const [journals, setJournals] = useState<Journal[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [mood, setMood] = useState("");
  // 이모지 대신 lucide-icons와 string 매핑: "sunny" | "cloudy" | "rainy" | "snowy"
  const [selectedWeather, setSelectedWeather] = useState<string | null>(null);
  const [partnerId, setPartnerId] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  /* ----------날씨 아이콘/매핑 (lucide)---------- */
  const weatherIconMap = {
    sunny: Sun,
    cloudy: Cloudy,
    rainy: CloudRain,
    snowy: Snowflake,
  } as const;

  const weatherOptions = [
    { code: "sunny", Icon: Sun },
    { code: "cloudy", Icon: Cloudy },
    { code: "rainy", Icon: CloudRain },
    { code: "snowy", Icon: Snowflake },
  ] as const;

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
          // lucide 아이콘 선택 결과를 문자열 코드로 그대로 저장
          weather: selectedWeather || "etc",
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
      // ✅ 서버에 저장된 문자열 코드를 그대로 상태로
      setSelectedWeather(journalForDate.weather || null);
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

  // 수정 버튼 클릭 핸들러
  const handleEdit = async () => {
    if (!filteredJournal) return;
    setEditing(true);
    setEditingId(filteredJournal._id);
    setTitle(filteredJournal.title);
    setContent(filteredJournal.content);
    setMood(filteredJournal.mood || "");
    setSelectedWeather(filteredJournal.weather || null);
  };

  // 교환일기 수정
  const handleUpdate = async () => {
    if (!filteredJournal) return;
    try {
      const res = await fetch(`/api/journal/${editingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          content,
          mood,
          weather: selectedWeather || "etc",
        }),
      });
      const data = await res.json();
      if (res.ok && data?.data?.journal) {
        await fetchJournals();
        setEditing(false);
      } else {
        alert(data?.message || "수정 실패");
      }
    } catch (err) {
      console.error("Error updating journal:", err);
    }
  }

  // 교환일기 삭제
  const handleDelete = async () => {
    if (!filteredJournal) return;
    if (!confirm("정말 삭제하시겠습니까?")) return;

    try {
      const res = await fetch(`/api/journal/${filteredJournal._id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        await fetchJournals();
        setSelectedDate(null);
        setEditing(false);
        setEditingId(null);
      } else {
        alert("삭제 실패");
      }
    } catch (err) {
      console.error("Error deleting journal:", err);
    }
  }

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
              {user?.nickname || "나"} ❤ {partner?.nickname || "파트너"}의 교환 일기 
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
        <div className="w-full max-w-4xl bg-[#f6fde7] dark:bg-[#f6fde7] dark:text-black rounded-xl shadow-lg p-6 flex flex-col gap-4">
          {/* 뒤로가기(날짜 재선택) */}
          <div className="flex items-center justify-between">
            <button
              className="text-xl text-gray-700 hover:underline flex items-center gap-2 px-4 py-2 -ml-4"
              onClick={() => {
                setSelectedDate(null);
                setEditing(false);
                setEditingId(null);
              }}
            >
              <span>
                <CalendarHeart />
              </span>
            </button>
          </div>

          <h2 className="text-lg font-semibold">
            {dayjs(selectedDate).format("YYYY년 MM월 DD일")}
          </h2>

          {/* 이미 작성된 일기가 있는 경우 → 읽기 모드 */}
          {filteredJournal && !editing ? (
            <div className="border:none outline:none p-4 rounded border">
              <p className="text-lg font-bold">제목: {filteredJournal.title}</p>
              <p className="text-sm text-gray-500">
                작성자: {filteredJournal.senderId.nickname}
              </p>
              {filteredJournal.mood && <p>기분: {filteredJournal.mood}</p>}

              {/* 날씨 아이콘 표시 (lucide) */}
              {filteredJournal.weather && (() => {
                const Icon =
                  weatherIconMap[
                    filteredJournal.weather as keyof typeof weatherIconMap
                  ];
                return Icon ? (
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm text-gray-600">
                      날씨 : 
                    </span>
                    <Icon size={20} />                    
                  </div>
                ) : null;
              })()}

              <p className="mt-2 whitespace-pre-wrap">{filteredJournal.content}</p>

              {/* 읽음 여부(내가 작성한 경우만 표시) */}
              {user && filteredJournal.senderId._id === user._id && (
                filteredJournal.isReadBy?.includes(partnerId || "") ? (
                  <p className="text-xs mt-2 flex items-center gap-1 text-green-600">
                    <BookCheck size={14} />
                    <span>상대방 읽음</span>
                  </p>
                ) : (
                  <p className="text-xs mt-2 flex items-center gap-1 text-red-500">
                    <SquareX size={14} />
                    <span>상대방 읽지 않음</span>
                  </p>
                )
              )}

              {/* 수정, 삭제 버튼 */}
              <div className="mt-10 flex justify-between">
                <button
                  className="flex items-center gap-1 text-gray-600 hover:text-indigo-600"
                  onClick={handleEdit}>
                  <Pencil size={24} />
                </button>

                <button
                  className="flex items-center gap-1 text-red-500 hover:text-red-600"
                  onClick={handleDelete}>
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

              {/* 날씨 선택 (lucide 아이콘) */}
              <div className="flex items-center gap-4">
                <div className="flex gap-2">
                  {weatherOptions.map(({ code, Icon }) => (
                    <button
                      key={code}
                      onClick={() => setSelectedWeather(code)}
                      className={`p-2 rounded-full transition ${
                        selectedWeather === code
                          ? "bg-blue-100 ring-1 ring-blue-400"
                          : "hover:bg-gray-100"
                      }`}
                      aria-label={code}
                      type="button"
                    >
                      <Icon size={24} />
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
                  onClick={editing ? handleUpdate : handleSubmit}
                  disabled={!title.trim() || !content.trim()}
                >
                  {editing ? "수정완료" : "작성완료"}
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
