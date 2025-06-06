"use client";

import { useState, useEffect } from "react";
import MobileTopBar from "@/components/Layouts/MobileTopBar";
import MobileNav from "@/components/MobileNav";
import MobileLayout from "@/components/Layouts/MobileLayout";
import dayjs from "dayjs";
import { useAuth } from "@/hooks/useAuth";
import { TabKey, Schedule, UserQuest, CoupleQuest, PartnerQuest } from "../Types";

export default function MobileClientLayout() {
  const { user } = useAuth();
  
  const [activeTab, setActiveTab] = useState<TabKey>("character");

  const [quests, setQuests] = useState<UserQuest[]>([]);
  const [partnerQuests, setPartnerQuests] = useState<PartnerQuest[]>([]);
  const [coupleQuests, setCoupleQuests] = useState<CoupleQuest[]>([]);
  const [schedule, setSchedule] = useState<Schedule[]>([]);
  const [myTodayEvents, setMyTodayEvents] = useState<Schedule[]>([]);
  const [partnerTodayEvents, setPartnerTodayEvents] = useState<Schedule[]>([]);

  // 1. 퀘스트 데이터 fetch
  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch("/api/allQuests");
      const data = await res.json();
      if (res.ok && data?.data) {
        setQuests(data.data.userQuests || []);
        setCoupleQuests(data.data.coupleQuests || []);
        setPartnerQuests(data.data.partnerQuests || []);
      }
    };
    fetchData();
  }, []);

  // 2. 스케줄 데이터 fetch
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
    <div className="sm:hidden bg-white min-h-screen pb-16">
      {/* 상단 바 */}
      <MobileTopBar />

      {/* 주요 콘텐츠 */}
      <main className="px-4 pt-4">
        <MobileLayout
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          myEvents={myTodayEvents}
          partnerEvents={partnerTodayEvents}
          userQuests={quests}
          partnerQuests={partnerQuests}
          coupleQuests={coupleQuests}
          onUserClick={() => {}} // 필요 시 추후 연결
          onPartnerClick={() => {}}
          onCoupleClick={() => {}}
        />
      </main>

      {/* 하단 탭 바 */}
      <MobileNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}