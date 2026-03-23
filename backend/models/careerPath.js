import mongoose from "mongoose";

const careerPathSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    averageSalary: { type: String },
    salaryTrend: { type: String, enum: ["increasing", "decreasing", "stable"], default: "stable" },
    futureScope: { type: String, enum: ["low", "medium", "high"], default: "medium" },
    requiredSkills: [{ type: String }],
    companies: [{ type: String }],
    jobRoles: [{ type: String }],
    status: { type: String, enum: ["Active", "Draft"], default: "Draft" },
    recommendedCourses: [{
      platform: { type: String, required: true },
      url: { type: String, required: true }
    }]
  },
  { timestamps: true }
);

export default mongoose.model("CareerPath", careerPathSchema);
