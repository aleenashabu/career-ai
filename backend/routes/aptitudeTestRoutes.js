import express from "express";
import { verifyToken, checkRole } from "../middleware/verifyToken.js";
import { createAptitudeTest, getAptitudeTests, getAptitudeTestById, updateAptitudeTest, deleteAptitudeTest, getActiveTestsForUser } from "../controller/aptitudeTestController.js";
import { getCompletedTests, submitTest } from "../controller/CompletedTestController.js";

const AptitudeTestRouter = express.Router();

AptitudeTestRouter.post("/", verifyToken, checkRole("admin"), createAptitudeTest);
AptitudeTestRouter.get("/", verifyToken, checkRole("admin"), getAptitudeTests);
AptitudeTestRouter.get("/user", verifyToken, checkRole("user"), getActiveTestsForUser);
AptitudeTestRouter.get("/:id", verifyToken, checkRole("admin"), getAptitudeTestById);
AptitudeTestRouter.get("/user/:id", verifyToken, checkRole("user"), getAptitudeTestById);
AptitudeTestRouter.put("/:id", verifyToken, checkRole("admin"), updateAptitudeTest);
AptitudeTestRouter.delete("/:id", verifyToken, checkRole("admin"), deleteAptitudeTest);

AptitudeTestRouter.get("/completed-tests/user", verifyToken, checkRole("user"), getCompletedTests);

AptitudeTestRouter.post("/:id/submit", verifyToken, checkRole("user"), submitTest);

export default AptitudeTestRouter;
