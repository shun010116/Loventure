"use client";

import { useState, useEffect } from "react";
import Calendar from "@/components/Calendar";
import { ArrowRight, ArrowLeft, Plus } from "lucide-react";
import { Dialog } from "@headlessui/react";
import dayjs from "dayjs";
import { useAuth } from "@/hooks/useAuth";


// Type improt 
import { TabKey, Schedule, UserQuest, CoupleQuest, PartnerQuest, Character } from "./Types";
import { UserQuestModal, PartnerQuestModal, CoupleQuestModal } from "./Modal";



// 모바일 네비게이션 바 import 
import MobileNav from "@/components/MobileNav";


// 모바일, PC 레이아웃 import
import MobileLayout from "@/components/Layouts/MobileLayout";
import DesktopLayout from "@/components/Layouts/DesktopLayout";

export default function MainLayout() {
  const { user, loading, isLoggedIn } = useAuth();

  // character
  const [myCharacter, setMyCharacter] = useState<Character | null>(null);
  const [partnerCharacter, setPartnerCharacter] = useState<Character | null>(null);

  // 모바일 화면에서는 탭으로 구성
  const [activeTab, setActiveTab] = useState<TabKey>("character");

  const QUEST_CATEGORIES = ["All", "Daily", "Weekly"];
  const COUPLE_CATEGORIES = ["All", "Daily", "Bucket"];
  const RESET_OPTIONS = ["Daily", "Weekly", "One-time"];


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
      const res = await fetch("/api/character/me");
      const data = await res.json();
      //console.log("data: ", data);
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
          difficulty: quest.difficulty,
          assignedToId: user?._id,
          reward: {
            exp: quest.reward?.exp || 0,
            coins: quest.reward?.coins || 0,
          }
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

  // 유저 퀘스트 완료 함수
  const completeQuest = async () => {
    if (editingQuest) {
      const res = await fetch(`/api/userQuest/${editingQuest._id}`, {
        method: "POST",
      });

      if (res.ok) {
        alert(`퀘스트 완료! Exp: ${editingQuest.reward.exp}, Coins: ${editingQuest.reward.coins} 획득!`);
        await fetchAllQuests();
        await fetchCharacter();
      } else {
        const data = await res.json();
        alert(data?.message || "퀘스트 완료 실패");
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

  const completeCoupleQuest = async () => {
    if (editingCoupleQuest) {
      const res = await fetch(`/api/coupleQuest/${editingCoupleQuest._id}/complete/`, {
        method: "POST",
      });

      if (res.ok) {
        alert(`커플 퀘스트 완료! Exp: ${editingCoupleQuest.reward.exp}, Coins: ${editingCoupleQuest.reward.coins} 획득!`);
        await fetchAllQuests();
        await fetchCharacter();
      } else {
        const data = await res.json();
        alert(data?.message || "커플 퀘스트 완료 실패");
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

    <>
      {/* 모바일 전용 */}
      <MobileLayout
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        myEvents={myTodayEvents}
        partnerEvents={partnerTodayEvents}
        userQuests={filteredQuests}
        partnerQuests={filteredPartnerQuests}
        coupleQuests={filteredCoupleQuests}
        onUserClick={openEditQuestDialog}
        onPartnerClick={(q: PartnerQuest) => setViewingPartnerQuest(q)}
        onCoupleClick={openEditCoupleQuestDialog}
      />
        
      {/* PC 전용 */}
      <DesktopLayout>
        {/* 기존 카드형 전체 구조 */}
        <div className="flex flex-col lg:flex-row min-h-screen bg-cream">
          {/* ───────── (1) 메인 래핑 ───────── */}

          <div className="flex-1 p-4 sm:p-6 flex flex-col gap-4">
            {/* ───────── (2) 메인 ───────── */}

            <div className="flex flex-col sm:flex-row gap-4">
              {/* ───────── (3) 캐릭터 영역 ───────── */}

              {/* 내 캐릭터 */}
              <div className="flex flex-col items-center w-full sm:w-1/2 lg:w-[22%] bg-white rounded shadow p-4 h-[400px]">
                <div>
                  <img src={`/character/${myCharacter?.evolutionStage}/${myCharacter?.avatar}`} alt='myCharacter' className="w-24 h-24 rounded-full mb-2"/>
                </div>
                <div className="text-sm font-bold">{myCharacter?.name ?? "-"}</div>
                <div className="text-xs">Lv. {myCharacter?.level ?? "-"}</div>
                <div className="text-xs">
                  EXP {myCharacter?.exp ?? 0} / Next: {myCharacter?.level ? 50 * myCharacter.level * myCharacter.level : 0}
                </div>
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

              {/* 파트너 캐릭터 */}
              <div className="flex flex-col items-center w-full sm:w-1/2 lg:w-[22%] bg-white rounded shadow p-4 h-[400px]">
                <div>
                  <img src={`/character/${partnerCharacter?.evolutionStage}/${partnerCharacter?.avatar}`} alt='partnerCharacter' className="w-24 h-24 rounded-full mb-2" />
                </div>
                <div className="text-sm font-bold">{partnerCharacter?.name ?? "No Partner"}</div>
                <div className="text-xs">Lv. {partnerCharacter?.level ?? "-"}</div>
                <div className="text-xs">
                  EXP {partnerCharacter?.exp ?? 0} / Next: {partnerCharacter?.level ? 50 * partnerCharacter.level * partnerCharacter.level : 0}
                </div>
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

              {/* ───────── (4) 퀘스트 / 달력 구간 ───────── */}
              <div className="flex-1 relative mt-4">
                {/* 토글 버튼: 항상 이 div(퀘스트/달력 컨테이너) 내부에서 절대 위치 */}
                <button
                  onClick={() => setShowCalendar(!showCalendar)}
                  className="absolute top-2 -right-6 z-10 text-gray-600 hover:text-gray-800"
                >
                  {showCalendar ? <ArrowLeft /> : <ArrowRight />}
                </button>

                {!showCalendar ? (
                  <>
                    {/* ───────────────── 퀘스트 구간 ───────────────── */}

                    {/* ── 유저 + 파트너 퀘스트 그리드 ── */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* ===================== User Quest ===================== */}
                      <div className="bg-blue-50 rounded-xl p-4 h-[300px] sm:h-[360px] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="font-semibold">유저 퀘스트</h3>
                        </div>
                        <div className="flex gap-2 mb-2">
                          {QUEST_CATEGORIES.map((cat) => (
                            <button
                              key={cat}
                              onClick={() => setSelectedCategory(cat)}
                              className={`text-sm font-medium pb-1 border-b-2 transition-colors ${
                                selectedCategory === cat
                                  ? "text-blue-500 border-blue-500"
                                  : "text-gray-400 border-transparent"
                              }`}
                            >
                              {cat}
                            </button>
                          ))}
                        </div>

                        {/* 퀘스트 생성 버튼 */}
                        <div className="flex justify-center mb-2">
                          <button
                            onClick={openNewQuestDialog}
                            className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center hover:scale-105 transition"
                          >
                            <Plus size={24} />
                          </button>
                        </div>

                        {/* 퀘스트 리스트 */}
                        <ul className="space-y-[2px]">
                          {filteredQuests.length > 0 ? (
                            filteredQuests.map((q) => (
                              <li
                                key={q._id}
                                onClick={() => openEditQuestDialog(q)}
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

                      {/* ===================== Partner Quest ===================== */}
                      <div className="bg-purple-100 rounded-xl p-4 h-[300px] sm:h-[360px] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="font-semibold">연인 퀘스트</h3>
                        </div>
                        <div className="flex gap-2 mb-2">
                          {QUEST_CATEGORIES.map((cat) => (
                            <button
                              key={cat}
                              onClick={() => setSelectedPartnerCategory(cat)}
                              className={`text-sm font-medium pb-1 border-b-2 transition-colors ${
                                selectedPartnerCategory === cat
                                  ? "text-purple-500 border-purple-500"
                                  : "text-gray-400 border-transparent"
                              }`}
                            >
                              {cat}
                            </button>
                          ))}
                        </div>

                        {/* Partner Quest 리스트 (클릭하면 모달 오픈) */}
                        <ul className="space-y-[2px]">
                          {filteredPartnerQuests.length > 0 ? (
                            filteredPartnerQuests.map((quest) => (
                              <li
                                key={quest._id}
                                onClick={() => setViewingPartnerQuest(quest)}
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

                    {/* ── Couple Quest (가로 전체) ── */}
                    <div className="bg-orange-100 rounded-xl p-4 h-[300px] sm:h-[360px] col-span-full overflow-y-auto mt-4">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="font-semibold">커플 퀘스트</h3>
                      </div>
                      <div className="flex gap-2 mb-2">
                        {COUPLE_CATEGORIES.map((cat) => (
                          <button
                            key={cat}
                            onClick={() => setSelectedCoupleCategory(cat)}
                            className={`text-sm font-medium pb-1 border-b-2 transition-colors ${
                              selectedCoupleCategory === cat
                                ? "text-orange-500 border-orange-500"
                                : "text-gray-400 border-transparent"
                            }`}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>

                      {/* Couple Quest 생성 버튼 */}
                      <div className="flex justify-center mb-2">
                        <button
                          onClick={openNewCoupleQuestDialog}
                          className="w-10 h-10 bg-orange-500 text-white rounded-full flex items-center justify-center hover:scale-105 transition"
                        >
                          <Plus size={24} />
                        </button>
                      </div>

                      {/* Couple Quest 리스트 */}
                      <ul className="space-y-[2px]">
                        {filteredCoupleQuests.length > 0 ? (
                          filteredCoupleQuests.map((quest) => (
                            <li
                              key={quest._id}
                              onClick={() => openEditCoupleQuestDialog(quest)}
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

                    {/* ── Quest Modal들 삽입 ── */}
                    <UserQuestModal
                      isOpen={isDialogOpen}
                      onClose={() => setIsDialogOpen(false)}
                      editingQuest={editingQuest}
                      selectedDifficulty={selectedDifficulty}
                      setSelectedDifficulty={setSelectedDifficulty}
                      saveQuest={saveQuest}
                      deleteQuest={deleteQuest}
                      completeQuest={completeQuest}
                    />

                    <PartnerQuestModal
                      viewingPartnerQuest={viewingPartnerQuest}
                      onClose={() => setViewingPartnerQuest(null)}
                    />

                    <CoupleQuestModal
                      isOpen={isCoupleDialogOpen}
                      onClose={() => setIsCoupleDialogOpen(false)}
                      editingCoupleQuest={editingCoupleQuest}
                      saveCoupleQuest={saveCoupleQuest}
                      deleteCoupleQuest={deleteCoupleQuest}
                      completeCoupleQuest={completeCoupleQuest}
                    />
                    {/* ───────────────── 퀘스트 구간 끝 ───────────────── */}
                  </>
                ) : (
                  /* ── 달력 부분 ── */
                  <div className="bg-white rounded shadow p-4 h-[480px] sm:h-full">
                    <Calendar editable={false} compact={true} />
                  </div>
                )}
              </div>
              {/* ───────── /퀘스트 / 달력 영역 ───────── */}
            </div>
            {/* ───────── /캐릭터 영역 ───────── */}
          </div>
          {/* ───────── /메인 래핑 ───────── */}
        </div>
      </DesktopLayout>
    
    </>


    
  );
}
