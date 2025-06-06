// components/QuestSection.tsx
import React from "react";
import { UserQuest, PartnerQuest } from "../Types";

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
    <div className="flex flex-col gap-4 sm:hidden">
      <div className="bg-blue-50 p-4 rounded-xl">
        <h3 className="font-semibold mb-2">유저 퀘스트</h3>
        <ul className="space-y-1">
          {userQuests.map(q => (
            <li key={q._id} onClick={() => onUserClick(q)} className="bg-white p-2 rounded">
              {q.title}
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-purple-100 p-4 rounded-xl">
        <h3 className="font-semibold mb-2">연인 퀘스트</h3>
        <ul className="space-y-1">
          {partnerQuests.map(q => (
            <li key={q._id} onClick={() => onPartnerClick(q)} className="bg-white p-2 rounded">
              {q.title}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}