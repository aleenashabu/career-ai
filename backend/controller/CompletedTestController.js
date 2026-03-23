import CompletedTest from "../models/CompletedTest.js";
import AptitudeTest from "../models/aptitude.js";

export const getCompletedTests = async (req, res) => {
  try {
    const userId = req.user._id;
    const completedTests = await CompletedTest.find({ user: userId })
      .populate("test", "title duration")
      .sort({ completedAt: -1 });

    const response = completedTests.map(ct => ({
      id: ct._id,
      title: ct.test.title,
      duration: ct.test.duration + " mins",
      score: ct.score,
      maxScore: ct.maxScore,
      completedAt: ct.completedAt.toISOString().split("T")[0],
      status: ct.status
    }));

    res.status(200).json({ success: true, data: response });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching completed tests", error: err.message });
  }
};

export const submitTest = async (req, res) => {
  try {
    const { testId, answers } = req.body; // answers = { 0: "A", 1: "B", ... }

    const test = await AptitudeTest.findById(testId);
    if (!test) {
      return res.status(404).json({ success: false, message: "Test not found" });
    }

    let score = 0;
    const maxScore = test.questions.length;

    test.questions.forEach((q, index) => {
      const userAnswer = answers[index];
      if (userAnswer && userAnswer === q.correctAnswer) {
        score++;
      }
    });
    const percentage = (score / maxScore) * 100;
    const status = percentage >= 30 ? "passed" : "failed";

    const completedTest = await CompletedTest.create({
      user: req.user._id,
      test: testId,
      score,
      maxScore,
      percentage,
      status
    });

    const newParticipants = test.participants + 1;
    const newAvg = (test.averageScore * test.participants + percentage) / newParticipants;

    test.participants = newParticipants;
    test.averageScore = newAvg;
    await test.save();

    res.status(201).json({
      success: true,
      message: "Test submitted successfully",
      data: completedTest
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to submit test", error: err.message });
  }
};