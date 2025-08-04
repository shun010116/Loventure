import mongoose, { Schema, Document } from "mongoose";

export interface IUserQuest extends Document {
    userId: mongoose.Types.ObjectId, // who the quest is assigned to
    createdBy: mongoose.Types.ObjectId; // who created the quest ( userId or partnerId )
    title: string;
    description?: string;
    difficulty: number; // 1 ~ 5
    goalType: "check" | "count";
    resetType: "Daily" | "Weekly" | "One-time";
    targetValue: number; // For "count" goalType
    currentValue: number; // For "count" goalType, current progress

    reward: {
        exp: number;
        gold: number;
    };
    
    needApproval: boolean; // Whether the quest needs approval after completion
    status: "pending" | "accepted" | "rejected" | "completed" | "approved";

    completedAt?: Date;
    approvedAt?: Date;
}

const userQuestSchema = new Schema<IUserQuest>({
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },

    title: { type: String, required: true },
    description: String,

    difficulty: { type: Number, default: 1 },
    goalType: { type: String, enum: ["check", "count"], default: "check" },
    resetType: { type: String, enum: ["Daily", "Weekly", "One-time"], default: "Daily" },
    targetValue: { type: Number, default: 0 },
    currentValue: { type: Number, default: 0 },

    reward: {
        exp: { type: Number, default: 0 },
        gold: { type: Number, default: 0 },
    },

    needApproval: { type: Boolean, default: false },
    status: {
        type: String,
        enum: ["pending", "accepted", "rejected", "completed", "approved"],
        default: "pending",
    },

    completedAt: { type: Date },
    approvedAt: { type: Date },
}, { timestamps: true });

export default mongoose.models.UserQuest || mongoose.model<IUserQuest>("UserQuest", userQuestSchema);