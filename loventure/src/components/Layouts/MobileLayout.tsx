"use client";

import CharacterSection from "@/components/Mobile/CharacterSection";
import QuestSection from "@/components/Mobile/QuestSection";
import CoupleQuestSection from "@/components/Mobile/CoupleQuestSection";
import CalendarSection from "@/components/Mobile/CalendarSection";
import DiarySection from "@/components/Mobile/DiarySection";

import { TabKey, Character, UserQuest, PartnerQuest } from "../Types";

interface MobileLayoutProps {
  activeTab: TabKey;
  setActiveTab: (tab: TabKey) => void;

  /* 캐릭터 & 이벤트 */
  myCharacter: Character | null;
  partnerCharacter: Character | null;
  myEvents: any;
  partnerEvents: any;

  /* 퀘스트 데이터 */
  userQuests: UserQuest[];
  partnerQuests: PartnerQuest[];
  coupleQuests: any;

  saveQuest?: (q: Partial<UserQuest | PartnerQuest>) => void;
  deleteQuest?: () => void;
  completeQuest?: () => void;

  userNickname: string;
  partnerNickname: string;

  /* 콜백 */
  onUserClick:      (q: UserQuest)      => void;
  onPartnerClick:   (q: PartnerQuest)   => void;
  onCoupleClick:    (q: any)            => void;
  onAddUserQuest:   () => void;        
  onAddPartnerQuest?: () => void;      
}

export default function MobileLayout({
  activeTab,
  setActiveTab,
  myCharacter,
  partnerCharacter,
  myEvents,
  partnerEvents,
  userQuests,
  partnerQuests,
  coupleQuests,
  saveQuest,
  deleteQuest,
  completeQuest,
  userNickname,
  partnerNickname,
  onUserClick,
  onPartnerClick,
  onCoupleClick,
  onAddUserQuest,        /* ★ 추가 */
  onAddPartnerQuest,     /* ★ 추가 */
}: MobileLayoutProps) {
  return (
    <div className="sm:hidden pb-20 px-4 pt-4">

      {/* 캐릭터 탭 */}
      {activeTab === "character" && (
        <CharacterSection
          myCharacter={myCharacter}
          partnerCharacter={partnerCharacter}
          myEvents={myEvents}
          partnerEvents={partnerEvents}
        />
      )}

      {/* 퀘스트 탭 */}
      {activeTab === "quest" && (
        <QuestSection
          userNickname={userNickname}
          partnerNickname={partnerNickname}
          userQuests={userQuests}
          partnerQuests={partnerQuests}
          saveQuest={saveQuest}
          deleteQuest={deleteQuest}
          completeQuest={completeQuest}
          onUserClick={onUserClick}
          onPartnerClick={onPartnerClick}
          onAddUserQuest={onAddUserQuest}           /* ★ 전달 */
          onAddPartnerQuest={onAddPartnerQuest}     /* ★ 전달 (선택) */
        />
      )}

      {/* 커플·달력·다이어리 탭 */}
      {activeTab === "couple"   && <CoupleQuestSection quests={coupleQuests} onClick={onCoupleClick} />}
      {activeTab === "calendar" && <CalendarSection />}
      {activeTab === "diary"    && <DiarySection />}
    </div>
  );
}