// components/Mobile/QuestSection.tsx
"use client";

import React from "react";
import { Heart, Cross } from "lucide-react";
import clsx from "clsx";
import { UserQuest } from "../Types";

/* ---------- 공통 타입 ---------- */
type MinimalQuest = {
  _id: string;
  title: string;
  status: string;            // pending | accepted | ...
};

/* ---------- 개별 아이템 ---------- */
type QuestItemProps<T extends MinimalQuest> = {
  quest: T;
  onClick: (q: T) => void;
  activeColor: string;
  passiveColor: string;
};


/* ------------------------------------------------------------ */
/* 퀘스트 아이템 표시용 컴포넌트                                  */
/* ------------------------------------------------------------ */
function QuestItem<T extends MinimalQuest>({
  quest,
  onClick,
  activeColor,
  passiveColor,
}: QuestItemProps<T>) {
  const active = quest.status !== "pending" && quest.status !== "rejected";

  return (
    <li
      onClick={() => onClick(quest)}
      className="flex items-center gap-2 cursor-pointer active:scale-[0.97] transition"
    >
      <Heart
        size={20}
        strokeWidth={active ? 2 : 1}
        fill={active ? activeColor : "transparent"}
        className={clsx(active ? activeColor : passiveColor, "shrink-0")}
      />
      <span
        className={clsx(
          "text-lg sm:text-2xl",
          active ? activeColor : passiveColor
        )}
      >
        {quest.title}
      </span>
    </li>
  );
}

/* ------------------------------------------------------------ */
/* 메인 섹션                                                     */
/* ------------------------------------------------------------ */

const SectionHeader: React.FC<{
  label: string;
  onAdd?: () => void;
}> = ({ label, onAdd }) => (
  <>
    <div className="flex items-center justify-between mb-1">
      <span className="font-semibold text-lg sm:text-xl">{label}</span>
      {onAdd && (
        <button onClick={onAdd} className="p-1 active:scale-95 transition">
          <Cross size={22} />
        </button>
      )}
    </div>
    <hr className="mx-auto w-[98%] border-t-[1.5px] border-gray-600 mb-3" />
  </>
);

interface QuestSectionProps {
  userNickname: string;
  partnerNickname: string;
  userQuests: UserQuest[];
  partnerQuests: UserQuest[];
  /* 콜백들 */
  onUserClick:      (q: UserQuest)    => void;
  onPartnerClick:   (q: UserQuest) => void;
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
  return ( /* 여기는 임시로 다크모드  */
    <div className="flex flex-col dark:bg-[#fdf6e3] dark:text-black gap-8 sm:hidden px-4 pt-4">
      <h2 className="text-center font-serif text-5xl sm:text-4xl mb-4">
        Quest
      </h2>

      {/* 내 퀘스트 */}
      <section>
        <SectionHeader
          label={`${userNickname}의 퀘스트`}
          onAdd={onAddUserQuest}
        />
        <ul className="space-y-2">
          {userQuests.map((q) => (
            <QuestItem
              key={q._id}
              quest={q}
              onClick={onUserClick}
              activeColor="text-blue-500 fill-blue-500"
              passiveColor="text-blue-300"
            />
          ))}
        </ul>
      </section>

      {/* 파트너 퀘스트 */}
      <section>
        <SectionHeader
          label={`${partnerNickname}의 퀘스트`}
          onAdd={onAddPartnerQuest}
        />
        <ul className="space-y-2">
          {partnerQuests.map((q) => (
            <QuestItem
              key={q._id}
              quest={q}
              onClick={onPartnerClick}
              activeColor="text-red-500 fill-red-500"
              passiveColor="text-red-300"
            />
          ))}
        </ul>
      </section>
    </div>
  );
}