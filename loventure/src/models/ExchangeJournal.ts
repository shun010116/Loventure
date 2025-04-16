import mongoose from "mongoose";

const exchangeJournalSchema = new mongoose.Schema({
    coupleId: { type: mongoose.Schema.Types.ObjectId, ref: "Couple" },
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    date: { type: Date, required: true},
    title: { type: String, required: true },
    content: { type: String, required: true },
    images: [{ type: String }],
    mood: String,
    weather: { type: String, enum: ["sunny", "cloudy", "rainy", "snowy", "stormy", "windy", "foggy", "etc"] },
    turnNuber: { type: Number },
    isRead: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.ExchangeJournal || mongoose.model("ExchangeJournal", exchangeJournalSchema);