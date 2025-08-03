// components/Mobile/QuestSection.tsx
"use client";

import React from "react";
import { Heart, Cross } from "lucide-react";
import clsx from "clsx";
import { UserQuest, PartnerQuest } from "../Types";

interface QuestSectionProps {
  userNickname: string;
  partnerNickname: string;
  userQuests: UserQuest[];
  partnerQuests: PartnerQuest[];
  /* 콜백들 */
  onUserClick:      (q: UserQuest)    => void;
  onPartnerClick:   (q: PartnerQuest) => void;
  onAddUserQuest:   () => void;
  onAddPartnerQuest?: () => void;
}

/* ------------------------------------------------------------ */
/* 퀘스트 아이템 표시용 컴포넌트                                  */
/* ------------------------------------------------------------ */
type QuestItemProps<T> = {
  quest: T;
  onClick: (q: T) => void;
  activeColor: string;   // 텍스트·하트 색상
  passiveColor: string;  // 비활성(연한) 색상
};

function QuestItem<T extends { _id: string; title: string; isAccepted?: boolean }>(
  { quest, onClick, activeColor, passiveColor }: QuestItemProps<T>
) {
  const active = quest.isAccepted ?? true;  // 퀘스트는 기본적으로 활성화 상태
  return (
    <li
      key={quest._id}
      onClick={() => onClick(quest)}
      className="flex items-center gap-2 cursor-pointer active:scale-[0.97] transition"
    >
      {/* 하트 */}
      <Heart
        size={20}
        strokeWidth={active ? 2 : 1}
        /* fill 속성으로 채우기 */
        fill={active ? activeColor : "transparent"}
        className={clsx(
          active ? activeColor : passiveColor,
          "shrink-0"
        )}
      />
      {/* 제목 */}
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
  /* 공통 영역(헤더 + 수평선 + +버튼) -------------------------- */
  const SectionHeader = ({
    label,
    onAdd,
  }: {
    label: string;
    onAdd?: () => void;
  }) => (
    <>
      {/* 텍스트 + 플러스 버튼 (수평선 안에서 양쪽으로 정렬) */}
      <div className="flex items-center justify-between mb-1">
        <span className="font-semibold text-lg sm:text-xl">{label}</span>

        {onAdd && (
          <button
            onClick={onAdd}
            className="p-1 active:scale-95 transition"
          >
            <Cross size={22} />
          </button>
        )}
      </div>

      {/* 수평선 (너비 90%) */}
      <hr className="w-[90%] border-t-[1.5px] border-gray-600 mb-3" />
    </>
  );

  /* ---------------------------------------------------------- */
  return (
    <div className="flex flex-col gap-8 sm:hidden px-4 pt-4">
      {/* 상단 메인 제목 */}
      <h2 className="text-center font-serif text-5xl sm:text-4xl mb-4">Quest</h2>

      {/* ───── 내 퀘스트 ───── */}
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

      {/* ───── 파트너 퀘스트 ───── */}
      <section className="mt-8">
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