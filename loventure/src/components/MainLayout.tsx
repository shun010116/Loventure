"use client";

import { useState, useEffect } from "react";
import Calendar from "@/components/Calendar";
import { ArrowRight, ArrowLeft, Plus } from "lucide-react";
import { Dialog } from "@headlessui/react";
import dayjs from "dayjs";
import { useAuth } from "@/hooks/useAuth";
import Link from 'next/link';

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
  goalType?: String;
  isComple?: string;
  targetValue?: number;
  currentVted: boolean;
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

const QUEST_CATEGORIES = ["All", "Daily", "Weekly"];
const COUPLE_CATEGORIES = ["All", "Daily", "Bucket"];
const RESET_OPTIONS = ["Daily", "Weekly", "One-time"];

export default function MainLayout() {
  const { user } = useAuth();

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
  const [viewingPartnerQuest, setViewingPartnerQuest] = useState<PartnerQuest | null>(null);
  const [editingPartnerQuest, setEditingPartnerQuest] = useState<PartnerQuest | null>(null);


  // 커플 퀘스트
  const [coupleQuests, setCoupleQuests] = useState<CoupleQuest[]>([]);
  const [selectedCoupleCategory, setSelectedCoupleCategory] = useState("All");
  const [isCoupleDialogOpen, setIsCoupleDialogOpen] = useState(false);
  const [editingCoupleQuest, setEditingCoupleQuest] = useState<CoupleQuest | null>(null);
  


  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch("/api/allQuests");
      const data = await res.json();
      if (res.ok) {
        setQuests(data.data.userQuests || []);
        setCoupleQuests(data.data.coupleQuests || []);
        setPartnerQuests(data.data.partnerQuests || []);
      }
    };
    fetchData();
  }, []);

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
    setPartnerTodayEvents(todayOnly.filter((e) => !e.participants.includes(user._id)));
  }, [schedule, user]);


  // ==============================유저 퀘스트 보여주기 및 추가 삭제=================================
  // fetch
  const fetchAllQuests = async () => {
    try {
      // const [userRes, coupleRes] = await Promise.all([
      //   fetch("/api/userQuest"),
      //   fetch("api/coupleQuest"),
      // ]);
      const res = await fetch("/api/allQuests")

      // const userData = await userRes.json();
      // const coupleData = await coupleRes.json();
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

  // 유저 퀘스트 삭제 함수
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
      setPartnerQuests([]);
      setEditingQuest(null);
      setEditingPartnerQuest(null);
      setIsDialogOpen(false);
      setIsPartnerDialogOpen(false);
      setViewingPartnerQuest(null);
    };

    // 파트너 퀘스트 클릭 시 정보 보기
    const openViewPartnerQuestDialog = (quest: PartnerQuest) => {
      setViewingPartnerQuest(quest);
    };

    // 파트너 퀘스트 수정 혹은 저장
    const savePartnerQuest = async (quest: Partial<PartnerQuest>) => {
      if (editingPartnerQuest) {
        // 수정
        setPartnerQuests((prev) =>
          prev.map((q) =>
            q._id === editingPartnerQuest._id ? { ...q, ...quest } as PartnerQuest : q
          )
        );
      } else {
        // 새로 등록
        const res = await fetch("/api/PartnerQuest", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: quest.title,
            description: quest.description,
            goalType: quest.goalType,
            targetValue: quest.targetValue || 1,
            rewardExp: 0,
            //assignedToId: coupleId, // 파트너 ID로 전송
          }),
        });
        if (res.ok) {
          await fetchAllQuests();
        }
      }
      setIsPartnerDialogOpen(false);
    };

    // 파트너 퀘스트 삭제 함수
    const deletePartnerQuest = async () => {
      if (editingPartnerQuest) {
        const res = await fetch(`/api/PartnerQuest/${editingPartnerQuest._id}`, {
          method: "DELETE",
        });

        if (res.ok) {
          await fetchAllQuests();
        } else {
          const data = await res.json();
          alert(data?.message || "삭제 실패");
        }

        setIsPartnerDialogOpen(false);
      }
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
  

  return (
    <div className="flex min-h-screen bg-cream">

      <div className="flex-1 p-6 flex flex-col gap-4">
        <div className="flex gap-4">
          <div className="flex flex-col items-center w-[22%] bg-white rounded shadow p-4 h-[400px]">
            <div className="w-24 h-24 rounded-full bg-gray-200 mb-2" />
            <div className="text-sm font-bold">My Name</div>
            <div className="text-xs">Lv.3</div>
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
            <div className="text-sm font-bold">Partner</div>
            <div className="text-xs">Lv.2</div>
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


              // ======== 유저 퀘스트 + 파트너 퀘스트 ========
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



                  {/* ----------------------------------파트너 Quest-----------------------------*/}
                  <div className="bg-purple-100 rounded-xl p-4 h-[300px] overflow-y-auto">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-semibold">연인 퀘스트</h3>
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

                    {/*======== 파트너 퀘스트 생성 버튼 ===========*/}
                    {/* <div className="flex justify-center mb-2">
                      <button
                        onClick={ openNewPartnerQuestDialog }
                        className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center hover:scale-105 transition"
                      >
                        <Plus size={24} />
                      </button>
                    </div> */}


                    {/* 파트너 퀘스트 리스트 */}
                    <ul className="space-y-[2px]">
                      {filteredPartnerQuests.length > 0 ? (
                        filteredPartnerQuests.map((quest) => (
                          <li
                            key={quest._id}
                            onClick={ () => setViewingPartnerQuest(quest)}
                            className="bg-white hover:bg-purple-200 px-4 py-2 rounded shadow-sm cursor-pointer"
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
                          onClick={ () => openEditCoupleQuestDialog(quest) }
                          className="bg-white hover:bg-orange-200 px-4 py-2 rounded shadow-sm cursor-pointer"
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


                {/* ------------------- View Partner Quest Modal ------------------- */}
                <Dialog open={!!viewingPartnerQuest} onClose={() => setViewingPartnerQuest(null)} className="relative z-50">
                  <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
                  <div className="fixed inset-0 flex items-center justify-center p-4">
                    <Dialog.Panel className="w-full max-w-md bg-white rounded-lg shadow p-6 max-h-[90vh] overflow-y-auto">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold">Partner Quest Details</h3>
                        <button
                          onClick={() => setViewingPartnerQuest(null)}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          Close
                        </button>
                      </div>
                      <div className="text-sm space-y-2">
                        <div><span className="font-semibold">Title:</span> {viewingPartnerQuest?.title}</div>
                        <div><span className="font-semibold">Goal Type:</span> {viewingPartnerQuest?.goalType || "-"}</div>
                      </div>
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
                            defaultValue={editingCoupleQuest?.goalType?.toString() || "Daily"}
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
