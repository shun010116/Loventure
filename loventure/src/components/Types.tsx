// src/types/Types.ts

export type TabKey = "character" | "quest" | "couple" | "calendar" | "diary";

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
}

export interface UserQuest {
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
}

export interface CoupleQuest {
  _id: string;
  coupleId: string;
  title: string;
  description?: string;
  goalType?: string;
  isComple?: string;
  targetValue?: number;
  currentVted: boolean;
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

export interface PartnerQuest {
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
}