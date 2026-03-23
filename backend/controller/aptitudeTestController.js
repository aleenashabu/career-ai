import AptitudeTest from "../models/aptitude.js";

// CREATE Aptitude Test
export const createAptitudeTest = async (req, res) => {
  try {
    const { title, description, category, difficulty, questions, status } = req.body;

    // Create new test
    const newTest = await AptitudeTest.create({
      title,
      description,
      category,
      difficulty,
      questions,
      status,
      createdBy: req.user._id
    });

    res.status(201).json({
      success: true,
      message: "Aptitude test created successfully",
      data: newTest
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to create aptitude test", error: err.message });
  }
};

// GET All Aptitude Tests
export const getAptitudeTests = async (req, res) => {
  try {
    const tests = await AptitudeTest.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: tests });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching tests", error: err.message });
  }
};

// GET Single Aptitude Test
export const getAptitudeTestById = async (req, res) => {
  try {
    const { id } = req.params;
    const test = await AptitudeTest.findById(id);

    if (!test) {
      return res.status(404).json({ success: false, message: "Test not found" });
    }

    res.status(200).json({ success: true, data: test });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching test", error: err.message });
  }
};

// UPDATE Aptitude Test
export const updateAptitudeTest = async (req, res) => {
  try {
    const { id } = req.params;

    const updatedTest = await AptitudeTest.findByIdAndUpdate(id, req.body, { new: true });

    if (!updatedTest) {
      return res.status(404).json({ success: false, message: "Test not found" });
    }

    res.status(200).json({
      success: true,
      message: "Aptitude test updated successfully",
      data: updatedTest
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to update aptitude test", error: err.message });
  }
};

// DELETE Aptitude Test
export const deleteAptitudeTest = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedTest = await AptitudeTest.findByIdAndDelete(id);

    if (!deletedTest) {
      return res.status(404).json({ success: false, message: "Test not found" });
    }

    res.status(200).json({ success: true, message: "Aptitude test deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to delete aptitude test", error: err.message });
  }
};

export const getActiveTestsForUser = async (req, res) => {
  try {
    // Only show Active tests
    const tests = await AptitudeTest.find({ status: "Active" })
      .select("title description category difficulty duration participants status questions");
    res.status(200).json({ success: true, data: tests });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching tests", error: err.message });
  }
};
