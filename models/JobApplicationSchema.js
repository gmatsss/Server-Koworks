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
  Employerfeedback: {
    type: String,
  },
  appliedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("JobApplication", JobApplicationSchema);
