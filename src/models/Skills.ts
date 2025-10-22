import mongoose, { Schema, Document, Model } from "mongoose";

interface ISkill extends Document {
    name: string;
    level: string;
    category: string;
    icon?: string;
    order?: number;
    createdAt: Date;
    updatedAt: Date;
}

type SkillModelType = Model<ISkill>;

const skillSchema: Schema<ISkill> = new mongoose.Schema({
    name: { type: String, required: true, trim: true, unique: true },
    level: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    icon: { type: String, trim: true },
    order: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.model<ISkill, SkillModelType>("Skill", skillSchema);