const mongoose = require("mongoose");
const { Schema } = mongoose;

const PinJobSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  job: {
    type: Schema.Types.ObjectId,
    ref: "PostJob",
    required: true,
  },
  notes: {
    type: String,
    required: false,
  },
  created: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("PinJob", PinJobSchema);
