const mongoose = require("mongoose");
const { Schema } = mongoose;

const VerificationScoreSchema = new Schema({
  completeProfile: { type: Boolean, default: false },
  discTest: { type: Boolean, default: false },
  iqTest: { type: Boolean, default: false },
  englishTest: { type: Boolean, default: false },
  governmentIdVerification: { type: Boolean, default: false },
  addressVerification: { type: Boolean, default: false },
  mobilePhoneNumberVerification: { type: Boolean, default: false },
  connectFBAccount: { type: Boolean, default: false },
  totalScore: {
    type: Number,
    default: 0,
    get: function () {
      let score = 0;
      if (this.completeProfile) score += 10;
      if (this.discTest) score += 5;
      if (this.iqTest) score += 5;
      if (this.englishTest) score += 5;
      if (this.governmentIdVerification) score += 25;
      if (this.addressVerification) score += 20;
      if (this.mobilePhoneNumberVerification) score += 20;
      if (this.connectFBAccount) score += 10;
      return score;
    },
  },
});

VerificationScoreSchema.set("toJSON", { getters: true });

module.exports = mongoose.model("VerificationScore", VerificationScoreSchema);
