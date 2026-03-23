import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: [{ type: String, required: true }], // ['A', 'B', 'C', 'D']
  correctAnswer: { type: String, enum: ['A', 'B', 'C', 'D'], required: true }
}, { _id: false });

const aptitudeTestSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: {
    type: String,
    enum: ['Numerical Ability', 'Verbal Ability', 'Logical Ability'],
    required: true
  },
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], required: true },
  questions: [questionSchema],
  duration: { type: Number, default: 0 }, // in minutes, auto-calculated
  status: { type: String, enum: ['Active', 'Draft'], default: 'Draft' },
  participants: { type: Number, default: 0 }, // Number of times test taken
  averageScore: { type: Number, default: 0 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' }
}, { timestamps: true });

// Pre-save middleware to auto-calculate duration
aptitudeTestSchema.pre('save', function (next) {
  if (this.questions && this.questions.length > 0) {
    this.duration = this.questions.length * 1; // 1 min per question
  }
  next();
});

export default mongoose.model('AptitudeTest', aptitudeTestSchema);
