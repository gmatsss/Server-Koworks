const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const TestScoresSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  disc: {
    dominance_score: {
      type: Number,
      default: null,
    },
    influence_score: {
      type: Number,
      default: null,
    },
    steadiness_score: {
      type: Number,
      default: null,
    },
    compliance_score: {
      type: Number,
      default: null,
    },
    disc_img: {
      type: String, // Base64 encoded image
      default: null,
    },
  },
  iq: {
    iq_score: {
      type: Number,
      default: null,
    },
    iq_img: {
      type: String, // Base64 encoded image
      default: null,
    },
  },
  english: {
    english_score: {
      type: String,
      default: null,
    },
    english_img: {
      type: String, // Base64 encoded image
      default: null,
    },
  },
});

module.exports = mongoose.model("TestScores", TestScoresSchema);
