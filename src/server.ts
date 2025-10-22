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
import projectRoutes from './routes/projectRoutes'
import blogRoutes from './routes/blogPostRoutes'
import contactRoutes from './routes/contactRoutes'
import githubRoutes from "./routes/githubRoutes";
import dashboardRoutes from "./routes/dashboardRoutes";
import skillRoutes from "./routes/skillRoutes";

//Use Routes
app.use('/api/auth', authRoutes)
app.use('/api/projects', projectRoutes)
app.use('/api/blogs', blogRoutes)
app.use('/api/contact', contactRoutes)
app.use("/api/github", githubRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/skills', skillRoutes);

//app.use('/api/blogs', blogRoutes)

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