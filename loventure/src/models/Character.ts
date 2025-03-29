import mongoose from "mongoose";

const characterSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    name: String,
    type: String,
    level: { type: Number, default: 1 },
    exp: { type: Number, default: 0 },
    coings: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.models.Character || mongoose.model("Character", characterSchema);