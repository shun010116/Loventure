import mongoose from "mongoose";

const coupleQuestSchema = new mongoose.Schema({
    coupleId: { type: mongoose.Schema.Types.ObjectId, ref: "Couple", required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    description: String,
    goalType: String,
    targetValue: { type: Number, required: true },
    currentValue: { type: Number, default: 0 },
    isCompleted: { type: Boolean, default: false },
    agreed: { type: Boolean, default: false },
    reward: {
        exp: { type: Number, default: 0 },
        coins: { type: Number, default: 0 },
    },
    completedAt: Date,
}, { timestamps: true });

export default mongoose.models.CoupleQuest || mongoose.model("CoupleQuest", coupleQuestSchema);