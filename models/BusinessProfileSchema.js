const mongoose = require("mongoose");
const { Schema } = mongoose;

const BusinessProfileSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  businessName: { type: String },
  contactName: { type: String },
  address: { type: String },
  selectedCountry: { type: String },
  zipCode: { type: String },
  phone: { type: String },
  city: { type: String },
  selectedTimezone: { type: String },
  selectedCurrency: { type: String },
  website: { type: String },
  gender: {
    type: String,
  },
  img: {
    type: Schema.Types.ObjectId,
    ref: "uploads.files",
  },
});

module.exports = mongoose.model("BusinessProfile", BusinessProfileSchema);
