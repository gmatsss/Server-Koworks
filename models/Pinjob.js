const mongoose = require("mongoose");
const { Schema } = mongoose;

// Assuming you already have a User model as shown in your provided code
const PinJobSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  job: {
    type: Schema.Types.ObjectId,
    ref: "PostJob", // Assuming this is the model for the jobs being pinned
    required: true,
  },
  notes: {
    type: String,
    required: false, // Set to true if notes are mandatory
  },
  // Add more fields as needed here
  created: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("PinJob", PinJobSchema);
