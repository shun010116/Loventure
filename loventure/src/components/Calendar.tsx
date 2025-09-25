"use client";
// 변경해야할 사항
// 일정 추가 시에 스티커를 선택하도록 했는데 완료 시에 데이터베이스에 mapping된 string을 저장했다가
// 달력에 해당 스티커가 보이도록 수정해야함

import React, { useState, useEffect, Fragment } from "react";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import clsx from "clsx";

import { Dialog, Transition } from "@headlessui/react";
import { Schedule } from "./Types";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import type { LucideIcon } from "lucide-react";

import {
  SquareChevronLeft,
  SquareChevronRight,
  Pizza,
  Cake,
  Clapperboard,
  Gamepad2,
  Gem,
  BookOpenText,
  Car,
  Beer,
  HandHeart,
  TreePalm,
  Croissant,
  Tent,
  CircleX,
  Pen,
  Trash,
  CalendarPlus,
} from "lucide-react";

interface UserInfo {
  _id: string;
  nickname: string;
  email?: string;
}

interface CalendarProps {
  compact?: boolean;
  editable?: boolean;
}

dayjs.extend(isBetween);

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

  const [selectedSticker, setSelectedSticker] = useState<string | null>(null);

  /* 스티커 목록 */
const stickerOptions: ReadonlyArray<{ value: string; Icon: LucideIcon }> = [
  { value: "pizza",        Icon: Pizza },
  { value: "cake",         Icon: Cake },
  { value: "clapperboard", Icon: Clapperboard },
  { value: "gamepad",      Icon: Gamepad2 },
  { value: "gem",          Icon: Gem },
  { value: "book",         Icon: BookOpenText },
  { value: "car",          Icon: Car },
  { value: "beer",         Icon: Beer },
  { value: "handheart",    Icon: HandHeart },
  { value: "treepalm",     Icon: TreePalm },
  { value: "croissant",    Icon: Croissant },
  { value: "tent",         Icon: Tent },
];


  // 모바일 환경
  const isMobile = typeof window !== "undefined" && window.innerWidth < 640;
  const [isSheetOpen, setSheetOpen] = useState(false);
  const [mode, setMode] = useState<"view" | "add" | "edit">("view");

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
      sticker: selectedSticker,
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
        setSchedule((prev) =>
          prev.map((s) => (s._id === editingId ? data.data.schedule : s))
        );
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
    setSelectedSticker(item.sticker ?? null);
    setMode("edit");
    setSheetOpen(true);
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
    setSelectedDaySchedules(getEventsForDate(selectedDate));
    setSelectedSticker(null);
    setMode("view");
  };

  useEffect(() => {
    const events = getEventsForDate(selectedDate);
    setSelectedDaySchedules(events);
  }, [selectedDate, schedule]);

  const getEventsForDate = (date: string) => {
    return schedule.filter((e) => {
      const target = dayjs(date);
      const start = dayjs(e.startDate).startOf("day");
      const end = dayjs(e.endDate).endOf("day");
      return target.isBetween(start, end, null, "[]");
    });
  };

  const startOfMonth = currentDate.startOf("month").startOf("week");
  const endOfMonth = currentDate.endOf("month").endOf("week");
  const days = [];
  let day = startOfMonth;

  while (day.isBefore(endOfMonth)) {
    days.push(day);
    day = day.add(1, "day");
  }

  // 가장 먼저 등록된 일정 계산 (createdAt 없으면 startDate 기준)
  const pickFirstByCreated = (items: Schedule[]) => {
    if (items.length === 0) return null;
    const toTs = (x: Schedule) =>
      new Date((x as any).createdAt ?? x.startDate).getTime();
    return [...items].sort((a, b) => toTs(a) - toTs(b))[0];
  };

  if (loading || !isLoggedIn || !user) return null;

  return (
    <div
      className={clsx(
        "mx-auto p-4 bg-[#fdf6e3] dark:bg-[#fdf6e3] dark:text-black rounded-2xl shadow",
        compact ? "max-w-3xl" : "max-w-4xl"
      )}
    >
      {/* 월 이동 */}
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

      {/* 날짜 셀 */}
      <div className="grid grid-cols-7 auto-rows-fr gap-2">
        {days.map((d) => {
          const formatted = d.format("YYYY-MM-DD");
          const isSelected = selectedDate === formatted;
          const events = getEventsForDate(formatted);

          // 가장 먼저 등록된 일정만 선택
          const firstEvent = pickFirstByCreated(events);

          // 중앙에 표시할 스티커 아이콘 (사이즈 제어 위해 clone)
          const StickerIcon =
            firstEvent?.sticker
              ? stickerOptions.find((opt) => opt.value === firstEvent.sticker)?.Icon
              : undefined;

          return (
            <div
              key={formatted}
              className={clsx(
                "relative rounded-2xl border p-1 cursor-pointer transition", // relative 추가
                "dark:border-black/10",
                isMobile
                  ? "h-14 overflow-hidden text-[10px] bg-[#fdf6e3]"
                  : "aspect-square p-2 overflow-auto bg-[#fdf6e3]",
                isSelected ? "bg-blue-100 dark:bg-blue-100" : "hover:bg-blue-100 dark:hover:bg-blue-100"
              )}
              onClick={() => {
                setSelectedDate(formatted);
                setSelectedDaySchedules(events);
                setEndDate(formatted);
                if (isMobile) setSheetOpen(true);
              }}
            >
              <div className="font-bold text-[10px] sm:text-sm mb-1">{d.date()}</div>

              {/* 모바일 : 날짜 셀 중앙에 아이콘 1개만, 작게 표시 */}
              {isMobile && StickerIcon && (
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1.5 pointer-events-none">
                  <StickerIcon size={26} className="opacity-80 dark:opacity-100" />
                </div>
              )}

              {/* PC에서는 기존처럼 타이틀 리스트 표시(아이콘 아님) */}
              {!isMobile &&
                events.map((e, idx) => (
                  <div
                    key={idx}
                    className="text-[10px] sm:text-xs w-full bg-gray-100 rounded px-1 truncate"
                  >
                    {e.title}
                    {editable && e.isCompleted && (
                      <span className="ml-1 text-green-600">✔️</span>
                    )}
                  </div>
                ))}
            </div>
          );
        })}
      </div>

      {/* ───────── PC 입력 폼 ───────── */}
      {editable && !isMobile && (
        <div className="mt-4 border-t pt-4">
          <h3 className="font-bold mb-2">
            {dayjs(selectedDate).format("YYYY-MM-DD")} 일정
          </h3>

          {/* (1) 당일 일정 리스트 */}
          <ul className="mb-4 space-y-2">
            {selectedDaySchedules.map((e) => (
              <li key={e._id} className="flex justify-between items-center text-sm">
                <div>
                  • {e.title}
                  {e.isCompleted && <span className="ml-1 text-green-600">✔️</span>}
                </div>
                <div className="flex gap-2">
                  {/* 수정/삭제: lucide 아이콘 사용 */}
                  <button
                    onClick={() => handleEdit(e)}
                    className="text-blue-600 hover:text-blue-700 p-1 rounded"
                    title="수정"
                    aria-label="수정"
                    type="button"
                  >
                    <Pen size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(e._id)}
                    className="text-red-600 hover:text-red-700 p-1 rounded"
                    title="삭제"
                    aria-label="삭제"
                    type="button"
                  >
                    <Trash size={16} />
                  </button>
                </div>
              </li>
            ))}
          </ul>

          {/* (2) 입력 폼 (PC 레이아웃 유지) */}
          {/* 참가자 체크박스 */}
          <div className="mb-2">
            <span className="text-sm font-semibold">참가자:</span>
            <div className="flex gap-2 mt-1 flex-wrap">
              {allMembers.map((m) => (
                <label key={m._id} className="flex items-center gap-1 text-sm">
                  <input
                    type="checkbox"
                    checked={participants.includes(m._id)}
                    onChange={() => toggleParticipant(m._id)}
                    disabled={m._id === user._id}
                  />
                  {m.nickname}
                </label>
              ))}
            </div>
          </div>

          <div className="flex gap-2 items-center mb-4">
            <input
              type="checkbox"
              checked={isCompleted}
              onChange={() => setIsCompleted(!isCompleted)}
            />
            <span className="text-sm">완료</span>
          </div>

          <div className="flex gap-2 items-start">
            <input
              value={newEvent}
              onChange={(e) => setNewEvent(e.target.value)}
              placeholder="일정"
              className="border p-2 rounded w-1/3"
            />
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="설명"
              className="border p-2 rounded w-1/2"
            />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border p-2 rounded"
            />

            {/* 일정 추가 버튼 */}
            <button
              onClick={handleAddEvent}
              className="border-2 border-black bg-[#fdf6e3] text-black px-4 py-2 rounded-xl flex items-center gap-2 shadow-sm hover:shadow-md active:translate-y-[1px] transition"
              type="button"
            >
              <CalendarPlus size={22} />
              {editingId ? "수정 완료" : "일정 추가"}
            </button>

            {editingId && (
              <button
                onClick={resetForm}
                className="bg-gray-300 text-black px-4 py-2 rounded"
                type="button"
              >
                취소
              </button>
            )}
          </div>
        </div>
      )}

      {/* ───────── Mobile 하단 시트 ───────── */}
      {editable && isMobile && mode === "view" && (
        <div className="mt-4 border-t pt-4">
          <h3 className="font-bold mb-2">
            {dayjs(selectedDate).format("YYYY-MM-DD")} 일정
          </h3>

          {/* (1) 당일 일정 리스트 */}
          <ul className="mb-4 space-y-2">
            {selectedDaySchedules.length === 0 && (
              <li className="text-sm text-gray-500">일정이 없습니다.</li>
            )}
            {selectedDaySchedules.map((e) => (
              <li key={e._id} className="flex justify-between items-center text-sm">
                <div>
                  • {e.title}
                  {e.isCompleted && <span className="ml-1 text-green-600">✔️</span>}
                </div>
                <div className="flex gap-2">
                  {/* 수정/삭제: lucide 아이콘 사용 */}
                  <button
                    onClick={() => handleEdit(e)}
                    className="text-blue-600 hover:text-blue-700 p-1 rounded"
                    title="수정"
                    aria-label="수정"
                    type="button"
                  >
                    <Pen size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(e._id)}
                    className="text-red-600 hover:text-red-700 p-1 rounded"
                    title="삭제"
                    aria-label="삭제"
                    type="button"
                  >
                    <Trash size={16} />
                  </button>
                </div>
              </li>
            ))}
          </ul>

          {/* (2) 안내 문구 */}
          <div className="text-sm text-gray-500">
            일정을 추가하거나 수정하려면 아래 버튼을 눌러주세요.
          </div>

          {/* (3) 일정 추가 버튼 (모바일) */}
          <button
            onClick={() => {
              resetForm();
              setMode("add");
              setSheetOpen(true);
            }}
            className="mt-4 w-full border-[1.75px] border-black bg-[#fdf6e3] text-black py-2 rounded-xl text-sm shadow-sm hover:shadow-md active:translate-y-[1px] transition flex items-center justify-center gap-2"
            type="button"
          >
            <CalendarPlus size={20} />
            일정 추가
          </button>
        </div>
      )}

      {editable && isMobile && (mode === "add" || mode === "edit") && (
        <Transition appear show={isSheetOpen} as={Fragment}>
          <Dialog
            as="div"
            onClose={() => {
              setSheetOpen(false);
              resetForm();
            }}
            className="fixed inset-0 z-50"
          >
            {/* 배경 */}
            <Transition.Child
              as={Fragment}
              enter="duration-200 ease-out"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="duration-150 ease-in"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-black/30" />
            </Transition.Child>

            {/* 시트 */}
            <Transition.Child
              as={Fragment}
              enter="duration-200 ease-out"
              enterFrom="translate-y-full"
              enterTo="translate-y-0"
              leave="duration-150 ease-in"
              leaveFrom="translate-y-0"
              leaveTo="translate-y-full"
            >
              <Dialog.Panel className="fixed bottom-0 inset-x-0 bg-[#f6fde7] rounded-t-2xl p-4 h-[80vh] overflow-y-auto">
                {/* 타이틀 + 닫기 */}
                <div className="flex justify-between items-center mb-4">
                  <h3 className="mx-auto font-semibold text-center">어떤 날인가요?</h3>
                  <button
                    onClick={() => {
                      setSheetOpen(false);
                      resetForm();
                    }}
                    className="absolute right-4 top-4 text-gray-600 hover:text-gray-800"
                    type="button"
                    aria-label="닫기"
                  >
                    <CircleX size={20} />
                  </button>
                </div>

                {/* ───── 스티커 선택 ───── */}
                <div className="mb-6">
                  <p className="text-sm font-semibold mb-2 text-center">
                    어떤 스티커를 붙일까요?
                  </p>
                  <div className="grid grid-cols-4 gap-4 justify-items-center">
                    {stickerOptions.map(({ value, Icon }) => (
                      <button
                        key={value}
                        onClick={() => setSelectedSticker(value)}
                        className={clsx(
                          "p-3 rounded-full border transition",
                          selectedSticker === value
                            ? "bg-blue-200 border-blue-300"
                            : "bg-white hover:bg-gray-100"
                        )}
                        type="button"
                        aria-label={value}
                        title={value}
                      >
                        <Icon size={24} />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  {/* ───── 일정명 입력칸 ───── */}
                  <input
                    value={newEvent}
                    onChange={(e) => setNewEvent(e.target.value)}
                    placeholder="Title"
                    className="border rounded-lg w-full p-3 text-sm mb-4"
                  />

                  {/* ───── 설명 입력칸 ───── */}
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="내용을 입력해 주세요"
                    rows={3}
                    className="border rounded-lg w-full p-3 text-sm mb-6"
                  />
                </div>

                <div>
                  {/* ───── 시작 날짜 ───── */}
                  <label className="block text-sm font-semibold mb-1">시작날짜</label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="border rounded-lg w-full p-3 text-sm mb-4"
                  />
                  {/* ───── 종료 날짜 ───── */}
                  <label className="block text-sm font-semibold mb-1">종료날짜</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="border rounded-lg w-full p-3 text-sm mb-4"
                  />
                </div>

                {/* ───── 참가자 선택 ───── */}
                <div className="mb-6 border rounded-lg p-3">
                  <div className="flex flex-wrap gap-2">
                    {allMembers.map((m) => (
                      <button
                        key={m._id}
                        onClick={() => toggleParticipant(m._id)}
                        className={clsx(
                          "px-3 py-1 text-xs rounded-full border transition",
                          participants.includes(m._id)
                            ? "bg-blue-200 border-blue-400"
                            : "bg-white"
                        )}
                        type="button"
                      >
                        {m.nickname}
                      </button>
                    ))}
                  </div>
                </div>

                {/* ───── 액션 버튼 ───── */}
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setSheetOpen(false);
                      handleAddEvent();
                    }}
                    className="flex-1 border border-black bg-[#fdf6e3] text-black py-2 rounded-xl text-sm shadow-sm hover:shadow-md active:translate-y-[1px] transition flex items-center justify-center gap-2"
                    type="button"
                  >
                    <CalendarPlus size={18} />
                    {editingId ? "수정 완료" : "저장"}
                  </button>
                  {editingId && (
                    <button
                      onClick={resetForm}
                      className="flex-1 bg-gray-300 py-2 rounded text-sm"
                      type="button"
                    >
                      취소
                    </button>
                  )}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </Dialog>
        </Transition>
      )}
    </div>
  );
}
