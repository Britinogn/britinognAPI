import mongoose, { Schema, Document } from "mongoose";

// Interface for TypeScript
export interface IGithub extends Document {
  username: string;
  totalRepos: number;
  totalStars: number;
  totalForks: number;
  followers: number;
  following: number;
  languages: string[];
  avatarUrl?: string;
  bio?: string;
  location?: string;
  company?: string;
  blog?: string;
  lastUpdated: Date;
}

// Schema definition
const GithubSchema: Schema = new Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
    },
    totalRepos: {
      type: Number,
      required: true,
      default: 0,
    },
    totalStars: {
      type: Number,
      required: true,
      default: 0,
    },
    totalForks: {
      type: Number,
      required: true,
      default: 0,
    },
    followers: {
      type: Number,
      required: true,
      default: 0,
    },
    following: {
      type: Number,
      required: true,
      default: 0,
    },
    languages: {
      type: [String],
      default: [],
    },
    avatarUrl: {
      type: String,
      trim: true,
    },
    bio: {
      type: String,
      trim: true,
    },
    location: {
      type: String,
      trim: true,
    },
    company: {
      type: String,
      trim: true,
    },
    blog: {
      type: String,
      trim: true,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  }
);

// Create and export the model
const GithubModel = mongoose.model<IGithub>("Github", GithubSchema);

export default GithubModel;