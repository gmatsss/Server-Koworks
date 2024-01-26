const mongoose = require("mongoose");
const { Schema } = mongoose;

const PostJobSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  jobTitle: { type: String, required: true },
  jobDescription: { type: String, required: true },
  salaryType: { type: String, enum: ["range", "exact"], default: "range" },
  salaryLow: { type: Number },
  salaryHigh: { type: Number },
  salaryExact: { type: Number },
  idProof: { type: String },
  employmentType: { type: String },
  experience: { type: String },
  workingHours: { type: String },
  jobSkills: [{ type: String }], // Array of skill labels
  selectedCategory: { type: String },
  applicants: [{ type: Schema.Types.ObjectId, ref: "User" }], // Array of User IDs who applied
  hits: { type: Number, default: 0 }, // Number of times the job posting has been viewed
  status: { type: String, default: "open" }, // Job status
  created: { type: Date, default: Date.now }, // Date when the job was added
});

module.exports = mongoose.model("PostJob", PostJobSchema);
