const mongoose = require("mongoose");
const { Schema } = mongoose;

const JobSeekerSchema = new Schema({
  fullname: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String }, // You might want to define specific roles here
});

module.exports = mongoose.model("JobSeeker", JobSeekerSchema);
