"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";

export type UserQuest = {
  _id: string;
  userId: string;
  assignedBy: string;
  title: string;
  description?: string;
  goalType?: string;
  difficulty?: number;
  targetValue?: number;
  currentValue?: number;
  isCompleted: boolean;
  reward: {
    exp: number;
    coins: number;
  };
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type CoupleQuest = {
  _id: string;
  coupleId: string;
  title: string;
  description?: string;
  goalType?: string;
  targetValue?: number;
  currentValue?: number;
  isCompleted: boolean;
  reward: {
    exp: number;
    coins: number;
  };
  createdBy: string;
  agreed: boolean;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
};

const QUEST_CATEGORIES = ["All", "Daily", "Weekly"];
const COUPLE_CATEGORIES = ["All", "Daily", "Bucket"];
const RESET_OPTIONS = ["Daily", "Weekly", "One-time"];

export default function Home() {
  const { user, loading, isLoggedIn } = useAuth();
  const [quests, setQuests] = useState<UserQuest[]>([]);
  const [coupleQuests, setCoupleQuests] = useState<CoupleQuest[]>([]);
  const [partnerQuests, setPartnerQuests] = useState<UserQuest[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedCoupleCategory, setSelectedCoupleCategory] = useState("All");

  const fetchAllQuests = async () => {
    try {
      const res = await fetch("/api/allQuests");
      const data = await res.json();
      if (res.ok && data.data) {
        setQuests(data.data.userQuests || []);
        setCoupleQuests(data.data.coupleQuests || []);
        setPartnerQuests(data.data.partnerQuests || []);
      }
    } catch (err) {
      console.error("Error fetching quests:", err);
    }
  };

  useEffect(() => {
    if (!loading && isLoggedIn) {
      fetchAllQuests();
    }
  }, [loading, isLoggedIn]);

  const filteredQuests =
    selectedCategory === "All"
      ? quests
      : quests.filter((q) => q.goalType === selectedCategory);

  const filteredCoupleQuests =
    selectedCoupleCategory === "All"
      ? coupleQuests
      : coupleQuests.filter((q) => q.goalType === selectedCoupleCategory);

  return (
    <main className="min-h-screen bg-cream text-gray-800 p-4">
      <section className="grid grid-cols-3 gap-4">
        <div className="bg-blue-50 rounded-xl p-4 col-span-1 h-[600px] overflow-y-auto">
          <div className="flex justify-end gap-4 mb-4">
            {QUEST_CATEGORIES.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`text-sm font-medium pb-1 border-b-2 transition-colors ${
                  selectedCategory === category ? "text-blue-500 border-blue-500" : "text-gray-400 border-transparent"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
          <ul className="space-y-[2px]">
            {filteredQuests.length === 0 ? (
              <li className="text-center text-gray-400 py-4">No quests yet</li>
            ) : (
              filteredQuests.map((quest) => (
                <li key={quest._id} className="bg-orange-100 px-4 py-4 rounded shadow-sm">
                  <div className="text-base font-medium">{quest.title}</div>
                </li>
              ))
            )}
          </ul>
        </div>

        <div className="bg-orange-100 rounded-xl p-4 col-span-1 h-[600px] overflow-y-auto">
          <div className="flex justify-end gap-4 mb-4">
            {COUPLE_CATEGORIES.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCoupleCategory(category)}
                className={`text-sm font-medium pb-1 border-b-2 transition-colors ${
                  selectedCoupleCategory === category ? "text-orange-500 border-orange-500" : "text-gray-400 border-transparent"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
          <ul className="space-y-[2px]">
            {filteredCoupleQuests.length === 0 ? (
              <li className="text-center text-gray-400 py-4">No couple quests yet</li>
            ) : (
              filteredCoupleQuests.map((quest) => (
                <li key={quest._id} className="bg-white px-4 py-4 rounded shadow-sm">
                  <div className="text-base font-medium">{quest.title}</div>
                </li>
              ))
            )}
          </ul>
        </div>

        <div className="bg-green-100 rounded-xl p-4 col-span-1 h-[600px] overflow-y-auto">
          <div className="mb-4 text-sm font-medium border-b pb-1">Partner's Quests</div>
          <ul className="space-y-[2px]">
            {partnerQuests.length === 0 ? (
              <li className="text-center text-gray-400 py-4">No partner quests</li>
            ) : (
              partnerQuests.map((quest) => (
                <li key={quest._id} className="bg-green-50 px-4 py-4 rounded shadow-sm">
                  <div className="text-base font-medium">{quest.title}</div>
                </li>
              ))
            )}
          </ul>
        </div>
      </section>
    </main>
  );
}