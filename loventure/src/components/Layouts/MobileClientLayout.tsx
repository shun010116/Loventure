"use client";

import { useState, useEffect, ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";
import { usePathname }  from "next/navigation";
import dayjs from "dayjs";

import MobileTopBar from "@/components/Layouts/MobileTopBar";
import MobileNav from "@/components/MobileNav";
import MobileLayout from "@/components/Layouts/MobileLayout";
import MobileModal    from "@/components/Mobile/MobileModal";
import { Character, TabKey, Schedule, UserQuest, CoupleQuest, PartnerQuest } from "../Types";


/* 3-종 퀘스트 유니온 타입 */
type AnyQuest = UserQuest | PartnerQuest | CoupleQuest;

interface MobileClientLayoutProps {
  children: ReactNode;
}

export default function MobileClientLayout({ children }: MobileClientLayoutProps) {
  const { user } = useAuth();
  const pathname = usePathname();   // 현재 경로 가져오기
  
   /* ───────── 캐릭터 & 이벤트 ───────── */
  const [myCharacter,      setMyCharacter]      = useState<Character | null>(null);
  const [partnerCharacter, setPartnerCharacter] = useState<Character | null>(null);
  const [schedule,         setSchedule]         = useState<Schedule[]>([]);
  const [myTodayEvents,        setMyTodayEvents]        = useState<Schedule[]>([]);
  const [partnerTodayEvents,   setPartnerTodayEvents]   = useState<Schedule[]>([]);

  /* ───────── 퀘스트 데이터 ───────── */
  const [userQuests,     setUserQuests]     = useState<UserQuest[]>([]);
  const [partnerQuests,  setPartnerQuests]  = useState<PartnerQuest[]>([]);
  const [coupleQuests,   setCoupleQuests]   = useState<CoupleQuest[]>([]);

  /* ───────── 탭 제어 ───────── */
  const [activeTab, setActiveTab] = useState<TabKey>("character");

  /* ───────── 공통 모달 (MobileModal) ───────── */
  const [modalType,      setModalType]      = useState<"user" | "partner" | "couple">("user");
  const [isModalOpen,    setModalOpen]      = useState(false);
  const [editingQuest,   setEditingQuest]   = useState<AnyQuest | null>(null);
  const [selDiff,        setSelDiff]        = useState<number | null>(null);


  useEffect(() => {
    if (pathname === "/") {
      // 홈(“캐릭터” 탭)일 때만 탭 UI
      setActiveTab("character");
    } else {
      // /login, /diary, /myPage 등일 땐 children 렌더
      setActiveTab(null);
    }
  }, [pathname]);

  ///* ───────── 1. 퀘스트 fetch ─────── */
  useEffect(() => {
    (async () => {
      const res = await fetch("/api/allQuests", { credentials: "include" });
      if (!res.ok) return;
      const { data } = await res.json();
      setUserQuests(data.userQuests ?? []);
      setPartnerQuests(data.partnerQuests ?? []);
      setCoupleQuests(data.coupleQuests ?? []);
    })();
  }, []);


  /* ───────── 2. 캐릭터 fetch ─────── */
  useEffect(() => {
    if (!user) return;
    (async () => {
      const res = await fetch("/api/character/me", { credentials: "include" });
      if (!res.ok) return;
      const { data } = await res.json();
      setMyCharacter(data.myCharacter ?? null);
      setPartnerCharacter(data.partnerCharacter ?? null);
    })();
  }, [user]);

  /* ───────── 3. 스케줄 fetch & 필터 ─────── */
  useEffect(() => {
    (async () => {
      const res = await fetch("/api/schedule", { credentials: "include" });
      if (!res.ok) return;
      const { data } = await res.json();
      setSchedule(data.schedules ?? []);
    })();
  }, []);

  useEffect(() => {
    if (!user) return;
    const today = dayjs().format("YYYY-MM-DD");
    const todayOnly = schedule.filter(
      (e) => dayjs(e.startDate).format("YYYY-MM-DD") === today
    );
    setMyTodayEvents(todayOnly.filter((e) => e.participants.includes(user._id)));
    setPartnerTodayEvents(todayOnly.filter((e) => !e.participants.includes(user._id)));
  }, [schedule, user]);

  // 3. 오늘 일정 필터링
  useEffect(() => {
    if (!user) return;
    const today = dayjs().format("YYYY-MM-DD");
    const todayOnly = schedule.filter(
      (e) => dayjs(e.startDate).format("YYYY-MM-DD") === today
    );
    setMyTodayEvents(todayOnly.filter((e) => e.participants.includes(user._id)));
    setPartnerTodayEvents(todayOnly.filter((e) => !e.participants.includes(user._id)));
  }, [schedule, user]);



  
  /* ───────── 모달 열기 핸들러 ─────── */
  const openNewQuest = (type: "user" | "partner" | "couple") => {
    setModalType(type);
    setEditingQuest(null);
    setSelDiff(null);
    setModalOpen(true);
  };


   const openEditQuest = (type: "user" | "partner" | "couple", q: AnyQuest) => {
    setModalType(type);
    setEditingQuest(q);
    if ("difficulty" in q) setSelDiff(q.difficulty ?? null); // user quest
    setModalOpen(true);
  };


  /* ───────── 저장/삭제 콜백 (예시) ─────── */
  const saveQuest = async (partial: Partial<AnyQuest>) => {
    // modalType을 보고 적절한 API 호출 …
    setModalOpen(false);
  };
  const deleteQuest = async () => {
    // …
    setModalOpen(false);
  };



  //  레이아웃 구성
  return (
    <div className="md:hidden bg-[#fdf6e3] min-h-screen pb-16">
      {/* 상단 바 */}
      <MobileTopBar />

      {/* 주요 콘텐츠: 경로 기반으로 탭 UI 렌더링 */}
      <main className="px-4 pt-4">
        {activeTab !== null ? (
          // 첫 화면(캐릭터, 퀘스트, ...) 탭 UI
          <MobileLayout
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            myCharacter={myCharacter}              
            partnerCharacter={partnerCharacter}    
            myEvents={myTodayEvents}
            partnerEvents={partnerTodayEvents}
            userQuests={userQuests}
            partnerQuests={partnerQuests}
            coupleQuests={coupleQuests}

            /* 카드 클릭 → 수정 */
            onUserClick={(q)      => openEditQuest("user", q)}
            onPartnerClick={(q)   => openEditQuest("partner", q)}
            onCoupleClick={(q)    => openEditQuest("couple", q)}

  
            /* + 버튼 → 새로 만들기 */
            onAddUserQuest={()      => openNewQuest("user")}
            onAddPartnerQuest={()   => openNewQuest("partner")}
          />
        ) : (
          // 실제 라우트 컴포넌트
          children
        )}
      </main>

      {/* 하단 탭 바 */}
      <MobileNav activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* 공통 모달 */}
      <MobileModal
        type={modalType}
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        editingQuest={editingQuest}
        saveQuest={saveQuest}
        deleteQuest={deleteQuest}
        selectedDifficulty={selDiff}
        setSelectedDifficulty={setSelDiff}
      />

    </div>
  );
}