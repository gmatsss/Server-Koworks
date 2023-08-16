const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const jobTitleSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String },
  industry: { type: String },
  seniorityLevel: { type: String },
  responsibilities: { type: [String] }, // List of responsibilities
  qualifications: { type: [String] }, // List of qualifications
  // ... other fields related to job titles ...
});

const JobTitle = mongoose.model("JobTitle", jobTitleSchema);

module.exports = JobTitle;
