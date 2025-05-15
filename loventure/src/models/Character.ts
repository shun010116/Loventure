import mongoose from "mongoose";

const characterSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    name: String,
    type: String,
    level: { type: Number, default: 1 },
    exp: { type: Number, default: 0 },
    gold: { type: Number, default: 0 },
    customization: {
        skinColor: { type: String, default: 'light' },
        hairStyle: { type: String, default: 'short' },
        hairColor: { type: String, default: 'brown' },
        outfit: { type: String, default: 'default' },
        accessories: { type: [String], default: [] },
    }
}, { timestamps: true });

export default mongoose.models.Character || mongoose.model("Character", characterSchema);