const mongoose = require("mongoose");
const { Schema } = mongoose;

const PinEmployeeSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User", // The user who pins the employee
    required: true,
  },
  employee: {
    type: Schema.Types.ObjectId,
    ref: "User", // Assuming the 'User' model represents employees as well
    required: true,
  },
  notes: {
    type: String,
    required: false, // Optional field for notes about the pin
  },
  created: {
    type: Date,
    default: Date.now, // Automatically set the date when the pin is created
  },
  // You can add additional fields as needed
});

module.exports = mongoose.model("PinEmployee", PinEmployeeSchema);
