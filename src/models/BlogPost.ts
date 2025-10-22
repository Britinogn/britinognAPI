import mongoose, { Schema, Document, Model } from "mongoose";


interface IBlog extends Document {
    title: string;
    description: string;
    url: string;
    platform: string;
    imageURL: {
        url: string;
        public_id: string;
    };
    publishedAt: Date;
    createdAt: Date;
    updatedAt: Date;
}

const blogSchema: Schema<IBlog> = new mongoose.Schema({
    title: {
        type: String,
        required: [true, "Blog title is required"],
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    url: {
        type: String,
        required: [true, "Blog URL is required"],
        //match: [/^https?:\/\/.+/, "Please enter a valid URL"]
    },
    platform: {
        type: String,
        enum: ["Dev.to", "Medium", "Other"],
        default: "Other"
    },
    imageURL: {
        url: { type: String },
        public_id: { type: String }
    },
    publishedAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

export default mongoose.model<IBlog>('Blog', blogSchema);