import mongoose from 'mongoose';

const connectDB = async (): Promise<void> =>{
    // Guard : Ensure URL is Set
    if (!process.env.MONGO_URI) {
        console.error('❌ MONGO_URI not set in environment variables.');
        process.exit(1);
    }

    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
        return;
    } catch (error:unknown) {
        const errorMessage = error instanceof Error ? error.message: 'Unknown error';
        console.error(`❌ MongoDB Connection Failed: ${errorMessage}`);
        process.exit(1);
    }
}

export default connectDB