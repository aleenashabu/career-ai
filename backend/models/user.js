import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    fullname: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    created_at: { type: Date, default: Date.now },
    profilePic: { type: String, default: null },
    profileCompleted: { type: Boolean, default: false },
    mobile: { type: String, default: null },
    // location: { type: String, default: null },
    // studyBatch: { type: String },
    graduationYear: { type: String },
    educationBg: { type: String, required: true },
    predictedCareers: { type: [String], default: [] },
    lastPredictionDate: { type: Date },
    lastLogin: { type: Date },
})

export default mongoose.model("user", userSchema);