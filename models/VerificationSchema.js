const mongoose = require("mongoose");
const { Schema } = mongoose;

const VerificationSchema = new Schema({
  governmentId: {
    photo: { type: String }, // This will store the path to the uploaded photo
    selfie: { type: String }, // This will store the path to the uploaded selfie with ID
    verified: { type: Boolean, default: false },
  },
  address: {
    documentPhoto: { type: String }, // This will store the path to the uploaded document showing billing address
    verified: { type: Boolean, default: false },
  },
  mobileNumber: {
    number: { type: String },
    verificationCode: { type: String },
    verified: { type: Boolean, default: false },
  },
});

module.exports = mongoose.model("Verification", VerificationSchema);
