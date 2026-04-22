import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';

import authRoutes from './routes/auth.route';
import taskRoutes from './routes/task.route';

const app = express(); 
app.use(cors());
app.use(express.json());


app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use("/auth", authRoutes);
app.use("/tasks", taskRoutes);


export default app;