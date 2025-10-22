import mongoose, { Schema, Document, Model } from "mongoose";

interface ISkill extends Document {
    name: string;
    level: string; // e.g. "Beginner", "Intermediate", "Advanced"
    category?: string; // e.g. "Frontend", "Backend", "DevOps"
    iconURL?: {
        url: string;
        public_id: string;
    };
    createdAt: Date;
    updatedAt: Date;
}

type SkillModelType = Model<ISkill>;

const skillSchema: Schema<ISkill> = new mongoose.Schema({
    name: { type: String, required: true, trim: true, unique: true },
    level: { type: String, required: true, trim: true },
    category: { type: String, trim: true },
    iconURL: {
        url: { type: String },
        public_id: { type: String }
    }
}, { timestamps: true });

export default mongoose.model<ISkill, SkillModelType>("Skill", skillSchema);
