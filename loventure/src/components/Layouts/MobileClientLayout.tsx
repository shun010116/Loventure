"use client";

import { useState, useEffect, ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";
import { usePathname }  from "next/navigation";
import dayjs from "dayjs";

import MobileTopBar from "@/components/Layouts/MobileTopBar";
import MobileNav from "@/components/MobileNav";
import MobileLayout from "@/components/Layouts/MobileLayout";
import { Character, TabKey, Schedule, UserQuest, CoupleQuest, PartnerQuest } from "../Types";

interface MobileClientLayoutProps {
  children: ReactNode;
}

export default function MobileClientLayout({ children }: MobileClientLayoutProps) {
  const { user } = useAuth();
  const pathname = usePathname();   // 현재 경로 가져오기
  
  const [myCharacter, setMyCharacter]       = useState<Character | null>(null);
  const [partnerCharacter, setPartnerCharacter]  = useState<Character | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>("character");
  const [quests, setQuests] = useState<UserQuest[]>([]);
  const [partnerQuests, setPartnerQuests] = useState<PartnerQuest[]>([]);
  const [coupleQuests, setCoupleQuests] = useState<CoupleQuest[]>([]);
  const [schedule, setSchedule] = useState<Schedule[]>([]);
  const [myTodayEvents, setMyTodayEvents] = useState<Schedule[]>([]);
  const [partnerTodayEvents, setPartnerTodayEvents] = useState<Schedule[]>([]);

  useEffect(() => {
    if (pathname === "/") {
      // 홈(“캐릭터” 탭)일 때만 탭 UI
      setActiveTab("character");
    } else {
      // /login, /diary, /myPage 등일 땐 children 렌더
      setActiveTab(null);
    }
  }, [pathname]);

  // 1. 퀘스트 데이터 fetch
  useEffect(() => {
    const fetchData = async () => {
    try {
      const res = await fetch("/api/allQuests", {
        credentials: "include",     
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        console.error("Failed to fetch quests:", res.status);
        return;
      }

      const text = await res.text();
      if (!text) {
        console.warn("Empty response from /api/allQuests");
        return;
      }

      const data = JSON.parse(text);

      if (data?.data) {
        setQuests(data.data.userQuests || []);
        setCoupleQuests(data.data.coupleQuests || []);
        setPartnerQuests(data.data.partnerQuests || []);
      } else {
        console.warn("No valid data in /api/allQuests response");
      }
    } catch (err) {
      console.error("Error fetching quests:", err);
    }
  };
  
    fetchData();
  }, []);


// 캐릭터 데이터 가져오기

useEffect(() => {
  // 로그인 된 경우만 호출
  if (!user) return;

  const fetchCharacter = async () => {
    const res = await fetch("/api/character/me", { credentials: "include" });
    if (!res.ok) return;
    const { data } = await res.json();
    setMyCharacter(data.myCharacter || null);
    setPartnerCharacter(data.partnerCharacter || null);
  };

  fetchCharacter();
}, [user]);

  // 스케줄 데이터 fetch
  useEffect(() => {
    const fetchSchedule = async () => {
    try {
      const res = await fetch("/api/schedule", {
        credentials: "include",
      });

      // 응답이 실패했거나 내용이 없으면 예외 처리
      if (!res.ok) {
        console.error("Failed to fetch schedule: ", res.status);
        return;
      }

      const text = await res.text(); // 먼저 텍스트로 받아서 검사
      if (!text) {
        console.warn("Empty response from /api/schedule");
        return;
      }

      const data = JSON.parse(text); // 수동 파싱
      if (data?.data?.schedules) {
        setSchedule(data.data.schedules);
      }
    } catch (err) {
      console.error("Error fetching schedule:", err);
    }
  };


    fetchSchedule();
  }, []);

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
            userQuests={quests}
            partnerQuests={partnerQuests}
            coupleQuests={coupleQuests}
            onUserClick={() => {}}
            onPartnerClick={() => {}}
            onCoupleClick={() => {}}
          />
        ) : (
          // 실제 라우트 컴포넌트
          children
        )}
      </main>

      {/* 하단 탭 바 */}
      <MobileNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}