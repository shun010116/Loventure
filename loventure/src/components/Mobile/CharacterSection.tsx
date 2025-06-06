// components/CharacterSection.tsx
import React from "react";

interface CharacterSectionProps {
  myEvents: { _id: string; title: string }[];
  partnerEvents: { _id: string; title: string }[];
}

export default function CharacterSection({ myEvents, partnerEvents }: CharacterSectionProps) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:hidden">
      {/* My Character */}
      <div className="bg-white rounded shadow p-4">
        <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-2" />
        <div className="text-center text-sm font-bold">My Name</div>
        <ul className="text-xs mt-2">
          {myEvents.length > 0 ? myEvents.map(e => <li key={e._id}>{e.title}</li>) : <li>No Events</li>}
        </ul>
      </div>

      {/* Partner Character */}
      <div className="bg-white rounded shadow p-4">
        <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-2" />
        <div className="text-center text-sm font-bold">Partner</div>
        <ul className="text-xs mt-2">
          {partnerEvents.length > 0 ? partnerEvents.map(e => <li key={e._id}>{e.title}</li>) : <li>No Events</li>}
        </ul>
      </div>
    </div>
  );
}