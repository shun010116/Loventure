"use client";

import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { CirclePlus, Trash2 } from "lucide-react";
import { UserQuest, PartnerQuest, CoupleQuest } from "@/components/Types";


/** 세 퀘스트 모두 허용하는 유니온 타입  */
type AnyQuest = UserQuest | PartnerQuest | CoupleQuest;


interface Props {
  type: "user" | "partner" | "couple";   // ★ 모드 결정
  isOpen: boolean;
  onClose: () => void;

  editingQuest: AnyQuest | null;
  saveQuest:   (q: Partial<AnyQuest>) => void;
  deleteQuest: () => void;

  /* User 전용 필드 */
  selectedDifficulty?: number | null;
  setSelectedDifficulty?: (n: number | null) => void;
}

export default function MobileModal({
  type,
  isOpen,
  onClose,
  editingQuest,
  saveQuest,
  deleteQuest,
  selectedDifficulty,
  setSelectedDifficulty,
}: Props) {
  /* 설정값 분기 */
  const showDifficulty = type === "user" || type === "partner";
  const titleLabel =
    type === "user"
      ? editingQuest ? "유저 퀘스트 수정" : "새 유저 퀘스트"
      : type === "partner"
      ? editingQuest ? "연인 퀘스트 수정" : "새 연인 퀘스트"
      : editingQuest ? "커플 퀘스트 수정" : "새 커플 퀘스트";

  /* form submit */
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const title = (form.elements.namedItem("title") as HTMLInputElement).value;
    const description = (
      form.elements.namedItem("notes") as HTMLTextAreaElement
    ).value;
    const goalType = (form.elements.namedItem("reset") as HTMLSelectElement)
      .value;

    saveQuest({
      title,
      description,
      goalType,
      ...(showDifficulty && { difficulty: selectedDifficulty ?? 1 }),
    } as Partial<AnyQuest>);
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" onClose={onClose} className="relative z-50">
        {/* 백드롭 */}
        <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
          <div className="fixed inset-0 bg-black/30" />
        </Transition.Child>

        {/* 하단 시트 */}
        <div className="fixed inset-x-0 bottom-0 flex items-end sm:items-center sm:justify-center">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="translate-y-full sm:translate-y-0 sm:scale-95 opacity-0"
            enterTo="translate-y-0 sm:scale-100 opacity-100"
            leave="ease-in duration-200"
            leaveFrom="translate-y-0 sm:scale-100 opacity-100"
            leaveTo="translate-y-full sm:translate-y-0 sm:scale-95 opacity-0"
          >
            <Dialog.Panel className="bg-white shadow p-6 overflow-y-auto fixed bottom-0 inset-x-0 h-[85vh] rounded-t-2xl sm:static sm:rounded-lg sm:max-w-md">
              {/* 헤더 */}
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">{titleLabel}</h2>
                <button onClick={onClose} className="text-sm text-gray-500">
                  닫기
                </button>
              </div>

              {/* 폼 */}
              <form
                className="flex flex-col gap-4"
                name="questForm"
                onSubmit={handleSubmit}
              >
                <input
                  name="title"
                  defaultValue={editingQuest?.title ?? ""}
                  placeholder="제목"
                  className="border rounded-lg px-3 py-2 text-base"
                  required
                />

                <textarea
                  name="notes"
                  rows={4}
                  defaultValue={editingQuest?.description ?? ""}
                  placeholder="설명"
                  className="border rounded-lg px-3 py-2"
                />

                {/* 난이도 (유저 퀘스트만) */}
                {showDifficulty && (
                  <div>
                    <label className="block mb-1 text-sm">난이도</label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <button
                          key={n}
                          type="button"
                          onClick={() => setSelectedDifficulty?.(n)}
                          className={`flex-1 py-2 rounded-full ${
                            selectedDifficulty === n
                              ? "bg-blue-600 text-white"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {n}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 리셋 주기 */}
                <div>
                  <label className="block mb-1 text-sm">리셋 주기</label>
                  <select
                    name="reset"
                    defaultValue={
                      (editingQuest as any)?.goalType ?? "Daily"
                    }
                    className="border rounded-lg px-3 py-2 w-full"
                  >
                    {["Daily", "Weekly", "One-time"].map((opt) => (
                      <option key={opt}>{opt}</option>
                    ))}
                  </select>
                </div>

                {/* 하단 버튼 */}
                <div className="pt-4 flex justify-between">
                  {editingQuest ? (
                    <button
                      type="button"
                      onClick={deleteQuest}
                      className="flex items-center gap-1 text-red-500"
                    >
                      <Trash2 size={18} />
                      삭제
                    </button>
                  ) : (
                    <span />
                  )}

                  <button
                    type="submit"
                    className="flex items-center gap-1 bg-blue-600 text-white px-4 py-2 rounded-lg active:scale-95"
                  >
                    <CirclePlus size={18} />
                    저장
                  </button>
                </div>
              </form>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}