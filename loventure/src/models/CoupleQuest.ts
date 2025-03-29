import mongoose from "mongoose";

const coupleQuestSchema = new mongoose.Schema({
    coupleId: { type: mongoose.Schema.Types.ObjectId, ref: "Cooupel" },
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
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    agreed: { type: Boolean, default: false },
    completedAt: Date
}, { timestamps: true });

export default mongoose.models.CoupleQuest || mongoose.model("CoupleQuest", coupleQuestSchema);