import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true }, // Reference to user
  category: { type: String, enum: ["overall", "courses", "prediction"], required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  feedback: { type: String, required: true, maxlength: 1000 },
  submittedAt: { type: Date, default: Date.now }
});

export default mongoose.model("Feedback", feedbackSchema);