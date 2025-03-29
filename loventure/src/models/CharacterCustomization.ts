import mongoose from "mongoose";

const characterCustomizationSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "Character" },
    clothes: String,
    accessories: [{ type: String }]
}, { timestamps: { updatedAt: true } });

export default mongoose.models.CharacterCustomization || mongoose.model("CharacterCustomization", characterCustomizationSchema);