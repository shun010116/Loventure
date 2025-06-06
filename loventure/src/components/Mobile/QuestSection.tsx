// components/QuestSection.tsx
import React from "react";
import { UserQuest, PartnerQuest } from "../qeustTypes";

interface QuestSectionProps {
  userQuests: UserQuest[];
  partnerQuests: PartnerQuest[];
  onUserClick: (q: UserQuest) => void;
  onPartnerClick: (q: PartnerQuest) => void;
}

export default function QuestSection({
  userQuests,
  partnerQuests,
  onUserClick,
  onPartnerClick,
}: QuestSectionProps) {
  return (
    <div className="flex gap-4 overflow-x-auto sm:hidden">
      <div className="min-w-[260px] flex-shrink-0 bg-blue-50 p-4 rounded-xl">
        <h3 className="font-semibold mb-2">유저 퀘스트</h3>
        <ul className="space-y-1">
          {userQuests.length > 0
            ? userQuests.map(q => (
                <li key={q._id} className="bg-white px-3 py-2 rounded cursor-pointer" onClick={() => onUserClick(q)}>
                  {q.title}
                </li>
              ))
            : <li className="text-sm text-gray-400">No quests</li>}
        </ul>
      </div>

      <div className="min-w-[260px] flex-shrink-0 bg-purple-100 p-4 rounded-xl">
        <h3 className="font-semibold mb-2">연인 퀘스트</h3>
        <ul className="space-y-1">
          {partnerQuests.length > 0
            ? partnerQuests.map(q => (
                <li key={q._id} className="bg-white px-3 py-2 rounded cursor-pointer" onClick={() => onPartnerClick(q)}>
                  {q.title}
                </li>
              ))
            : <li className="text-sm text-gray-400">No partner quests</li>}
        </ul>
      </div>
    </div>
  );
}