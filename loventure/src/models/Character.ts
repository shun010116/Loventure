import mongoose from "mongoose";

const characterSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    name: { type: String, default: "name" },
    species: { type: String },
    level: { type: Number, default: 1 },
    exp: { type: Number, default: 0 },
    evolutionStage: { type: Number, default: 0 },
    gold: { type: Number, default: 0 },
    customization: {
        accessories: { type: [String], default: [] },
    },
    avatar: { type: String, default: "default.png" },
    statusMessage: { type: String, default: "" }
}, { timestamps: true });

export default mongoose.models.Character || mongoose.model("Character", characterSchema);