import mongoose, { Schema, Document} from "mongoose";

export interface ICharacter extends Document {
    userId: mongoose.Types.ObjectId;
    name: string;
    species?: string;
    level: number;
    exp: number;
    evolutionStage: number;
    gold: number;
    lockedGold: number; // Protected gold that cannot be used until partner's Quest is completed
    // customization?: {
    //     accessories?: string[];
    // };
    avatar: string;
    statusMessage: string;
}

const characterSchema = new Schema<ICharacter>({
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, default: "name" },
    species: { type: String },
    level: { type: Number, default: 1 },
    exp: { type: Number, default: 0 },
    evolutionStage: { type: Number, default: 0 },
    gold: { type: Number, default: 0 },
    lockedGold: { type: Number, default: 0 },
    // customization: {
    //     accessories: { type: [String], default: [] },
    // },
    avatar: { type: String, default: "default.png" },
    statusMessage: { type: String, default: "" }
}, { timestamps: true });

export default mongoose.models.Character || mongoose.model<ICharacter>("Character", characterSchema);