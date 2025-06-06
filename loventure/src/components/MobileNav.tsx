// components/MobileNav.tsx
"use client";

import { useEffect } from "react";
import { Home, ListTodo, Heart, Calendar } from "lucide-react";

interface MobileNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function MobileNav({ activeTab, setActiveTab }: MobileNavProps) {
  // prevent background scroll when nav active (optional)
  useEffect(() => {
    document.body.style.paddingBottom = "64px"; // bottom nav height
    return () => {
      document.body.style.paddingBottom = "0px";
    };
  }, []);

  const items = [
    { key: "character", icon: <Home size={24} /> },
    { key: "quest", icon: <ListTodo size={24} /> },
    { key: "couple", icon: <Heart size={24} /> },
    { key: "calendar", icon: <Calendar size={24} /> },
  ];

  return (
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t shadow z-50">
      <ul className="flex justify-around items-center h-16">
        {items.map((item) => (
          <li key={item.key}>
            <button
              onClick={() => setActiveTab(item.key)}
              className={`flex flex-col items-center justify-center w-16 h-full ${
                activeTab === item.key ? "text-blue-600" : "text-gray-400"
              }`}
            >
              {item.icon}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}