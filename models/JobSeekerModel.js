const mongoose = require("mongoose");

var Jobeeker = new mongoose.Schema({
  fullname: String,
  email: String,
  password: String,
  job_title: String,
  summary: String,
  expected_salary: Number,
  education: String,
  experience: String,
  employment_status: String,
  working_hours: Number,
  birthdate: String,
  contact_number: Number,
  gender: String,
});

module.exports = mongoose.model("jobseeker", Jobeeker);
