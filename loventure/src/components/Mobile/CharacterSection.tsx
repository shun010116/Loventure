// components/Mobile/CharacterSection.tsx
"use client";

import React from "react";
import { Character } from "@/components/Types";   // Character 타입 import

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
  return (
    <div className="grid grid-cols-2 gap-4">
      {/* 내 캐릭터 */}
      <div className="bg-white rounded shadow p-4">
        <img
          className="w-20 h-20 rounded-full mx-auto mb-2"
          src={
            myCharacter
              ? `/character/${myCharacter.evolutionStage}/${myCharacter.avatar}`
              : "/placeholder.png"
          }
          alt="my character"
        />
        <div className="text-center text-sm font-bold">
          {myCharacter?.name ?? "-"}
        </div>
        <ul className="mt-2 text-xs text-center">
          {myEvents.length
            ? myEvents.map((e) => <li key={e._id}>{e.title}</li>)
            : "No Events"}
        </ul>
      </div>

      {/* 파트너 캐릭터 */}
      <div className="bg-white rounded shadow p-4">
        <img
          className="w-20 h-20 rounded-full mx-auto mb-2"
          src={
            partnerCharacter
              ? `/character/${partnerCharacter.evolutionStage}/${partnerCharacter.avatar}`
              : "/placeholder.png"
          }
          alt="partner character"
        />
        <div className="text-center text-sm font-bold">
          {partnerCharacter?.name ?? "Partner"}
        </div>
        <ul className="mt-2 text-xs text-center">
          {partnerEvents.length
            ? partnerEvents.map((e) => <li key={e._id}>{e.title}</li>)
            : "No Events"}
        </ul>
      </div>
    </div>
  );
}