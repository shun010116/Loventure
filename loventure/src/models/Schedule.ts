import mongoose from "mongoose";

const scheduleSchema = new mongoose.Schema({
    coupleId: { type: mongoose.Schema.Types.ObjectId, ref: "Couple" },
    title: { type: String, required: true },
    description: String,
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    repeat: { type: String, enum: ["none", "daily", "weekly", "montly", "yearly"], default: "none" },
    isCompleted: { type: Boolean, default: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    sticker: { type: String, enum: [
        "pizza", "cake", "clapperboard", "gamepad", "gem",
        "book", "car", "beer", "handheart", "treepalm",
        "croissant", "tent"
    ] },
}, { timestamps: true });

export default mongoose.models.Schedule || mongoose.model("Schedule", scheduleSchema);