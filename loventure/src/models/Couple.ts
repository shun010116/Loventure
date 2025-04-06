import mongoose from "mongoose";

const coupleSchema = new mongoose.Schema({
    users: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    startedDating: { type: Date },
    sharedGoals: [{ type: String }],
    activeQuestIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "CoupleQuest" }],
}, { timestamps: true });

export default mongoose.models.Couple || mongoose.model("Couple", coupleSchema);
