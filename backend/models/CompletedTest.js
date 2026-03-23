import mongoose from "mongoose";

const completedTestSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
  test: { type: mongoose.Schema.Types.ObjectId, ref: "AptitudeTest", required: true },
  score: { type: Number, required: true },
  maxScore: { type: Number, required: true },
  percentage: { type: Number, required: true },
  status: { type: String, enum: ["passed", "failed"], required: true },
  completedAt: { type: Date, default: Date.now }
});

export default mongoose.model("CompletedTest", completedTestSchema);