import mongoose, { Schema, Document } from "mongoose";

export interface ICoupleQuest extends Document {
    coupleId: mongoose.Types.ObjectId;
    createdBy: mongoose.Types.ObjectId;
    title: string;
    description?: string;
    goalType: "shared-count" | "both-complete"; // SharedCount: Sum of both partners' progress; both-complete: Both partners must complete the quest
    resetType: "Daily" | "Weekly" | "One-time";
    targetValue: number;

    progress: {
        [userId: string]: number;
    };

    reward: {
        exp: number;
        gold: number;
    };

    status: "active" | "completed";
    completedAt?: Date;
}

const coupleQuestSchema = new Schema<ICoupleQuest>({
    coupleId: { type: Schema.Types.ObjectId, ref: "Couple", required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    description: { type: String },
    goalType: {
        type: String,
        enum: ["shared-count", "both-complete"],
        default: "shared-count",
    },
    targetValue: { type: Number, default: 1 },
    progress: { type: Map, of: Number, default: {} },
    reward: {
        exp: { type: Number, default: 0 },
        gold: { type: Number, default: 0 },
    },
    status: {
        type: String,
        enum: ["active", "completed"],
        default: "active",
    },
    completedAt: { type: Date },
}, { timestamps: true });

export default mongoose.models.CoupleQuest || mongoose.model<ICoupleQuest>("CoupleQuest", coupleQuestSchema);