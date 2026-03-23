import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import connectDB from './config/db.js';

import AuthRouter from './routes/authRoutes.js';
import ProfileRouter from './routes/profileRoutes.js';
import UserRouter from './routes/userRoutes.js';
import AdminRouter from './routes/adminRoutes.js';
import CourseRouter from './routes/courseRoutes.js';
import AptitudeTestRouter from './routes/aptitudeTestRoutes.js';

dotenv.config({ quiet: true});
connectDB();

const app = express();
const frontendUrl = process.env.FRONTEND_URL;

app.use(cors({ origin: frontendUrl, credentials: true }));
app.use(express.json());
app.set('trust proxy', true);
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.use('/api/auth', AuthRouter)

app.use('/api/profile', ProfileRouter);

app.use('/api/user', UserRouter);

app.use('/api/admin', AdminRouter);

app.use('/api/aptitude-tests', AptitudeTestRouter);

app.use('/api/courses', CourseRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));