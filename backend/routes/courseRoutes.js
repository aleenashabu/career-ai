import express from "express";
import { addCourse, getCourses, updateCourse, deleteCourse } from "../controller/courseController.js";
import { uploadCourseImage } from "../middleware/courseUpload.js";
import { verifyToken, checkRole } from "../middleware/verifyToken.js";

const CourseRouter = express.Router();

CourseRouter.get("/", verifyToken, checkRole("admin"), getCourses);
CourseRouter.get("/user", verifyToken, checkRole("user"), getCourses);
CourseRouter.post("/", verifyToken, checkRole("admin"), uploadCourseImage, addCourse);
CourseRouter.put("/:id", verifyToken, checkRole("admin"), uploadCourseImage, updateCourse);
CourseRouter.delete("/:id", verifyToken, checkRole("admin"), deleteCourse);

export default CourseRouter;
