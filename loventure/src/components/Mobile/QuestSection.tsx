// components/Mobile/QuestSection.tsx
"use client";

import React from "react";
import { CirclePlus  } from "lucide-react";    
import { UserQuest, PartnerQuest } from "../Types";

interface QuestSectionProps {
  userNickname: string;
  partnerNickname: string;
  userQuests: UserQuest[];
  partnerQuests: PartnerQuest[];
  saveQuest?: (q: Partial<UserQuest | PartnerQuest>) => void;
  deleteQuest?: () => void;
  completeQuest?: () => void;
  onUserClick:      (q: UserQuest)    => void;
  onPartnerClick:   (q: PartnerQuest) => void;
  onAddUserQuest:   () => void;           
  onAddPartnerQuest?: () => void;          
}

export default function QuestSection({
  userNickname,
  partnerNickname,
  userQuests,
  partnerQuests,
  onUserClick,
  onPartnerClick,
  onAddUserQuest,
  onAddPartnerQuest,
}: QuestSectionProps) {
  /* 공통 헤더 구성 함수 */
  const renderHeader = (
    nickname: string,
    onAdd?: () => void
  ) => (
    <div className="flex items-center justify-between mb-2">
      <h3 className="font-semibold">{nickname}님의 퀘스트</h3>
      {onAdd && (
        <button
          onClick={onAdd}
          className="p-1 text-blue-600 hover:text-blue-800 active:scale-95 transition"
        >
          <CirclePlus size={20} />
        </button>
      )}
    </div>
  );

  return (
    <div className="flex flex-col gap-4 sm:hidden">
      {/* 유저 퀘스트 */}
      <div className="bg-blue-50 p-4 rounded-xl">
        {renderHeader(userNickname, onAddUserQuest)}
        <ul className="space-y-1">
          {userQuests.map((q) => (
            <li
              key={q._id}
              onClick={() => onUserClick(q)}
              className="bg-white p-2 rounded cursor-pointer active:scale-[0.97] transition"
            >
              {q.title}
            </li>
          ))}
        </ul>
      </div>

      {/* 파트너 퀘스트 */}
      <div className="bg-purple-100 p-4 rounded-xl">
        {renderHeader(partnerNickname, onAddPartnerQuest)}
        <ul className="space-y-1">
          {partnerQuests.map((q) => (
            <li
              key={q._id}
              onClick={() => onPartnerClick(q)}
              className="bg-white p-2 rounded cursor-pointer active:scale-[0.97] transition"
            >
              {q.title}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}