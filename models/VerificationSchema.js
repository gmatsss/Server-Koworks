const mongoose = require("mongoose");
const { Schema } = mongoose;

const VerificationSchema = new Schema({
  governmentId: {
    photo: { type: String },
    selfie: { type: String },
    verified: { type: Boolean, default: false },
  },
  address: {
    documentPhoto: { type: String },
    verified: { type: Boolean, default: false },
  },
  mobileNumber: {
    number: { type: String },
    verificationCode: { type: String },
    verified: { type: Boolean, default: false },
  },
});

module.exports = mongoose.model("Verification", VerificationSchema);
