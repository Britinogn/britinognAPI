import mongoose, { Schema, Document, Model } from "mongoose";

interface IProject extends Document {
    title: string;
    description: string;
    techStack: string[];
    githubUrl: string;
    liveURL: string;
    imageURL: {
        url: string;
        public_id: string;
    };
    category?:string
    yearBuilt?:number
    createdAt: Date;
    updatedAt: Date;
}

type ProjectModelType = Model<IProject>;

const projectSchema: Schema<IProject> = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    techStack: [{ type: String }],
    imageURL: {
        url: { type: String },
        public_id: { type: String }
    },
    githubUrl: { type: String,  trim: true },
    liveURL: { type: String,  trim: true },
    category: { type: String, trim: true },
    yearBuilt:{type:Number, min: 2000}
}, { timestamps: true });

export default mongoose.model<IProject, ProjectModelType>('Project', projectSchema);