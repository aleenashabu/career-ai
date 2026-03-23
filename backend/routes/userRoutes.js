import express from 'express';
import { basedetails, getCareerByTitle, getUserRecentActivity, getUserStats, myprofile, submitFeedback, updatePassword, updateProfile } from '../controller/userController.js';
import { verifyToken, checkRole } from '../middleware//verifyToken.js';
import { uploadProfilePic } from '../middleware/uploadMiddleware.js';

import { getCareerById, predictCareer } from '../controller/predictController.js';
import user from '../models/user.js';

const UserRouter = express.Router();

UserRouter.get('/basedetails', verifyToken, checkRole('user'), basedetails);
UserRouter.get('/myprofile', verifyToken, checkRole('user'), myprofile);
UserRouter.get('/career-by-title/:title', verifyToken, checkRole('user'), getCareerByTitle);
UserRouter.put('/updateprofile', verifyToken, checkRole('user'), uploadProfilePic, updateProfile);
UserRouter.put('/change-password', verifyToken, checkRole('user'), updatePassword);

UserRouter.post('/predict-career', verifyToken, checkRole('user'), predictCareer);
UserRouter.get('/career/:id', verifyToken, checkRole('user'), getCareerById);

UserRouter.get('/stats', verifyToken, checkRole('user'), getUserStats)
UserRouter.get("/recent-activity", verifyToken, getUserRecentActivity);

UserRouter.post("/feedback", verifyToken, checkRole('user'), submitFeedback);

export default UserRouter;