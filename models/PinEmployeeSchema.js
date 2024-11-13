const mongoose = require("mongoose");
const { Schema } = mongoose;

const PinEmployeeSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  employee: {
    type: Schema.Types.ObjectId,
    ref: "User",
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

module.exports = mongoose.model("PinEmployee", PinEmployeeSchema);
