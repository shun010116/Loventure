"use client"

import Image from "next/image";
import Link from 'next/link';
import { useState } from "react";
import { Dialog } from "@headlessui/react";
import { Plus } from "lucide-react";

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

const QUEST_CATEGORIES = ["All", "Daily", "Weekly"];
const RESET_OPTIONS = ["Daily", "Weekly", "One-time"];

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingQuest, setEditingQuest] = useState<UserQuest | null>(null);
  const [quests, setQuests] = useState<UserQuest[]>([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState<number | null>(null);

  const openNewQuestDialog = () => {
    setEditingQuest(null);
    setSelectedDifficulty(null);
    setIsDialogOpen(true);
  };

  const openEditQuestDialog = (quest: UserQuest) => {
    setEditingQuest(quest);
    setSelectedDifficulty(quest.difficulty ?? null);
    setIsDialogOpen(true);
  };

  const saveQuest = (quest: Partial<UserQuest>) => {
    if (editingQuest) {
      setQuests((prev) =>
        prev.map((q) => (q._id === editingQuest._id ? { ...q, ...quest } as UserQuest : q))
      );
    } else {
      const newQuest: UserQuest = {
        _id: Date.now().toString(),
        userId: "",
        assignedBy: "",
        title: quest.title || "",
        description: quest.description || "",
        goalType: quest.goalType || "",
        difficulty: quest.difficulty || 1,
        targetValue: quest.targetValue || 0,
        currentValue: 0,
        isCompleted: false,
        reward: {
          exp: 0,
          coins: 0,
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        completedAt: undefined,
      };
      setQuests((prev) => [...prev, newQuest]);
    }
    setIsDialogOpen(false);
  };

  const deleteQuest = () => {
    if (editingQuest) {
      setQuests((prev) => prev.filter((q) => q._id !== editingQuest._id));
      setIsDialogOpen(false);
    }
  };

  const filteredQuests =
    selectedCategory === "All"
      ? quests
      : quests.filter((q) => q.goalType === selectedCategory);

  return (
    <main className="min-h-screen bg-cream text-gray-800 p-4">
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

      {/* Quest Sections */}
      <section className="grid grid-cols-3 gap-4">
        {/* User Quests */}
        <div className="bg-blue-50 rounded-xl p-4 col-span-1 h-[600px] overflow-y-auto">
          <div className="flex justify-end gap-4 mb-4">
            {QUEST_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`text-sm font-medium pb-1 border-b-2 transition-colors ${
                  selectedCategory === cat ? "text-blue-500 border-blue-500" : "text-gray-400 border-transparent"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Add Quest Button */}
          <div className="flex justify-center mb-2">
            <button
              onClick={openNewQuestDialog}
              className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center hover:scale-105 transition"
            >
              <Plus size={24} />
            </button>
          </div>

          {/* Quest List */}
          <ul className="space-y-[2px]">
            {filteredQuests.map((quest) => (
              <li
                key={quest._id}
                onClick={() => openEditQuestDialog(quest)}
                className="bg-orange-100 hover:bg-orange-200 px-4 py-4 rounded shadow-sm cursor-pointer"
              >
                <div className="text-base font-medium">{quest.title}</div>
              </li>
            ))}
            {filteredQuests.length === 0 && (
              <li className="text-center text-gray-400 py-4">No quests yet</li>
            )}
          </ul>
        </div>

        {/* Couple Quests & Partner Quests 자리 비움 */}
        <div className="col-span-2 bg-gray-100 rounded-xl p-4 flex items-center justify-center text-gray-400">
          (Couple & Partner Quests 영역)
        </div>
      </section>

      {/* Quest Modal */}
      <Dialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-md bg-white rounded-lg shadow p-6 max-h-[90vh] h-[600px] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Quest</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setIsDialogOpen(false)}
                  className="text-red-500 hover:underline"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    const form = document.forms.namedItem("questForm") as HTMLFormElement;
                    const title = (form.elements.namedItem("title") as HTMLInputElement).value;
                    const description = (form.elements.namedItem("notes") as HTMLTextAreaElement).value;
                    const difficulty = selectedDifficulty ?? 1;
                    const goalType = (form.elements.namedItem("reset") as HTMLSelectElement).value;

                    saveQuest({ title, description, difficulty, goalType });
                  }}
                  className="text-blue-600 font-semibold hover:underline"
                >
                  Save
                </button>
              </div>
            </div>

            <form name="questForm" className="flex flex-col gap-3">
              <input
                name="title"
                placeholder="Title"
                defaultValue={editingQuest?.title || ""}
                className="border rounded px-2 py-1"
              />
              <textarea
                name="notes"
                placeholder="Notes"
                defaultValue={editingQuest?.description || ""}
                className="border rounded px-2 py-1"
              />

              <div>
                <label className="block mb-1">Difficulty</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setSelectedDifficulty(star)}
                      className={`w-8 h-8 rounded-full border flex items-center justify-center text-sm transition-colors ${
                        selectedDifficulty === star ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {star}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block mb-1">Reset Counter</label>
                <select
                  name="reset"
                  defaultValue={editingQuest?.goalType || "Daily"}
                  className="border rounded px-2 py-1 w-full"
                >
                  {RESET_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              {editingQuest && (
                <button
                  type="button"
                  onClick={deleteQuest}
                  className="mt-4 text-sm text-red-500 hover:underline"
                >
                  Delete this Quest
                </button>
              )}
            </form>
          </Dialog.Panel>
        </div>
      </Dialog>
    </main>
  );
}