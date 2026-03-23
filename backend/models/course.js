import mongoose from "mongoose";

const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    type: { type: String, enum: ["free", "paid"], required: true },
    platform: { type: String, required: true },
    url: { type: String, required: true },
    thumbnail: { type: String, required: true }, // can be file path or URL
    status: { type: String, enum: ["Active", "Draft"], default: "Active" }
  },
  { timestamps: true }
);

export default mongoose.model("Course", courseSchema);
