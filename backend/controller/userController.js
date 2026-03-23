import user from "../models/user.js";
import CompletedTest from "../models/CompletedTest.js";
import AptitudeTest from "../models/aptitude.js";
import Course from "../models/course.js";
import Feedback from "../models/feedback.js";
import CareerPath from "../models/careerPath.js";
import bcrypt from "bcrypt";

export const basedetails = async (req, res) => {
  try {
    const userId = req.user._id; // added by verifyToken
    const userDetails = await user.findById(userId).select("fullname email profilePic");
    res.status(200).json({ success: true, data: userDetails });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const myprofile = async (req, res) => {
  try {
    const userId = req.user._id;
    const userDetails = await user.findById(userId).select("-password");
    if (!userDetails) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Get predicted career titles
    const predictedTitles = userDetails.predictedCareers || [];
    // Fetch CareerPath docs
    const careerPaths = await CareerPath.find({
      title: { $in: predictedTitles.map(title => new RegExp("^" + title + "$", "i")) }
    });

    // Map details
    const predictedCareerDetails = predictedTitles.map(title => {
      const careerDoc = careerPaths.find(
        cp => cp.title.toLowerCase() === title.toLowerCase()
      );
      return {
        title,
        description: careerDoc ? careerDoc.description : "",
        recommendedCourses: careerDoc ? careerDoc.recommendedCourses : []
      };
    });

    // Send all user data, but predictedCareers is now an array of objects
    res.status(200).json({
      success: true,
      data: {
        ...userDetails.toObject(),
        predictedCareers: predictedCareerDetails
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getCareerByTitle = async (req, res) => {
  try {
    const title = req.params.title;
    if (!title) return res.status(400).json({ success: false, message: "Title is required" });
    const career = await CareerPath.findOne({ title: new RegExp("^" + title + "$", "i") });
    if (!career) return res.status(404).json({ success: false, message: "Career not found" });
    res.status(200).json({ success: true, data: career });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { mobile, graduationYear } = req.body;
    const userupdate = await user.findById(req.user._id);
    if (!userupdate) return res.status(404).json({ message: 'User not found' });

    // handle file upload
    if (req.file) {
      userupdate.profilePic = `/uploads/profile/${req.file.filename}`;
    }

    // update other fields
    userupdate.mobile = mobile || userupdate.mobile;
    // userupdate.location = location || userupdate.location;
    // userupdate.studyBatch = studyBatch || userupdate.studyBatch;
    userupdate.graduationYear = graduationYear || userupdate.graduationYear;
    // userupdate.sector = sector || userupdate.sector;

    const updatedUser = await userupdate.save();

    res.status(200).json({ success: true, data: updatedUser });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Check if user exists
    const userpass = await user.findById(req.user._id);
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

export const getUserStats = async (req, res) => {
  try {
    const userId = req.user._id;
    const completedTestDocs = await CompletedTest.find({ user: userId });
    const uniqueCompletedTestIds = [...new Set(completedTestDocs.map(ct => ct.test.toString()))];
    const completedAssessmentsCount = uniqueCompletedTestIds.length;
    const totalAssessmentsCount = await AptitudeTest.countDocuments({ status: "Active" });
    const totalCoursesCount = await Course.countDocuments({ status: "Active" });
    const userDoc = await user.findById(userId);
    const nextAssessment = null; // Or fetch next scheduled assessment if applicable
    const latestPrediction = userDoc?.predictedCareers?.[0] || null;
    res.status(200).json({
      success: true,
      data: {
        completedAssessmentsCount,
        totalAssessmentsCount,
        totalCoursesCount,
        nextAssessment,
        latestPrediction
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getUserRecentActivity = async (req, res) => {
  try {
    const userId = req.user._id;
    // Example: Fetch last 10 completed tests for the user
    const completedTests = await CompletedTest.find({ user: userId })
      .populate("test", "title")
      .sort({ completedAt: -1 })
      .limit(5);

    const activities = completedTests.map(ct => ({
      title: `Completed ${ct.test.title}`,
      time: ct.completedAt,
      type: "assessment"
    }));

    res.status(200).json({ success: true, data: activities });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const submitFeedback = async (req, res) => {
  try {
    const userId = req.user._id; // Ensure verifyToken is used in route
    const { category, rating, feedback } = req.body;

    if (!category || !rating || !feedback) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (!["overall", "courses", "prediction"].includes(category)) {
      return res.status(400).json({ message: "Invalid category" });
    }
    if (typeof rating !== "number" || rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }
    if (typeof feedback !== "string" || feedback.trim().length === 0) {
      return res.status(400).json({ message: "Feedback text is required" });
    }

    const newFeedback = new Feedback({
      user: userId,
      category,
      rating,
      feedback
    });

    await newFeedback.save();

    res.status(201).json({ success: true, message: "Feedback submitted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};