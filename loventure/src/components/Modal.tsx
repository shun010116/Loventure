"use client"

import { Dialog } from "@headlessui/react"
import { UserQuest, CoupleQuest, PartnerQuest } from "./Types";

import React, { Dispatch, SetStateAction } from "react";


const QUEST_CATEGORIES = ["All", "Daily", "Weekly"];
const COUPLE_CATEGORIES = ["All", "Daily", "Bucket"];
const RESET_OPTIONS = ["Daily", "Weekly", "One-time"];

{/*-------------------Quest Modal-------------------- */}
{/*-------------------User Quest Modal--------------------*/}
interface UserQuestModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingQuest: UserQuest | null;
  selectedDifficulty: number | null;
  setSelectedDifficulty: Dispatch<SetStateAction<number | null>>;
  saveQuest: (quest: Partial<UserQuest>) => void;
  deleteQuest: () => void;
}

export function UserQuestModal({
  isOpen,
  onClose,
  editingQuest,
  selectedDifficulty,
  setSelectedDifficulty,
  saveQuest,
  deleteQuest,
}: UserQuestModalProps) {
  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-md bg-white rounded-lg shadow p-6 max-h-[90vh] h-[600px] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Quest</h3>
            <div className="flex gap-2">
              <button onClick={onClose} className="text-red-500 hover:underline">Cancel</button>
              <button
                onClick={() => {
                  const form = document.forms.namedItem("questForm") as HTMLFormElement;
                  const title = (form.elements.namedItem("title") as HTMLInputElement).value;
                  const description = (form.elements.namedItem("notes") as HTMLTextAreaElement).value;
                  const goalType = (form.elements.namedItem("reset") as HTMLSelectElement).value;
                  const difficulty = selectedDifficulty ?? 1;
                  saveQuest({ title, description, goalType, difficulty });
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
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            {editingQuest && (
              <button type="button" onClick={deleteQuest} className="mt-4 text-sm text-red-500 hover:underline">
                Delete this Quest
              </button>
            )}
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
	


{/* ------------------- View Partner Quest Modal ------------------- */}
interface PartnerQuestModalProps {
  viewingPartnerQuest: PartnerQuest | null;
  onClose: () => void;
}

export function PartnerQuestModal({ viewingPartnerQuest, onClose }: PartnerQuestModalProps) {
  return (
    <Dialog open={!!viewingPartnerQuest} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-md bg-white rounded-lg shadow p-6 max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Partner Quest Details</h3>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">Close</button>
          </div>
          <div className="text-sm space-y-2">
            <div><span className="font-semibold">Title:</span> {viewingPartnerQuest?.title}</div>
            <div><span className="font-semibold">Goal Type:</span> {viewingPartnerQuest?.goalType || "-"}</div>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
	


{/*-------------------Couple Quest Modal-------------------- */}
interface CoupleQuestModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingCoupleQuest: CoupleQuest | null;
  saveCoupleQuest: (quest: Partial<CoupleQuest>) => void;
  deleteCoupleQuest: () => void;
}

export function CoupleQuestModal({
  isOpen,
  onClose,
  editingCoupleQuest,
  saveCoupleQuest,
  deleteCoupleQuest,
}: CoupleQuestModalProps) {
  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-md bg-white rounded-lg shadow p-6 max-h-[90vh] h-[600px] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Couple Quest</h3>
            <div className="flex gap-2">
              <button onClick={onClose} className="text-red-500 hover:underline">Cancel</button>
              <button
                onClick={() => {
                  const form = document.forms.namedItem("coupleQuestForm") as HTMLFormElement;
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
                defaultValue={editingCoupleQuest?.goalType?.toString() || "Daily"}
                className="border rounded px-2 py-1 w-full"
              >
                {RESET_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            {editingCoupleQuest && (
              <button type="button" onClick={deleteCoupleQuest} className="mt-4 text-sm text-red-500 hover:underline">
                Delete this Couple Quest
              </button>
            )}
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}


