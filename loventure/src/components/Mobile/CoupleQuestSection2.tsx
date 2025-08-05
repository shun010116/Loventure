// components/CoupleQuestSection.tsx
"use client";

import React from "react";
import { CirclePlus } from "lucide-react";
import { CoupleQuest } from "../Types";

interface CoupleQuestSectionProps {
  quests: CoupleQuest[];
  onCoupleClick: (q: CoupleQuest) => void;
  onAddCoupleQuest: () => void;
}

export default function CoupleQuestSection({
  quests,
  onCoupleClick,
  onAddCoupleQuest,
}: CoupleQuestSectionProps) {
  return (
    <div className="sm:hidden bg-orange-100 p-4 rounded-xl">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold mb-2">커플 퀘스트</h3>
        <button
          onClick={onAddCoupleQuest}
          className="p-1 text-orange-600 hover:text-orange-800 active:scale-95 transition"
        >
          <CirclePlus size={20} />
        </button>
      </div>
      <ul className="space-y-1">
        {quests.length > 0
          ? quests.map(q => (
              <li key={q._id} className="bg-white px-3 py-2 rounded cursor-pointer" onClick={() => onCoupleClick(q)}>
                {q.title}
              </li>
            ))
          : <li className="text-sm text-gray-400">No couple quests</li>}
      </ul>
    </div>
  );
}