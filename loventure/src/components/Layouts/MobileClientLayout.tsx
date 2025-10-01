"use client";

import { useState, useEffect, ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";
import { usePathname }  from "next/navigation";
import dayjs from "dayjs";

import MobileTopBar from "@/components/Layouts/MobileTopBar";
import MobileNav from "@/components/MobileNav";
import MobileLayout from "@/components/Layouts/MobileLayout";
import MobileModal    from "@/components/Mobile/MobileModal";
import { Character, TabKey, Schedule, UserQuest, CoupleQuest } from "../Types";


/* 2-종 퀘스트 유니온 타입 */
type AnyQuest = UserQuest | CoupleQuest;

interface MobileClientLayoutProps {
  children: ReactNode;
}

export default function MobileClientLayout({ children }: MobileClientLayoutProps) {
  const { user, partner, loading, isLoggedIn } = useAuth();
  const pathname = usePathname();   // 현재 경로 가져오기
  
  /* ───────── 유저 & 파트너 정보 ───────── */
  const [userNickname, setUserNickname] = useState<string>("");
  const [partnerNickname, setPartnerNickname] = useState<string>("");

   /* ───────── 캐릭터 & 이벤트 ───────── */
  const [myCharacter,      setMyCharacter]      = useState<Character | null>(null);
  const [partnerCharacter, setPartnerCharacter] = useState<Character | null>(null);
  const [schedule,         setSchedule]         = useState<Schedule[]>([]);
  const [myTodayEvents,        setMyTodayEvents]        = useState<Schedule[]>([]);
  const [partnerTodayEvents,   setPartnerTodayEvents]   = useState<Schedule[]>([]);

  /* ───────── 퀘스트 데이터 ───────── */
  const [userQuests,     setUserQuests]     = useState<UserQuest[]>([]);
  const [partnerQuests,  setPartnerQuests]  = useState<UserQuest[]>([]);
  const [coupleQuests,   setCoupleQuests]   = useState<CoupleQuest[]>([]);

  /* ───────── 탭 제어 ───────── */
  const [activeTab, setActiveTab] = useState<TabKey>("character");

  /* ───────── 공통 모달 (MobileModal) ───────── */
  const [modalType,      setModalType]      = useState<"user" | "partner" | "couple">("user");
  const [isModalOpen,    setModalOpen]      = useState(false);
  const [editingQuest,   setEditingQuest]   = useState<AnyQuest | null>(null);
  const [selDiff,        setSelDiff]        = useState<number | null>(null);
  const [currentUserId,  setCurrentUserId]  = useState<string | null>(null);
  const [selectedGoalType, setSelectedGoalType] = useState<string>(editingQuest?.goalType ?? "");
  const [goalType, setGoalType] = useState<string>(selectedGoalType);


  useEffect(() => {
    if (pathname !== "/") {
      // 홈(“캐릭터” 탭)일 때만 탭 UI
      setActiveTab(null);
    } else {
      // /login, /diary, /myPage 등일 땐 children 렌더
      setActiveTab((prev) => prev ?? "character");
    }
  }, [pathname]);

  // useEffect(() => {
  //   if (pathname === "/") {
      
  //     setActiveTab("character");
  //   } else {
      
  //     setActiveTab(null);
  //   }
  // }, [pathname]);

  useEffect(() => {
    if (!user) return;
    setUserNickname(user.nickname);
    setCurrentUserId(user._id);
    if (partner) {
      setPartnerNickname(partner.nickname);
    }
  }, [user, partner]);

  ///* ───────── 1. 퀘스트 fetch ─────── */
  const fetchAllQuests = async () => {
    const res = await fetch("/api/allQuests", { credentials: "include" });
    if (!res.ok) return;
    const { data } = await res.json();
    setUserQuests(data.userQuests ?? []);
    setPartnerQuests(data.partnerQuests ?? []);
    setCoupleQuests(data.coupleQuests ?? []);
  };
  
  useEffect(() => {
    if (!loading && isLoggedIn) {
      fetchAllQuests();
    }
  }, [loading, isLoggedIn])
  
  /* ───────── 2. 캐릭터 fetch ─────── */
  const fetchCharacters = async () => {
    const res = await fetch("/api/character/me", { credentials: "include" });
    if (!res.ok) return;
    const { data } = await res.json();
    setMyCharacter(data.myCharacter ?? null);
    setPartnerCharacter(data.partnerCharacter ?? null);
  }
  useEffect(() => {
    if (!user) return;
    fetchCharacters();
  }, [user]);
  useEffect(() => {
    if (activeTab === "character") {
      fetchCharacters();
    }
  }, [activeTab]);

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
    if (type === "user" || type === "partner") {
      setSelectedGoalType("check");
    } else {
      setSelectedGoalType("shared-count");
    }
    setModalOpen(true);
  };

   const openEditQuest = (type: "user" | "partner" | "couple", q: AnyQuest) => {
    setModalType(type);
    setEditingQuest(q);
    if ("difficulty" in q) setSelDiff(q.difficulty ?? null); // user quest
    setSelectedGoalType(q.goalType ?? "");
    setModalOpen(true);
  };

  /* ───────── 저장/삭제 콜백 (예시) ─────── */
  const saveQuest = async (quest: Partial<AnyQuest>) => {
    const isEditing = !!editingQuest;
    const baseUserQuestUrl = "/api/userQuest";
    const baseCoupleQuestUrl = "/api/coupleQuest";

    let userId: string | undefined;
    let setQuestState: React.Dispatch<React.SetStateAction<any[]>> | undefined;
    let apiUrl = "";
    let method = "POST";
    const requestBody: any = {
      createdBy: user._id,
      title: quest.title,
      description: quest.description,
      goalType: quest.goalType,
      targetValue: quest.targetValue ?? 1,
      resetType: quest.resetType,
      reward: {
        exp: quest.reward?.exp ?? 0,
        gold: quest.reward?.gold ?? 0,
      },
      status: quest.status ?? "pending",
    };

    if (modalType === "user" || modalType === "partner") {
      const q = quest as Partial<UserQuest>;
      requestBody.difficulty = q.difficulty ?? 1;
      requestBody.needApproval = q.needApproval ?? false;
    }

    // modalType을 보고 적절한 API 호출 …
    if (modalType === "user") {
      userId = user?._id;
      setQuestState = setUserQuests;
      apiUrl = isEditing ? `${baseUserQuestUrl}/${editingQuest._id}` : baseUserQuestUrl;
      if (!isEditing) requestBody.userId = userId;
    } else if (modalType === "partner") {
      userId = partner?._id;
      setQuestState = setPartnerQuests;
      apiUrl = isEditing ? `${baseUserQuestUrl}/${editingQuest._id}` : baseUserQuestUrl;
      if (!isEditing) requestBody.userId = userId;
    } else if (modalType === "couple") {
      apiUrl = isEditing ? `${baseCoupleQuestUrl}/${editingQuest._id}` : baseCoupleQuestUrl;
    }

    if (isEditing) {
      method = "PATCH";
      if (setQuestState) {
        setQuestState((prev) =>
          prev.map((q) => (q._id === editingQuest._id ? { ...q, ...quest } : q))
        );
      }
    }

    const res = await fetch(apiUrl, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });

    if (res.ok) {
      await fetchAllQuests();
    } else {
      let data: { message?: string } = {};
      try {
        data = await res.json();
      } catch (e) {
        console.warn("Failed to parse error response", e);
      }
      alert(data?.message || "퀘스트 저장 실패");
    }

    setModalOpen(false);
  };

  const deleteQuest = async () => {
    if (!editingQuest) return;

    let apiUrl = "";
    if (modalType === "user" || modalType === "partner") {
      apiUrl = `/api/userQuest/${editingQuest._id}`;
    } else if (modalType === "couple") {
      apiUrl = `/api/coupleQuest/${editingQuest._id}`;
    }

    const res = await fetch(apiUrl, {
      method: "DELETE",
    });

    if (res.ok) {
      await fetchAllQuests();
    } else {
      let data: { message?: string } = {};
      try {
        data = await res.json();
      } catch (e) {
        console.warn("Failed to parse error response", e);
      }
      alert(data?.message || "삭제 실패");
    }

    setModalOpen(false);
  };
  
  const completeQuest = async () => {
    if (!editingQuest) return;

    let apiUrl = "";
    if (modalType === "user" || modalType === "partner") {
      apiUrl = `/api/userQuest/${editingQuest._id}/complete`;  
    } else if (modalType === "couple") {
      apiUrl = `/api/coupleQuest/${editingQuest._id}/complete`;
    }

    const res = await fetch(apiUrl, {
      method: "PATCH",
    });

    if (res.ok) {
      await fetchAllQuests();
    } else {
      let data: { message?: string } = {};
      try {
        data = await res.json();
      } catch (e) {
        console.warn("Failed to parse error response", e);
      }
      alert(data?.message || "완료 실패");
    }

    setModalOpen(false);
  };

  const acceptQuest = async () => {
    if (modalType === "user" && editingQuest) {
      const res = await fetch(`/api/userQuest/${editingQuest._id}/accept`, {
        method: "PATCH",
      });

      if (res.ok) {
        await fetchAllQuests();
      } else {
        const data = await res.json();
        alert(data?.message || "퀘스트 수락 실패");
      }
    }
    setModalOpen(false);
  }

  const rejectQuest = async () => {
    if (editingQuest) {
      const res = await fetch(`/api/userQuest/${editingQuest._id}/reject`, {
        method: "PATCH",
      });

      if (res.ok) {
        await fetchAllQuests();
      } else {
        const data = await res.json();
        alert(data?.message || "퀘스트 거절 실패");
      }
    }
    setModalOpen(false);
  }

  const approveQuest = async () => {
    if (editingQuest) {
      const res = await fetch(`/api/userQuest/${editingQuest._id}/approve`, {
        method: "PATCH",
      });

      if (res.ok) {
        await fetchCharacters();
        await fetchAllQuests();
      } else {
        const data = await res.json();
        alert(data?.message || "퀘스트 승인 실패");
      }
    }
    setModalOpen(false);
  }

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedGoalType(value);
  }

  //  레이아웃 구성
  return (
    <div className="md:hidden bg-[#fdf6e3] dark:bg-[#fdf6e3] dark:text-black min-h-screen pb-16">
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
            userNickname={userNickname}
            partnerNickname={partnerNickname}

            /* 카드 클릭 → 수정 */
            onUserClick={(q)      => openEditQuest("user", q)}
            onPartnerClick={(q)   => openEditQuest("partner", q)}
            onCoupleClick={(q)    => openEditQuest("couple", q)}
  
            /* + 버튼 → 새로 만들기 */
            onAddUserQuest={()      => openNewQuest("user")}
            onAddPartnerQuest={()   => openNewQuest("partner")}
            onAddCoupleQuest={()    => openNewQuest("couple")}
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
        onClose={()                 => setModalOpen(false)}
        editingQuest={editingQuest}
        currentUserId={currentUserId}
        saveQuest={(q)              => saveQuest(q)}
        deleteQuest={()             => deleteQuest()}
        completeQuest={()           => completeQuest()}
        acceptUserQuest={()         => acceptQuest()}
        rejectUserQuest={()         => rejectQuest()}
        approveUserQuest={()        => approveQuest()}
        selectedDifficulty={selDiff}
        setSelectedDifficulty={setSelDiff}
        selectedGoalType={selectedGoalType}
        setSelectedGoalType={setSelectedGoalType}
        handleChange={(e)           => handleChange(e)}
      />

    </div>
  );
}