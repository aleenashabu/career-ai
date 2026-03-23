import Admin from "../models/admin.js";
import User from "../models/user.js";
import CareerPath from "../models/careerPath.js";
import Course from "../models/course.js";
import Feedback from "../models/feedback.js";
import bcrypt from "bcrypt";

export const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Check if user exists
    const userpass = await Admin.findById(req.user._id);
    if (!userpass) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if current password is correct
    const isMatch = await bcrypt.compare(currentPassword, userpass.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    // Update password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    userpass.password = hashedPassword;
    await userpass.save();

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// CREATE Career Path
export const createCareerPath = async (req, res) => {
  try {
    const { title, description, averageSalary, salaryTrend, futureScope, requiredSkills, companies, jobRoles, status, recommendedCourses } = req.body;

    const newCareerPath = await CareerPath.create({
      title, description, averageSalary, salaryTrend, futureScope, requiredSkills, companies, jobRoles, status, recommendedCourses
    });

    res.status(201).json({
      success: true,
      message: "Career path created successfully",
      data: newCareerPath
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to create career path",
      error: err.message
    });
  }
};

// GET All Career Paths
export const getCareerPaths = async (req, res) => {
  try {
    const paths = await CareerPath.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: paths });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching career paths", error: err.message });
  }
};

// UPDATE Career Path
export const updateCareerPath = async (req, res) => {
  try {
    const { id } = req.params;

    const updatedPath = await CareerPath.findByIdAndUpdate(id, req.body, { new: true });

    if (!updatedPath) {
      return res.status(404).json({ success: false, message: "Career path not found" });
    }

    res.status(200).json({
      success: true,
      message: "Career path updated successfully",
      data: updatedPath
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to update career path", error: err.message });
  }
};

// DELETE Career Path
export const deleteCareerPath = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedPath = await CareerPath.findByIdAndDelete(id);
    if (!deletedPath) {
      return res.status(404).json({ success: false, message: "Career path not found" });
    }

    res.status(200).json({ success: true, message: "Career path deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to delete career path", error: err.message });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ created_at: -1 });
    res.status(200).json({ success: true, data: users });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error fetching users",
      error: err.message,
    });
  }
};

export const getAdminStats = async (req, res) => {
  try {
    // Count stats from MongoDB
    const totalUsers = await User.countDocuments();
    const activeCourses = await Course.countDocuments({ status: "Active" });

    // If you want predictions later, plug in your logic here
    // const predictions = await Prediction.countDocuments(); 
    const predictions = 0; // placeholder for now

    // Example: success rate could come from predictions or feedback
    const successRate = 94.2; // hardcoded placeholder

    return res.status(200).json({
      success: true,
      data: {
        totalUsers,
        activeCourses,
        predictions,
        successRate,
      },
    });
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch stats",
    });
  }
};

export const getRecentActivity = async (req, res) => {
  try {
    // Latest 10 users (new registrations)
    const newUsers = await User.find({})
      .sort({ created_at: -1 })
      .limit(5)
      .select("fullname created_at");

    // Users who recently completed predictions
    const predictionCompleted = await User.find({ lastPredictionDate: { $exists: true } })
      .sort({ lastPredictionDate: -1 })
      .limit(5)
      .select("fullname lastPredictionDate");

    // Format activities into a frontend-friendly array
    const activities = [];

    newUsers.forEach(user => {
      activities.push({
        action: "New user registration",
        user: user.fullname,
        time: user.created_at,
      });
    });

    predictionCompleted.forEach(user => {
      activities.push({
        action: "Prediction completed",
        user: user.fullname,
        time: user.lastPredictionDate,
      });
    });

    // Sort activities by time (most recent first)
    activities.sort((a, b) => new Date(b.time) - new Date(a.time));

    res.json({ success: true, data: activities.slice(0, 10) }); // send latest 10
  } catch (err) {
    console.error("Error fetching recent activity:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getAllFeedbacks = async (req, res) => {
  try {
    // Get feedbacks with user info
    const feedbacks = await Feedback.find()
      .populate("user", "fullname email") // add more fields if needed
      .sort({ submittedAt: -1 });
    res.status(200).json({ success: true, data: feedbacks });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching feedbacks", error: err.message });
  }
};