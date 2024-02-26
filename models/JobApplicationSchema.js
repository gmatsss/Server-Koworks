const mongoose = require("mongoose");
const { Schema } = mongoose;

const JobApplicationSchema = new Schema({
  job: {
    type: Schema.Types.ObjectId,
    ref: "PostJob",
    required: true,
  },
  applicant: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  status: {
    type: String,
    enum: ["applied", "interview", "hired", "rejected"],
    default: "applied",
  },
  appliedAt: {
    type: Date,
    default: Date.now,
  },
  // Additional fields like interviewDate, notes, etc., can be added here
});

module.exports = mongoose.model("JobApplication", JobApplicationSchema);
