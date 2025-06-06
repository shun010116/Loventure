// components/layouts/MobileLayout.tsx
"use client";

import { useState } from "react";
import MobileNav from "@/components/MobileNav";
import CharacterSection from "@/components/Mobile/CharacterSection";
import QuestSection from "@/components/Mobile/QuestSection";
import CoupleQuestSection from "@/components/Mobile/CoupleQuestSection";
import CalendarSection from "@/components/Mobile/CalendarSection";

export default function MobileLayout({
  myEvents,
  partnerEvents,
  userQuests,
  partnerQuests,
  coupleQuests,
  onUserClick,
  onPartnerClick,
  onCoupleClick,
}: any) {
  const [activeTab, setActiveTab] = useState("character");

  return (
    <div className="sm:hidden pb-20 px-4 pt-4">
      {activeTab === "character" && <CharacterSection myEvents={myEvents} partnerEvents={partnerEvents} />}
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

      <MobileNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}