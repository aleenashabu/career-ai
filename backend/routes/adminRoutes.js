import express from "express";
import { verifyToken, checkRole } from "../middleware/verifyToken.js";
import { createCareerPath, deleteCareerPath, getAdminStats, getAllFeedbacks, getAllUsers, getCareerPaths, getRecentActivity, updateCareerPath, updatePassword } from "../controller/adminController.js";

const AdminRouter = express.Router();

AdminRouter.put('/change-password', verifyToken, checkRole('admin'), updatePassword);

AdminRouter.post("/career-paths", verifyToken, checkRole("admin"), createCareerPath);
AdminRouter.get("/career-paths", verifyToken, checkRole("admin"), getCareerPaths);
AdminRouter.put("/career-paths/:id", verifyToken, checkRole("admin"), updateCareerPath);
AdminRouter.delete("/career-paths/:id", verifyToken, checkRole("admin"), deleteCareerPath);

AdminRouter.get("/users", verifyToken, checkRole("admin"), getAllUsers);
AdminRouter.get("/stats", verifyToken, checkRole("admin"), getAdminStats);
AdminRouter.get("/recent-activity", verifyToken, checkRole("admin"), getRecentActivity);

AdminRouter.get("/feedbacks", verifyToken, checkRole("admin"), getAllFeedbacks);

export default AdminRouter;