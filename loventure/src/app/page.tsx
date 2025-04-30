"use client"

import Image from "next/image";
import Link from 'next/link';
import { useState } from "react";
import { Dialog } from "@headlessui/react";
import { Plus } from "lucide-react";

import Calendar from "@/components/Calendar";

// 유저 퀘스트 타입 정의     ?는 optional을 의미
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

// 커플 퀘스트 타입 정의     ?는 optional을 의미
export type CoupleQuest = {
  _id: string;
  coupledId: string;
  title: string
  description?: string
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
}


// 파트너 퀘스트 타입 정의     ?는 optional을
export type PartnerQuest = {
  _id: string;
  title: string;
  goalType?: string; // "Daily" | "Weekly" 같은 카테고리
};

const QUEST_CATEGORIES = ["All", "Daily", "Weekly"];
const COUPLE_CATEGORIES = ["ALL", "Daily", "Bucket"]
const RESET_OPTIONS = ["Daily", "Weekly", "One-time"];

export default function Home() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingQuest, setEditingQuest] = useState<UserQuest | null>(null);
  const [quests, setQuests] = useState<UserQuest[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedDifficulty, setSelectedDifficulty] = useState<number | null>(null);

  const [coupleQuests, setCoupleQuests] = useState<CoupleQuest[]>([]);
  const [editingCoupleQuest, setEditingCoupleQuest] = useState<CoupleQuest | null>(null);
  const [isCoupleDialogOpen, setIsCoupleDialogOpen] = useState(false);
  const [selectedCoupleCategory, setSelectedCoupleCategory] = useState("All");

  const [partnerQuests, setPartnerQuest] = useState<UserQuest[]>([]);
  const [selectedPartnerCategory, setSelectedPartnerCategory] = useState("All");
  

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


  {/* Couple Quest 구간 */}
  const openNewCoupleQuestDialog = () => {
    setEditingCoupleQuest(null);
    setIsCoupleDialogOpen(true);
  };
  
  const openEditCoupleQuestDialog = (quest: CoupleQuest) => {
    setEditingCoupleQuest(quest);
    setIsCoupleDialogOpen(true);
  };
  
  const saveCoupleQuest = (quest: Partial<CoupleQuest>) => {
    if (editingCoupleQuest) {
      setCoupleQuests((prev) =>
        prev.map((q) =>
          q._id === editingCoupleQuest._id ? { ...q, ...quest } as CoupleQuest : q
        )
      );
    } else {
      const newQuest: CoupleQuest = {
        _id: Date.now().toString(),
        coupledId: "",
        title: quest.title || "",
        description: quest.description || "",
        goalType: quest.goalType || "",
        targetValue: quest.targetValue || 0,
        currentValue: 0,
        isCompleted: false,
        reward: {
          exp: 0,
          coins: 0,
        },
        createdBy: "",
        agreed: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        completedAt: undefined,
      };
      setCoupleQuests((prev) => [...prev, newQuest]);
    }
    setIsCoupleDialogOpen(false);
  };
  
  const deleteCoupleQuest = () => {
    if (editingCoupleQuest) {
      setCoupleQuests((prev) => prev.filter((q) => q._id !== editingCoupleQuest._id));
      setIsCoupleDialogOpen(false);
    }
  };
  
  const filteredCoupleQuests = 
    selectedCoupleCategory === "All"
      ? coupleQuests
      : coupleQuests.filter((q) => q.goalType === selectedCoupleCategory);




  {/* -------Partner Quest 구간------ */}
  const filteredPartnerQuests = selectedPartnerCategory == "All"
    ? partnerQuests
    : partnerQuests.filter( (q) => q.goalType === selectedPartnerCategory);
  


  {/*======================== 메인 페이지 상단 ============================= */}
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

      {/* ------------------------Quest Sections------------------------ */}
      <section className="grid grid-cols-3 gap-4">
        {/* --------------------User Quests------------------------ */}
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


        {/* Couple Quests */}
        <div className="bg-orange-100 rounded-xl p-4 col-span-1 h-[600px] overflow-y-auto">
            <div className="flex justify-end gap-4 mb-4">
              {COUPLE_CATEGORIES.map((category) => (
                <button
                  key = {category}
                  onClick = { () => setSelectedCoupleCategory(category) }
                  className = {`text-sm font-medium pb-1 border-b-2 transition-colors ${
                    selectedCoupleCategory === category
                      ? "text-orange-500 border-orange-500"
                      : "text-gray-400 border-transparent"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
        
            {/* Add Couple Quest Button */}
            <div className="flex justify-center mb-2">
              <button
                onClick = {openNewCoupleQuestDialog}
                  className="w-10 h-10 bg-orange-500 textwhite rounded-full flex items-center justify-center hover:scale-105 transition"
              >
               <Plus size={24}/>
              </button>
            </div>

            {/* Couple Quest List */}
            <ul className="space-y-[2px]">
              {filteredCoupleQuests.map( (quest) => (
                <li
                  key={quest._id}
                  onClick = { () => openEditCoupleQuestDialog(quest)}
                  className="bg-white hover:bg-orange-200 px-4 py-4 rounded shadow-sm cursor-pointer "
                >
                  <div className="text-base font-medium">{quest.title}</div>
                </li>
              ))}
              {filteredCoupleQuests.length === 0 && (
                <li className="text-center text-gray-400 py-4">
                  No couple quests yet
                </li>
              )}
            </ul>
        </div> {/* -------------couple quest end----------- */}




        {/* Partner Quest */}
          <div className="bg-purple-100 rounded-xl p-4 col-span-1 h-[600px] overflow-y-auto">
            <div className="flex justify-end gap-4 mb-4">
              {QUEST_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedPartnerCategory(cat)}
                  className={`text-sm font-medium pb-1 border-b-2 transition-colors ${
                    selectedPartnerCategory === cat
                      ? "text-purple-500 border-purple-500"
                      : "text-gray-400 border-transparent"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <ul className="space-y-[2px]">
              {filteredPartnerQuests.map((quest) => (
                <li
                  key={quest._id}
                  className="bg-white hover:bg-purple-200 px-4 py-4 rounded shadow-sm"
                >
                  <div className="text-base font-medium">{quest.title}</div>
                </li>
              ))}
              {filteredPartnerQuests.length === 0 && (
                <li className="text-center text-gray-400 py-4">No partner quests yet</li>
              )}
            </ul>
          </div>
    
      </section>
      {/* Quest창 end 부분 */}
      
      {/* ------------------------일정 공유 달력---------------------------  */}
      <section className="mt-8">
        <div className="rounded-lg p-4 w-full max-w-4xl mx-auto overflow-hidden">
          <Calendar editable={false} compact={true} />
        </div>
        
      </section>


      {/*-------------------Quest Modal-------------------- */}
      {/*-------------------Uset Quest Modal-------------------- */}
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

      


      {/*-------------------Couple Quest Modal-------------------- */}
      <Dialog open = { isCoupleDialogOpen } onClose = { () => setIsCoupleDialogOpen(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true"/>
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-md bg-white rounded-lg shadow p-6 max-6-[90vh] h-[600px] overflow-y-auto">
            <div className="flex justify-between items-center mb-4"> 
              <h3 className="text-lg font-semibold">Couple Quest</h3>
              <div className="flex gap-2">
                <button
                  onClick = { () => setIsCoupleDialogOpen(false)}
                  className="text-red-500 hover:underline"
                >
                  Cancel
                </button>
                <button
                  onClick = { ()  => {
                    const form = document.forms.namedItem("coupleQuestForm") as HTMLFormElement;
                    if (!form) {
                      console.error("잘못된 Form입니다.");
                      return;
                    }

                    const title = (form.elements.namedItem("title") as HTMLInputElement).value;
                    const description = (form.elements.namedItem("notes") as HTMLTextAreaElement).value;
                    const goalType = (form.elements.namedItem("reset") as HTMLSelectElement).value;

                    saveCoupleQuest({ title, description, goalType });
                  }}
                  className="text-orange-600 font-semibold hover:underline"
                >
                  Save
                </button>
              </div>
            </div>

            <form name="coupleQuestForm" className="flex flex-col gap-3">
              <input
                name="title"
                placeholder="Title"
                defaultValue={editingCoupleQuest?.title || ""}
                className="border rounded px-2 py-1"
              />
              <textarea
                name="notes"
                placeholder="Notes"
                defaultValue={editingCoupleQuest?.description || ""}
                className="border rounded px-2 py-1"
              />

              <div>
                <label className="block mb-1">Reset Counter</label>
                <select
                  name="reset"
                  defaultValue={editingCoupleQuest?.goalType || "Daily"}
                  className="border rounded px-2 py-1 w-full"
                >
                  {RESET_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              {editingCoupleQuest && (
                <button
                  type="button"
                  onClick={deleteCoupleQuest}
                  className="mt-4 text-sm text-red-500 hover:underline"
                >
                  Delete this Couple Quest
                </button>
              )}
            </form>
          </Dialog.Panel>
        </div>
      </Dialog>
    </main>
  );
}