import Image from "next/image";
import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-cream text-gray-800 p-4">
      {/* Header */}
      <header className="flex justify-between items-center border-b pb-2 mb-4">
        <h1 className="text-2xl font-bold">Loventure</h1>
        <div className="relative">
          <Link href="/login"> Login </Link>
          <button className="text-xl">🔔</button>
          <span className="absolute -top-1 -right-1 text-xs text-red-500 font-bold">0</span>
        </div>
      </header>

      {/* Characters Section */}
      <section className="grid grid-cols-3 gap-4 mb-6">
        <div className="flex flex-col gap-2 items-start">
          <input type="text" placeholder="나의 상태 메시지" className="w-full rounded px-2 py-1 border" />
          <input type="text" placeholder="오늘의 기분" className="w-full rounded px-2 py-1 border" />
        </div>

        <div className="flex flex-col items-center gap-1">
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-pink-200 rounded-md" />
              <div className="text-sm">My Character</div>
              <div className="text-xs">LV. ?</div>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-200 rounded-md" />
              <div className="text-sm">Partner's Character</div>
              <div className="text-xs">LV. ?</div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 items-end">
          <input type="text" placeholder="상대 상태 메시지" className="w-full rounded px-2 py-1 border" />
          <input type="text" placeholder="상대 기분" className="w-full rounded px-2 py-1 border" />
        </div>
      </section>

      {/* Quests Section */}
      <section className="grid grid-cols-3 gap-4 mb-6">
        {/* Daily / Weekly */}
        <div>
          <div className="flex gap-2 mb-2">
            <button className="px-3 py-1 bg-gray-200 rounded">Daily</button>
            <button className="px-3 py-1 bg-gray-200 rounded">Weekly</button>
          </div>
          <ul className="bg-white rounded shadow p-2">
            {[1, 2, 3].map(i => (
              <li key={i} className="py-1">● Quest {i}</li>
            ))}
          </ul>
        </div>

        {/* Couple Quests */}
        <div>
          <h2 className="text-lg font-semibold mb-2">Couple Quests</h2>
          <ul className="bg-white rounded shadow p-2">
            {[1, 2, 3].map(i => (
              <li key={i} className="py-1">● Couple Quest {i}</li>
            ))}
          </ul>
        </div>

        {/* Partner's Quests */}
        <div>
          <h2 className="text-lg font-semibold mb-2">Partner's Quests</h2>
          <ul className="bg-white rounded shadow p-2">
            {[1, 2, 3].map(i => (
              <li key={i} className="py-1 flex justify-between items-center">
                <span>● Quest {i}</span>
                <span>✅ ❌</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Calendar */}
      <section>
        <h2 className="text-lg font-semibold mb-2">Calendar</h2>
        <div className="bg-white h-64 rounded shadow flex items-center justify-center">
          <span className="text-gray-400">(Calendar Placeholder)</span>
        </div>
      </section>
    </main>

  );
}
