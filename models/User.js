const mongoose = require("mongoose");
const { Schema } = mongoose;

const UserSchema = new Schema({
  fullname: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String },

  employeeProfile: {
    type: Schema.Types.ObjectId,
    ref: "EmployeeProfile",
  },

  testScores: {
    type: Schema.Types.ObjectId,
    ref: "TestScores",
  },

  skill: {
    type: Schema.Types.ObjectId,
    ref: "Skill",
  },

  verification: {
    type: Schema.Types.ObjectId,
    ref: "Verification",
  },

  businessProfile: {
    type: Schema.Types.ObjectId,
    ref: "BusinessProfile",
  },

  postedJobs: [
    {
      type: Schema.Types.ObjectId,
      ref: "PostJob",
    },
  ],

  created: { type: String },

  lastLogin: {
    type: Date,
    default: Date.now,
  },

  pinnedJobs: [
    {
      type: Schema.Types.ObjectId,
      ref: "PinJob",
    },
  ],

  verificationStatus: {
    type: Schema.Types.ObjectId,
    ref: "VerificationStatus",
  },
});

module.exports = mongoose.model("User", UserSchema);
