"use client";

import { useState, useEffect } from "react";
import Calendar from "@/components/Calendar";
import { ArrowRight, ArrowLeft, Plus } from "lucide-react";
import { Dialog } from "@headlessui/react";
import { UserCircle, BookHeart , CalendarDays, Settings, LogOut } from "lucide-react";
import dayjs from "dayjs";
import { useAuth } from "@/hooks/useAuth";
import Link from 'next/link';
import { div } from "framer-motion/client";

interface Character {
  _id: string;
  name: string;
  level: number;
  exp: number;
  gold: number;
  avatar: string;
  statusMessage: string;
}

interface Schedule {
  _id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  repeat: string;
  isCompleted: boolean;
  createdBy: string;
  participants: string[];
}

interface UserQuest {
  _id: string;
  userId: string;
  assignedBy: string;
  title: string;
  description?: string;
  goalType?: string;
  difficulty?: number;
  targetValue?: number;
  currentValue?: number;
  isCompleted: boolean;
  reward: {
    exp: number;
    coins: number;
  };
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface CoupleQuest {
  _id: string;
  coupleId: string;
  title: string;
  description?: string;
  goalType?: string;
  targetValue?: number;
  currentValue?: number;
  isCompleted: boolean;
  reward: {
    exp: number;
    coins: number;
  };
  createdBy: string;
  agreed: boolean;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface PartnerQuest {
  _id: string;
  title: string;
  goalType?: string;
}

const QUEST_CATEGORIES = ["All", "Daily", "Weekly"];
const COUPLE_CATEGORIES = ["All", "Daily", "Bucket"];
const RESET_OPTIONS = ["Daily", "Weekly", "One-time"];

export default function MainLayout() {
  const { user, loading, isLoggedIn } = useAuth();

  // character
  const [myCharacter, setMyCharacter] = useState<Character | null>(null);
  const [partnerCharacter, setPartnerCharacter] = useState<Character | null>(null);

  // calendar
  const [showCalendar, setShowCalendar] = useState(false);
  const [schedule, setSchedule] = useState<Schedule[]>([]);
  const [myTodayEvents, setMyTodayEvents] = useState<Schedule[]>([]);
  const [partnerTodayEvents, setPartnerTodayEvents] = useState<Schedule[]>([]);

  // 퀘스트 공통
  const [selectedDifficulty, setSelectedDifficulty] = useState<number | null>(null);

  // 유저 퀘스트
  const [quests, setQuests] = useState<UserQuest[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingQuest, setEditingQuest] = useState<UserQuest | null>(null);

  // 연인 퀘스트
  const [partnerQuests, setPartnerQuests] = useState<PartnerQuest[]>([]);
  const [selectedPartnerCategory, setSelectedPartnerCategory] = useState("All");
  const [isPartnereDialogOpen, setIsPartnerDialogOpen] = useState(false);
  const [editingPartnerQuest, setEditingPartnerQuest] = useState<PartnerQuest | null>(null);


  // 커플 퀘스트
  const [coupleQuests, setCoupleQuests] = useState<CoupleQuest[]>([]);
  const [selectedCoupleCategory, setSelectedCoupleCategory] = useState("All");
  const [isCoupleDialogOpen, setIsCoupleDialogOpen] = useState(false);
  const [editingCoupleQuest, setEditingCoupleQuest] = useState<CoupleQuest | null>(null);


  useEffect(() => {
    const fetchSchedule = async () => {
      const res = await fetch("/api/schedule");
      const data = await res.json();
      if (res.ok && data?.data?.schedules) {
        setSchedule(data.data.schedules);
      }
    };
    fetchSchedule();
  }, []);

  useEffect(() => {
    if (!user) return;
    const today = dayjs().format("YYYY-MM-DD");
    const todayOnly = schedule.filter((e) => dayjs(e.startDate).format("YYYY-MM-DD") === today);
    setMyTodayEvents(todayOnly.filter((e) => e.participants.includes(user._id)));
    setPartnerTodayEvents(todayOnly.filter((e) => e.participants.length == 2 || !e.participants.includes(user._id)));
  }, [schedule, user]);

  const fetchCharacter = async () => {
    try {
      const res = await fetch("/api/character");
      const data = await res.json();
      console.log("data: ", data);
      if (res.ok && data.data) {
        setMyCharacter(data.data.myCharacter || null);
        setPartnerCharacter(data.data.partnerCharacter || null);
      }
      
    } catch (err) {
      console.log("Error fetching data:", err);
    }
  };

  // ==============================유저 퀘스트 보여주기 및 추가 삭제=================================
  // fetch
  const fetchAllQuests = async () => {
    try {
      const res = await fetch("/api/allQuests")
      const data = await res.json();
      // console.log("data: ", data);
      if (res.ok && data.data) {
        setQuests(data.data.userQuests || []);
        setCoupleQuests(data.data.coupleQuests || []);
        setPartnerQuests(data.data.partnerQuests || []);
      }
    } catch (err) {
      console.error("Error fetching quests:", err);
    }
  };


  const openNewQuestDialog = () => {
    setEditingQuest(null);
    setSelectedDifficulty(null);
    setIsDialogOpen(true);
  };

  const openEditQuestDialog = (quest: UserQuest) => {
    setEditingQuest(quest);
    setSelectedDifficulty(quest.difficulty ?? null);
    setIsDialogOpen(true);
  };

  const saveQuest = async (quest: Partial<UserQuest>) => {
    if (editingQuest) {
      setQuests((prev) =>
        prev.map((q) => (q._id === editingQuest._id ? { ...q, ...quest } as UserQuest : q))
      );
    } else {
      const res = await fetch("/api/userQuest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: quest.title,
          description: quest.description,
          goalType: quest.goalType,
          targetValue: quest.targetValue || 1,
          rewardExp: 0,
          assignedToId: user?._id,
        }),
      });
      if (res.ok) {
        await fetchAllQuests();
      }
    }
    setIsDialogOpen(false);
  };

  const deleteQuest = async () => {
    if (editingQuest) {
      const res = await fetch(`/api/userQuest/${editingQuest._id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        await fetchAllQuests();
      } else {
        const data = await res.json();
        alert(data?.message || "삭제 실패");
      }
      
      setIsDialogOpen(false);
    }
  };

  const filteredQuests = selectedCategory === "All" ? quests : quests.filter((q) => q.goalType === selectedCategory);






  {/* =================================연인(Partner) Quest 구간============================= */}
  useEffect(() => {
    const handleLogout = () => {
      setQuests([]);
      setCoupleQuests([]);
      setPartnerQuests([]);
      setEditingQuest(null);
      setEditingCoupleQuest(null);
      setIsDialogOpen(false);
      setIsCoupleDialogOpen(false);
    };

    window.addEventListener("loventure:logout", handleLogout);
    return () => window.removeEventListener("loventure:logout", handleLogout);
  }, []);

  const filteredPartnerQuests = selectedPartnerCategory === "All" ? partnerQuests : partnerQuests.filter((q) => q.goalType === selectedPartnerCategory);




  {/* =================================Couple Quest 구간============================= */}
  const openNewCoupleQuestDialog = () => {
    setEditingCoupleQuest(null);
    setIsCoupleDialogOpen(true);
  };
  
  const openEditCoupleQuestDialog = (quest: CoupleQuest) => {
    setEditingCoupleQuest(quest);
    setIsCoupleDialogOpen(true);
  };
  
  const saveCoupleQuest = async (quest: Partial<CoupleQuest>) => {
    if (editingCoupleQuest) {
      setCoupleQuests((prev) =>
        prev.map((q) => (q._id === editingCoupleQuest._id ? { ...q, ...quest } as CoupleQuest : q))
      );
    } else {
      const res = await fetch("/api/coupleQuest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: quest.title,
          description: quest.description,
          goalType: quest.goalType,
          targetValue: quest.targetValue || 1,
          rewardExp: 0,
          rewardCoins: 0,
        }),
      });
      if (res.ok) {
        await fetchAllQuests();
      }
    }
    setIsCoupleDialogOpen(false);
  };
  
  const deleteCoupleQuest = async () => {
    if (editingCoupleQuest) {
      const res = await fetch(`/api/coupleQuest/${editingCoupleQuest._id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        await fetchAllQuests();
      } else {
        const data = await res.json();
        alert(data?.message || "삭제 실패");
      }
      
      setIsCoupleDialogOpen(false);
    }
  };

  const filteredCoupleQuests = selectedCoupleCategory === "All" ? coupleQuests : coupleQuests.filter((q) => q.goalType === selectedCoupleCategory);
  
  useEffect(() => {
    if (!loading && isLoggedIn) {
      fetchCharacter();
      fetchAllQuests();
    }
  }, [loading, isLoggedIn])

  return (
    <div className="flex min-h-screen bg-cream">

      {/* 캐릭터 섹션 */}
      <div className="flex-1 p-6 flex flex-col gap-4">
        <div className="flex gap-4">
          <div className="flex flex-col items-center w-[22%] bg-white rounded shadow p-4 h-[400px]">
            <div className="w-24 h-24 rounded-full bg-gray-200 mb-2">{myCharacter?.avatar}</div>
            <div className="text-sm font-bold">{myCharacter?.name ?? "-"}</div>
            <div className="text-xs">Lv. {myCharacter?.level ?? "-"}</div>
            <div className="mt-4 text-xs w-full flex justify-center">
              {myTodayEvents.length > 0 ? (
                <ul className="list-disc list-inside">
                  {myTodayEvents.map((e) => (
                    <li key={e._id}>{e.title}</li>
                  ))}
                </ul>
              ) : (
                "No Events"
              )}
            </div>
          </div>

          <div className="flex flex-col items-center w-[22%] bg-white rounded shadow p-4 h-[400px]">
            <div className="w-24 h-24 rounded-full bg-gray-200 mb-2" />
              <div className="text-sm font-bold">{partnerCharacter?.name ?? "No Partner"}</div>
              <div className="text-xs">Lv. {partnerCharacter?.level ?? "-"}</div>
              <div className="mt-4 text-xs w-full flex justify-center">
              {partnerTodayEvents.length > 0 ? (
                <ul className="list-disc list-inside">
                  {partnerTodayEvents.map((e) => (
                    <li key={e._id}>{e.title}</li>
                  ))}
                </ul>
              ) : (
                "No Events"
              )}
            </div>
          </div>

          <div className="flex-1 relative">
            <div className="absolute top-2 -right-6 z-10">
              <button
                onClick={() => setShowCalendar(!showCalendar)}
                className="text-gray-600 hover:text-gray-800"
              >
                {showCalendar ? <ArrowLeft /> : <ArrowRight />}
              </button>
            </div>

            {!showCalendar ? (
              // =======================================퀘스트 구간=================================
              <div className="grid grid-cols-2 gap-4">
                <div className="grid grid-cols-2 gap-4 col-span-2">

                  {/* =============================User Quest ========================*/}
                  <div className="bg-blue-50 rounded-xl p-4 h-[300px] overflow-y-auto">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-semibold">유저 퀘스트</h3>
                    </div>
                    <div className="flex gap-2 mb-2">
                      {QUEST_CATEGORIES.map((cat) => (
                        <button
                          key={cat}
                          onClick={ () => setSelectedCategory(cat)}
                          className={`text-sm font-medium pb-1 border-b-2 transition-colors ${
                            selectedCategory === cat ? "text-blue-500 border-blue-500" : "text-gray-400 border-transparent"
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>

                    {/*======== 퀘스트 생성 버튼 ===========*/}
                    <div className="flex justify-center mb-2">
                      <button
                        onClick={openNewQuestDialog}
                        className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center hover:scale-105 transition"
                      >
                        <Plus size={24} />
                      </button>
                    </div>

                    {/* =================퀘스트 리스트============== */}
                    <ul className="space-y-[2px]">
                      {filteredQuests.length > 0 ? (
                        filteredQuests.map((q) => (
                          <li
                            key={q._id}
                            onClick={ () => openEditQuestDialog(q)}
                            className="bg-white hover:bg-blue-100 px-4 py-2 rounded shadow-sm cursor-pointer"
                          >
                            <div className="text-sm font-medium">{q.title}</div>
                          </li>
                        ))
                      ) : (
                        <li className="text-center text-gray-400 py-4">No quests yet</li>
                      )}
                    </ul>
                  </div>




                  {/* ----------------------------------연인 Quest-----------------------------*/}
                  <div className="bg-purple-100 rounded-xl p-4 h-[300px] overflow-y-auto">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-semibold">연인 퀘스트</h3>
                      <button className="text-purple-500 hover:text-purple-700">
                        <Plus size={20} />
                      </button>
                    </div>
                    <div className="flex gap-2 mb-2">
                      {QUEST_CATEGORIES.map((cat) => (
                        <button
                          key={cat}
                          onClick={() => setSelectedPartnerCategory(cat)}
                          className={`text-sm font-medium pb-1 border-b-2 transition-colors ${
                            selectedPartnerCategory === cat ? "text-purple-500 border-purple-500" : "text-gray-400 border-transparent"
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                    <ul className="space-y-[2px]">
                      {filteredPartnerQuests.length > 0 ? (
                        filteredPartnerQuests.map((quest) => (
                          <li
                            key={quest._id}
                            className="bg-white hover:bg-purple-200 px-4 py-2 rounded shadow-sm"
                          >
                            <div className="text-sm font-medium">{quest.title}</div>
                          </li>
                        ))
                      ) : (
                        <li className="text-center text-gray-400 py-4">No partner quests yet</li>
                      )}
                    </ul>
                  </div>
                </div>




                {/* ------------------------------커플 Quest-------------------- */}
                <div className="bg-orange-100 rounded-xl p-4 col-span-2 h-[300px] overflow-y-auto">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold">커플 퀘스트</h3>
                  </div>
                  <div className="flex gap-2 mb-2">
                    {COUPLE_CATEGORIES.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCoupleCategory(cat)}
                        className={`text-sm font-medium pb-1 border-b-2 transition-colors ${
                          selectedCoupleCategory === cat ? "text-orange-500 border-orange-500" : "text-gray-400 border-transparent"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>

                   {/* -----------------커플 퀘스트 생성 버튼---------- */}
                  <div className="flex justify-center mb-2">
                    <button
                      onClick = {openNewCoupleQuestDialog}
                        className="w-10 h-10 bg-orange-500 textwhite rounded-full flex items-center justify-center hover:scale-105 transition"
                    >
                    <Plus size={24}/>
                    </button>
                  </div>

                    {/* -----------------커플 퀘스트 리스트----------*/}
                  <ul className="space-y-[2px]">
                    {filteredCoupleQuests.length > 0 ? (
                      filteredCoupleQuests.map((quest) => (
                        <li
                          key={quest._id}
                          className="bg-white hover:bg-orange-200 px-4 py-2 rounded shadow-sm"
                        >
                          <div className="text-sm font-medium">{quest.title}</div>
                        </li>
                      ))
                    ) : (
                      <li className="text-center text-gray-400 py-4">No couple quests yet</li>
                    )}
                  </ul>
                </div>

                {/*-------------------Quest Modal-------------------- */}
                {/*-------------------User Quest Modal--------------------*/}
                <Dialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)} className="relative z-50">
                  <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
                  <div className="fixed inset-0 flex items-center justify-center p-4">
                    <Dialog.Panel className="w-full max-w-md bg-white rounded-lg shadow p-6 max-h-[90vh] h-[600px] overflow-y-auto">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold">Quest</h3>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setIsDialogOpen(false)}
                            className="text-red-500 hover:underline"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => {
                              const form = document.forms.namedItem("questForm") as HTMLFormElement;
                              const title = (form.elements.namedItem("title") as HTMLInputElement).value;
                              const description = (form.elements.namedItem("notes") as HTMLTextAreaElement).value;
                              const difficulty = selectedDifficulty ?? 1;
                              const goalType = (form.elements.namedItem("reset") as HTMLSelectElement).value;

                              saveQuest({ title, description, difficulty, goalType });
                            }}
                            className="text-blue-600 font-semibold hover:underline"
                          >
                            Save
                          </button>
                        </div>
                      </div>

                      <form name="questForm" className="flex flex-col gap-3">
                        <input
                          name="title"
                          placeholder="Title"
                          defaultValue={editingQuest?.title || ""}
                          className="border rounded px-2 py-1"
                        />
                        <textarea
                          name="notes"
                          placeholder="Notes"
                          defaultValue={editingQuest?.description || ""}
                          className="border rounded px-2 py-1"
                        />

                        <div>
                          <label className="block mb-1">Difficulty</label>
                          <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onClick={() => setSelectedDifficulty(star)}
                                className={`w-8 h-8 rounded-full border flex items-center justify-center text-sm transition-colors ${
                                  selectedDifficulty === star ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-800"
                                }`}
                              >
                                {star}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="block mb-1">Reset Counter</label>
                          <select
                            name="reset"
                            defaultValue={editingQuest?.goalType || "Daily"}
                            className="border rounded px-2 py-1 w-full"
                          >
                            {RESET_OPTIONS.map((opt) => (
                              <option key={opt} value={opt}>
                                {opt}
                              </option>
                            ))}
                          </select>
                        </div>

                        {editingQuest && (
                          <button
                            type="button"
                            onClick={deleteQuest}
                            className="mt-4 text-sm text-red-500 hover:underline"
                          >
                            Delete this Quest
                          </button>
                        )}
                      </form>
                    </Dialog.Panel>
                  </div>
                </Dialog>

                

                {/*-------------------Couple Quest Modal-------------------- */}
                <Dialog open = { isCoupleDialogOpen } onClose = { () => setIsCoupleDialogOpen(false)} className="relative z-50">
                  <div className="fixed inset-0 bg-black/30" aria-hidden="true"/>
                  <div className="fixed inset-0 flex items-center justify-center p-4">
                    <Dialog.Panel className="w-full max-w-md bg-white rounded-lg shadow p-6 max-6-[90vh] h-[600px] overflow-y-auto">
                      <div className="flex justify-between items-center mb-4"> 
                        <h3 className="text-lg font-semibold">Couple Quest</h3>
                        <div className="flex gap-2">
                          <button
                            onClick = { () => setIsCoupleDialogOpen(false)}
                            className="text-red-500 hover:underline"
                          >
                            Cancel
                          </button>
                          <button
                            onClick = { ()  => {
                              const form = document.forms.namedItem("coupleQuestForm") as HTMLFormElement;
                              if (!form) {
                                console.error("잘못된 Form입니다.");
                                return;
                              }

                              const title = (form.elements.namedItem("title") as HTMLInputElement).value;
                              const description = (form.elements.namedItem("notes") as HTMLTextAreaElement).value;
                              const goalType = (form.elements.namedItem("reset") as HTMLSelectElement).value;

                              saveCoupleQuest({ title, description, goalType });
                            }}
                            className="text-orange-600 font-semibold hover:underline"
                          >
                            Save
                          </button>
                        </div>
                      </div>

                      <form name="coupleQuestForm" className="flex flex-col gap-3">
                        <input
                          name="title"
                          placeholder="Title"
                          defaultValue={editingCoupleQuest?.title || ""}
                          className="border rounded px-2 py-1"
                        />
                        <textarea
                          name="notes"
                          placeholder="Notes"
                          defaultValue={editingCoupleQuest?.description || ""}
                          className="border rounded px-2 py-1"
                        />

                        <div>
                          <label className="block mb-1">Reset Counter</label>
                          <select
                            name="reset"
                            defaultValue={editingCoupleQuest?.goalType || "Daily"}
                            className="border rounded px-2 py-1 w-full"
                          >
                            {RESET_OPTIONS.map((opt) => (
                              <option key={opt} value={opt}>
                                {opt}
                              </option>
                            ))}
                          </select>
                        </div>

                        {editingCoupleQuest && (
                          <button
                            type="button"
                            onClick={deleteCoupleQuest}
                            className="mt-4 text-sm text-red-500 hover:underline"
                          >
                            Delete this Couple Quest
                          </button>
                        )}
                      </form>
                    </Dialog.Panel>
                  </div>
                </Dialog>
              </div>

          
            ) : (
              <div className="bg-white rounded shadow p-4 h-full transition-transform duration-500">
                <Calendar editable={false} compact={true} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
