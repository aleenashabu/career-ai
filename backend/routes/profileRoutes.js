import express from "express";
import { completeProfile, getProfile } from "../controller/profileController.js";
import { verifyToken } from "../middleware/verifyToken.js";

const ProfileRouter = express.Router();

ProfileRouter.post("/complete", verifyToken, completeProfile);
ProfileRouter.get("/me", verifyToken, getProfile);

export default ProfileRouter;
