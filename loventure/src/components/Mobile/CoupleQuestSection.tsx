// components/CoupleQuestSection.tsx
import React from "react";
import { CoupleQuest } from "../qeustTypes";

interface CoupleQuestSectionProps {
  quests: CoupleQuest[];
  onClick: (q: CoupleQuest) => void;
}

export default function CoupleQuestSection({ quests, onClick }: CoupleQuestSectionProps) {
  return (
    <div className="sm:hidden bg-orange-100 p-4 rounded-xl">
      <h3 className="font-semibold mb-2">커플 퀘스트</h3>
      <ul className="space-y-1">
        {quests.length > 0
          ? quests.map(q => (
              <li key={q._id} className="bg-white px-3 py-2 rounded cursor-pointer" onClick={() => onClick(q)}>
                {q.title}
              </li>
            ))
          : <li className="text-sm text-gray-400">No couple quests</li>}
      </ul>
    </div>
  );
}