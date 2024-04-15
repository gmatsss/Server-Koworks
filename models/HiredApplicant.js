const mongoose = require("mongoose");
const { Schema } = mongoose;

const HiredApplicantSchema = new Schema({
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
  hiredAt: {
    type: Date,
    default: Date.now,
  },
  feedback: {
    type: String,
    default: "",
  },
  acceptedOffer: {
    type: Boolean,
    default: false,
  },
  salaryOffered: {
    type: Number,
    default: 0,
  },
  contractType: {
    type: String,
    default: "",
  },
  contractStartDate: {
    type: Date,
    default: Date.now, // Default start date could be the hiring date
  },
  contractEndDate: {
    type: Date,
    default: "", // Empty string means indefinite or until further action
  },
  additionalTerms: {
    type: String,
    default: "", // Any additional contract terms
  },
});

module.exports = mongoose.model("HiredApplicant", HiredApplicantSchema);
