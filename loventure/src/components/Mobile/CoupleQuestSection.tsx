// components/Mobile/CoupleQuestSection.tsx
"use client";

import React from "react";
import { Heart, Cross } from "lucide-react";
import clsx from "clsx";
import { CoupleQuest } from "../Types";

/* 공통 최소 타입 */
type MinimalCouple = {
  _id: string;
  title: string;
  status: string; // pending / accepted / completed / ...
};

/* 아이템 */
type CoupleItemProps<T extends MinimalCouple> = {
  quest: T;
  onClick: (q: T) => void;
};

function CoupleItem<T extends MinimalCouple>({
  quest,
  onClick,
}: CoupleItemProps<T>) {
  const active =
    quest.status !== "pending" && quest.status !== "rejected";

  return (
    <li
      onClick={() => onClick(quest)}
      className="flex items-center gap-2 cursor-pointer active:scale-[0.97] transition"
    >
      <Heart
        size={20}
        strokeWidth={active ? 2 : 1}
        fill={active ? "currentColor" : "transparent"}
        className={clsx(
          active ? "text-orange-500 fill-orange-500" : "text-orange-300",
          "shrink-0"
        )}
      />
      <span
        className={clsx(
          "text-lg sm:text-2xl",
          active ? "text-orange-500" : "text-orange-300"
        )}
      >
        {quest.title}
      </span>
    </li>
  );
}

/* 섹션 컴포넌트 */
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
    <div className="flex flex-col gap-8 sm:hidden px-4 pt-4">
      <h2 className="text-center font-serif text-5xl sm:text-4xl mb-4">
        Couple Quest
      </h2>

      <section className="sm:hidden px-4">
        {/* 헤더 + 플러스 + 수평선 */}
        <div className="flex items-center justify-between mb-1">
          <span className="font-semibold text-lg sm:text-xl">커플 퀘스트</span>
          <button onClick={onAddCoupleQuest} className="p-1 active:scale-95">
            <Cross size={22} />
          </button>
        </div>
        <hr className="mx-auto w-[98%] border-t-[1.5px] border-gray-600 mb-3" />

        {/* 리스트 */}
        <ul className="space-y-2">
          {quests.length ? (
            quests.map((q) => (
              <CoupleItem
                key={q._id}
                quest={q}
                onClick={onCoupleClick}
              />
            ))
          ) : (
            <li className="text-sm text-gray-400">No couple quests</li>
          )}
        </ul>
      </section>
    </div>
  );
}