const mongoose = require("mongoose");
const { Schema } = mongoose;

// Sub-schema for each skill
const SkillRatingSchema = new Schema({
  name: { type: String },
  rating: { type: Number, default: 0, min: 0, max: 5 }, // Assuming a rating scale of 0-5
});

// Main schema for the skills
const SkillSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  adminandoffice: [SkillRatingSchema],
  englishSkills: [SkillRatingSchema],
  financeAndManagement: [SkillRatingSchema],
  advertising: [SkillRatingSchema],
  customerSupport: [SkillRatingSchema],
  softwareDevelopment: [SkillRatingSchema],
  webDevelopment: [SkillRatingSchema],
  webmaster: [SkillRatingSchema],
  writing: [SkillRatingSchema],
  graphicsAndMultimedia: [SkillRatingSchema],
  marketingAndSales: [SkillRatingSchema],
  professionalServices: [SkillRatingSchema],
  projectManagement: [SkillRatingSchema],
});

module.exports = mongoose.model("Skill", SkillSchema);
