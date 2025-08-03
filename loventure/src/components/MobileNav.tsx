// components/Layouts/MobileNav.tsx
"use client";

import { useEffect } from "react";
import { Home, ListTodo, Heart, Calendar, BookHeart } from "lucide-react";
// import { useRouter } from "next/navigation";
import Link from 'next/link';

import { TabKey } from "./Types";

interface MobileNavProps {
  activeTab: TabKey;
  setActiveTab: (tab: TabKey) => void;
}

export default function MobileNav({ activeTab, setActiveTab }: MobileNavProps) {
  // const router = useRouter();

  useEffect(() => {
    document.body.style.paddingBottom = "64px";
    return () => {
      document.body.style.paddingBottom = "0px";
    };
  }, []);

  const items = [
    { key: "character", icon: <Home size={24} /> },
    { key: "quest", icon: <ListTodo size={24} /> },
    { key: "couple", icon: <Heart size={24} /> },
    { key: "calendar", icon: <Calendar size={24} /> },
    { key: "diary", icon: <BookHeart size={24} /> },
  ];

  return (
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t shadow z-50">
      <ul className="flex justify-around items-center h-16">
        {items.map((item) => (
          <li key={item.key}>
            <button
              onClick={() => {
                /* --- 탭 방식 --- */
                setActiveTab(item.key as TabKey);

                /* --- 페이지 이동 방식 (원하면 주석 해제) ---
                if (it.key === "diary") router.push("/diary");
                --------------------------------------------*/
              }}
              className={`flex flex-col items-center justify-center w-16 h-full ${activeTab === item.key ? "text-blue-600" : "text-gray-400"}`}
            >
              {item.icon}
            </button>

          </li>
        ))}
      </ul>
    </nav>
  );
}