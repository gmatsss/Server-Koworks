const mongoose = require("mongoose");
const { Schema } = mongoose;

const VerificationStatusSchema = new Schema({
  emailVerified: { type: Boolean, default: false },
  profileCompleted: { type: Boolean, default: false },
  skillCompleted: { type: Boolean, default: false },
  idVerified: { type: Boolean, default: false },
  addressVerified: { type: Boolean, default: false },
  phoneVerified: { type: Boolean, default: false },
  idScore: { type: Number, default: 0, min: 0, max: 100 }, // Track the ID score here
});

module.exports = mongoose.model("VerificationStatus", VerificationStatusSchema);
