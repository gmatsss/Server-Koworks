const mongoose = require("mongoose");
const { Schema } = mongoose;

const TestScoresSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  disc: {
    dominance_score: { type: Number, default: null },
    influence_score: { type: Number, default: null },
    steadiness_score: { type: Number, default: null },
    compliance_score: { type: Number, default: null },
    disc_img: { type: Schema.Types.ObjectId, ref: "uploads.files" },
  },
  iq: {
    iq_score: { type: Number, default: null },
    iq_img: { type: Schema.Types.ObjectId, ref: "uploads.files" },
  },
  english: {
    english_score: { type: String, default: null },
    english_img: { type: Schema.Types.ObjectId, ref: "uploads.files" },
  },
});

module.exports = mongoose.model("TestScores", TestScoresSchema);
