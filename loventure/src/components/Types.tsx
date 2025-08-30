// src/types/Types.ts

export type TabKey = "character" | "quest" | "couple" | "calendar" | "diary" | null;

export interface Schedule {
  _id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  repeat: string;
  isCompleted: boolean;
  createdBy: string;
  participants: string[];
  sticker: string;
}

export interface UserQuest {
  _id: string;
  userId: string;
  createdBy: string;
  title: string;
  description?: string;
  difficulty?: number;
  goalType?: string;
  resetType?: "Daily" | "Weekly" | "One-time";
  targetValue?: number;
  currentValue?: number;
  reward: {
    exp: number;
    gold: number;
  };
  needApproval: boolean;
  status: "pending" | "accepted" | "rejected" | "completed" | "approved";
  completedAt?: string;
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CoupleQuest {
  _id: string;
  coupleId: string;
  createdBy: string;
  title: string;
  description?: string;
  goalType?: string;
  resetType?: "Daily" | "Weekly" | "One-time";
  targetValue?: number;
  progress: {
    [userId: string]: number;
  };
  reward: {
    exp: number;
    gold: number;
  };
  status: "active" | "completed";
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Character {
  _id: string;
  name: string;
  level: number;
  exp: number;
  evolutionStage: number;
  coins: number;
  avatar: string;
  statusMessage: string;
}