import mongoose from "mongoose";

const userQuestSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    title: { type: String, required: true },
    description: String,
    goalType: String,
    targetValue: Number,
    currentValue: { type: Number, default: 0 },
    isCompleted: { type: Boolean, default: false },
    reward: {
        exp: { type: Number, default: 0 },
        coins: { type: Number, default: 0 },
    },
    completedAt: Date
}, { timestamps: true });

export default mongoose.models.UserQuest || mongoose.model("UserQuest", userQuestSchema);