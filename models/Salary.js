const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const salarySchema = new Schema({
  amount: { type: Number, required: true },
  currency: { type: String, required: true },
  frequency: { type: String, default: "monthly" }, // e.g., monthly, yearly
  benefits: {
    healthInsurance: { type: Boolean },
    retirementPlan: { type: Boolean },
    bonuses: { type: Boolean },
    // ... other benefits ...
  },
  // ... other fields related to salary ...
});

const Salary = mongoose.model("Salary", salarySchema);

module.exports = Salary;
