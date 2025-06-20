import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    nickname: { type: String, required: true },
    profileImage: { type: String, default: "default.png" },
    coupleId: { type: mongoose.Schema.Types.ObjectId, ref: "Couple" },
    sharedCode: { type: String, required: true, unique: true },
}, { timestamps: true });

export default mongoose.models.User || mongoose.model("User", userSchema);