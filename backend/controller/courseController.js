import Course from "../models/course.js";

// Add Course
export const addCourse = async (req, res) => {
  try {
    const { title, type, platform, url } = req.body;
    let thumbnail = req.body.thumbnail; // if admin provides URL

    if (req.file) {
      thumbnail = `/uploads/courses/${req.file.filename}`; // if admin uploads image
    }

    const course = new Course({ title, type, platform, url, thumbnail });
    await course.save();
    res.status(201).json({ success: true, message: "Course added successfully", course });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get All Courses
export const getCourses = async (req, res) => {
  try {
    const courses = await Course.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: courses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update Course
export const updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, type, platform, url, status } = req.body;
    let updatedData = { title, type, platform, url, status };

    if (req.file) {
      updatedData.thumbnail = `/uploads/courses/${req.file.filename}`;
    } else if (req.body.thumbnail) {
      updatedData.thumbnail = req.body.thumbnail;
    }

    const course = await Course.findByIdAndUpdate(id, updatedData, { new: true });
    if (!course) return res.status(404).json({ success: false, message: "Course not found" });

    res.status(200).json({ success: true, message: "Course updated successfully", course });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete Course
export const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const course = await Course.findByIdAndDelete(id);
    if (!course) return res.status(404).json({ success: false, message: "Course not found" });

    res.status(200).json({ success: true, message: "Course deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
