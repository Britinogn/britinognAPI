import dotenv from 'dotenv'
dotenv.config();

import express from 'express';
import connectDB from './config/db';
const PORT = process.env.PORT || 5000;
const app = express();
import cors from 'cors'


/** Middleware  */
app.use(express.json())
app.use(cors())


//Import routes
import authRoutes from './routes/authRoutes'


//Use Routes
app.use('/api/auth', authRoutes)


app.get("/", (_, res) => {
  res.send("Portfolio API running...");
});

const startServer = async () =>{
    await connectDB();
    app.listen(PORT, () =>{
        console.log(`🚀 Server running on http://localhost:${PORT}`);
    })
};

startServer();