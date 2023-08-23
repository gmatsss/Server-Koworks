const mongoose = require("mongoose");
const { Schema } = mongoose;

const UserSchema = new Schema({
  fullname: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String }, // You might want to define specific roles here

  employeeProfile: {
    type: Schema.Types.ObjectId,
    ref: "EmployeeProfile",
  },

  testScores: {
    type: Schema.Types.ObjectId,
    ref: "TestScores",
  },

  skill: {
    type: Schema.Types.ObjectId,
    ref: "Skill",
  },
});

module.exports = mongoose.model("User", UserSchema);
