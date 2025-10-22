import mongoose, { Schema, Document, Model } from "mongoose";

interface IContact extends Document {
    name: string;
    email: string;
    subject?: string;
    message: string;
    isRead: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const contactSchema: Schema<IContact> = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Name is required"],
        trim: true
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        trim: true
        // match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Please enter a valid email"]
    },
    subject: {
        type: String,
        trim: true
    },
    message: {
        type: String,
        required: [true, "Message is required"],
        trim: true
    },
    isRead: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

export default mongoose.model<IContact>('Contact', contactSchema);