"use client";

import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { CirclePlus, Trash2 } from "lucide-react";
import { UserQuest, CoupleQuest } from "@/components/Types";

/** 두 퀘스트 모두 허용하는 유니온 타입  */
type AnyQuest = UserQuest | CoupleQuest;

interface Props {
  type: "user" | "partner" | "couple";   // ★ 모드 결정
  isOpen: boolean;
  onClose: () => void;

  editingQuest: AnyQuest | null;
  currentUserId: string | null;
  saveQuest:                  (q: Partial<AnyQuest>) => void;
  deleteQuest:                () => void;
  completeQuest:              () => void;
  acceptUserQuest:            () => void;
  rejectUserQuest:            () => void;
  approveUserQuest:           () => void;

  /* User 전용 필드 */
  selectedDifficulty?: number | null;
  setSelectedDifficulty?: (n: number | null) => void;
  checkApproval?: boolean | null;

  selectedGoalType?: string;
  setSelectedGoalType?: (type: string) => void;
  handleChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

export default function MobileModal({
  type,
  isOpen,
  onClose,
  editingQuest,
  currentUserId,
  saveQuest,
  deleteQuest,
  completeQuest,
  acceptUserQuest,
  rejectUserQuest,
  approveUserQuest,
  selectedDifficulty,
  setSelectedDifficulty,
  selectedGoalType,
  setSelectedGoalType,
  handleChange,
}: Props) {
  const isUserOrPartner = type === "user" || type === "partner";
  const userQuest = isUserOrPartner ? (editingQuest as UserQuest) : null;
  const coupleQuest = type === "couple" ? (editingQuest as CoupleQuest) : null;

  const isPerformer = userQuest?.userId === currentUserId;
  const isCreator = editingQuest?.createdBy === currentUserId;

  const goalTypeOptions = {
    user: [
      { value: "check", label: "달성만 하면 완료" },
      { value: "count", label: "횟수 채우기" },
    ],
    partner: [
      { value: "check", label: "체크만 하면 완료" },
      { value: "count", label: "횟수 채우기" },
    ],
    couple: [
      { value: "shared-count", label: "둘이서 함께" },
      { value: "both-complete", label: "같은 목표 이루기 " },
    ],
  };

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
    const goalType = (form.elements.namedItem("goalType") as HTMLSelectElement).value;
    const targetValue = (form.elements.namedItem("targetValue") as HTMLInputElement | null)?.valueAsNumber ?? 1;
    const resetType = (form.elements.namedItem("reset") as HTMLSelectElement)
      .value;
    const gold = type === "partner"
      ? (form.elements.namedItem("gold") as HTMLInputElement).valueAsNumber
      : 0; // * 임시로 0으로 설정, 필요시 수정
    const needApproval = type !== "couple"
      ? (form.elements.namedItem("approval") as HTMLInputElement).checked
      : false;

    const questData: Partial<AnyQuest> = {
      title,
      description,
      goalType,
      targetValue,
      resetType: resetType as "Daily" | "Weekly" | "One-time",
      reward: {
        exp: 0, // ★ 임시로 0으로 설정, 필요시 수정
        gold
      },
      ...(isUserOrPartner && { difficulty: selectedDifficulty ?? 1, needApproval }),
    };
    
    saveQuest(questData);
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

                {/* goalType 설정 */}
                <div>
                  <label className="block mb-1 text-sm">목표 유형</label>
                  <select
                    name="goalType"
                    onChange={handleChange}
                    defaultValue={(editingQuest as any)?.goalType ?? goalTypeOptions[type][0].value}
                    className="border rounded-lg px-3 py-2 w-full"
                  >
                    {goalTypeOptions[type].map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* targetValue 설정 */}
                {["count", "shared-count", "both-complete"].includes(selectedGoalType ?? "") && (
                  <div>
                    <label className="block mb-1 text-sm">목표값</label>
                    <input
                      type="number"
                      name="targetValue"
                      defaultValue={editingQuest?.targetValue ?? 1 }
                      placeholder="목표값"
                      className="border rounded-lg px-3 py-2 w-full"
                    />
                  </div>
                )}

                {/* 난이도 (유저 퀘스트만) */}
                {isUserOrPartner && (
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
                      (editingQuest as any)?.resetType ?? "Daily"
                    }
                    className="border rounded-lg px-3 py-2 w-full"
                  >
                    {["Daily", "Weekly", "One-time"].map((opt) => (
                      <option key={opt}>{opt}</option>
                    ))}
                  </select>
                </div>

                {/* 상대방에게 퀘스트를 생성해줄 때만 사용 (보상 설정용) */}
                {(!editingQuest || editingQuest?.status !== "completed") && type === "partner" && (
                  <div>
                    <label className="block mb-1 text-sm">파트너에게 줄 보상 설정</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        name="gold"
                        defaultValue={editingQuest?.reward?.gold ?? 0}
                        placeholder="gold"
                        className="border rounded-lg px-3 py-2 w-full"
                      />
                    </div>
                  </div>
                )}

                {/* 승인 필요 여부 */}
                {isUserOrPartner && (
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="approval"
                      defaultChecked={userQuest?.needApproval ?? false }
                    />
                      <label className="text-sm text-gray-700">퀘스트 완료 시 파트너의 승인이 필요</label>
                  </div>
                )}

                {/* 상태별 버튼 */}
                {editingQuest?.status === "pending" && isPerformer && (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={acceptUserQuest}
                      className="flex-1 bg-green-500 text-white px-4 py-2 rounded-lg active:scale-95"
                    >
                      수락
                    </button>
                    <button
                      type="button"
                      onClick={rejectUserQuest}
                      className="flex-1 bg-red-500 text-white px-4 py-2 rounded-lg active:scale-95"
                    >
                      거절
                    </button>
                  </div>
                )}

                {editingQuest?.status === "accepted" && isPerformer && (
                  <button
                    type="button"
                    onClick={completeQuest}
                    className="flex items-center gap-1 text-green-500"
                  >
                    완료
                  </button>
                )}

                {(editingQuest?.status === "pending" || editingQuest?.status === "accepted") && isCreator && (
                  <button
                    type="button"
                    onClick={deleteQuest}
                    className="flex items-center gap-1 text-red-500"
                  >
                    <Trash2 size={18} />
                    삭제
                  </button>
                )}

                {editingQuest?.status === "completed" && isPerformer && (
                  <span
                    className="text-sm text-gray-500"
                  >
                    파트너 승인 대기 중...
                  </span>
                )}

                {editingQuest?.status === "completed" && !isPerformer && (
                  <div
                    className="flex gap-2"
                  >
                    <button
                      type="button"
                      onClick={approveUserQuest}
                      className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg active:scale-95"
                    >
                      승인
                    </button>
                    <button
                      type="button"
                      onClick={rejectUserQuest}
                      className="flex-1 bg-red-500 text-white px-4 py-2 rounded-lg active:scale-95"
                      >
                        반려
                      </button>
                  </div>
                )}

                {editingQuest?.status === "rejected" && (
                  <span className="text-sm text-red-500">
                    거절됨
                  </span>
                )}

                {/* 하단 버튼 */}
                {(!editingQuest || isCreator) && (
                  <div className="pt-4 flex justify-between">
                    <button
                      type="submit"
                      className="flex items-center gap-1 bg-blue-600 text-white px-4 py-2 rounded-lg active:scale-95"
                    >
                      <CirclePlus size={18} />
                      저장
                    </button>
                  </div>
                )}
              </form>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}