"use client";

import CharacterSection from "@/components/Mobile/CharacterSection";
import QuestSection from "@/components/Mobile/QuestSection";
import CoupleQuestSection from "@/components/Mobile/CoupleQuestSection";
import CalendarSection from "@/components/Mobile/CalendarSection";
import DiarySection from "@/components/Mobile/DiarySection";

import { TabKey, Character } from "../Types";

interface MobileLayoutProps {
  activeTab: TabKey;
  setActiveTab: (tab: TabKey) => void;
  myCharacter: Character | null;
  partnerCharacter: Character | null;   
  myEvents: any;
  partnerEvents: any;
  userQuests: any;
  partnerQuests: any;
  coupleQuests: any;
  onUserClick: (q: any) => void;
  onPartnerClick: (q: any) => void;
  onCoupleClick: (q: any) => void;
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
  onUserClick,
  onPartnerClick,
  onCoupleClick,
}: MobileLayoutProps) {
  return (
    <div className="sm:hidden pb-20 px-4 pt-4">
      {activeTab === "character" && (
        <CharacterSection
          myCharacter={myCharacter}
          partnerCharacter={partnerCharacter}
          myEvents={myEvents}
          partnerEvents={partnerEvents}
        />
      )}
      {activeTab === "quest" && (
        <QuestSection
          userQuests={userQuests}
          partnerQuests={partnerQuests}
          onUserClick={onUserClick}
          onPartnerClick={onPartnerClick}
        />
      )}
      {activeTab === "couple" && <CoupleQuestSection quests={coupleQuests} onClick={onCoupleClick} />}
      {activeTab === "calendar" && <CalendarSection />}
      {activeTab === "diary" && <DiarySection />}
    </div>
  );
}