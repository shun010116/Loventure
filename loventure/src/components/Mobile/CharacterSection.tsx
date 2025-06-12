"use client";

import React from "react";
import { Character } from "@/components/Types";

interface CharacterSectionProps {
  myCharacter: Character | null;
  partnerCharacter: Character | null;
  myEvents: { _id: string; title: string }[];
  partnerEvents: { _id: string; title: string }[];
}

export default function CharacterSection({
  myCharacter,
  partnerCharacter,
  myEvents,
  partnerEvents,
}: CharacterSectionProps) {
  /* 공통 카드 렌더 */
  const renderCard = (
    char: Character | null,
    fallback: string,
    events: { _id: string; title: string }[]
  ) => (
    <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center">
      {/* 👇 이미지를 동그라미 대신 카드 폭 전체로 표시 */}
      <img
        src={
          char
            ? `/character/${char.evolutionStage}/${char.avatar}`
            : "/placeholder.png"
        }
        alt="avatar"
        className="w-full h-40 object-contain mb-4"  /* object-contain → 비율 유지, 잘림 X */
      />

      <div className="text-base font-bold">{char?.name ?? fallback}</div>
      <div className="text-xs mb-2">
        Lv.&nbsp;{char?.level ?? "-"} / EXP&nbsp;{char?.exp ?? 0}
      </div>

      <ul className="text-xs text-center break-keep">
        {events.length
          ? events.map((e) => <li key={e._id}>{e.title}</li>)
          : "No Events"}
      </ul>
    </div>
  );

  return (
    <div className="grid grid-cols-2 gap-4">
      {renderCard(myCharacter, "My Character", myEvents)}
      {renderCard(partnerCharacter, "Partner", partnerEvents)}
    </div>
  );
}