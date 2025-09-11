"use client";

import CharacterSection from "@/components/Mobile/CharacterSection";
import QuestSection from "@/components/Mobile/QuestSection";
import CoupleQuestSection from "@/components/Mobile/CoupleQuestSection";
import CalendarSection from "@/components/Mobile/CalendarSection";
import DiarySection from "@/components/Mobile/DiarySection";

import { TabKey, Character, UserQuest, CoupleQuest } from "../Types";

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
  partnerQuests: UserQuest[];
  coupleQuests: CoupleQuest[];

  userNickname: string;
  partnerNickname: string;

  /* 콜백 */
  onUserClick:        (q: UserQuest)      => void;
  onPartnerClick:     (q: UserQuest)      => void;
  onCoupleClick:      (q: CoupleQuest)    => void;
  onAddUserQuest:     () => void;        
  onAddPartnerQuest?: () => void;
  onAddCoupleQuest:   () => void;
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
  userNickname,
  partnerNickname,
  onUserClick,
  onPartnerClick,
  onCoupleClick,
  onAddUserQuest,        /* ★ 추가 */
  onAddPartnerQuest,     /* ★ 추가 */
  onAddCoupleQuest,
}: MobileLayoutProps) {
  return (
    <div className="sm:hidden pb-20 px-4 pt-4">

      {/* 캐릭터 탭 */}
      {activeTab === "character" && (
        <CharacterSection
          myNickname={userNickname}
          partnerNickname={partnerNickname}
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
          onUserClick={onUserClick}
          onPartnerClick={onPartnerClick}
          onAddUserQuest={onAddUserQuest}           /* ★ 전달 */
          onAddPartnerQuest={onAddPartnerQuest}     /* ★ 전달 (선택) */
        />
      )}

      {/* 커플 탭 */}
      {activeTab === "couple" && (
        <CoupleQuestSection
          quests={coupleQuests}
          onCoupleClick={onCoupleClick}
          onAddCoupleQuest={onAddCoupleQuest}
        />
      )}
      {/* 달력·다이어리 탭 */}
      {activeTab === "calendar" && <CalendarSection />}
      {activeTab === "diary"    && <DiarySection />}
    </div>
  );
}
