const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const EmployeeProfileSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  job_title: {
    type: String,
    required: true,
  },
  summary: String,
  video_embed_code: String,
  video_type: {
    type: String,
  },
  salary: Number,
  hourly_rate: Number,
  education: {
    type: String,

    required: true,
  },
  experience: String,
  employment_status: {
    type: String,

    required: true,
  },
  working_hours_from: String,
  working_hours_to: String,
  bday: Date,
  contact: String,
  website: String,
  gender: {
    type: String,

    required: true,
  },

  img: {
    type: Schema.Types.ObjectId,
    ref: "uploads.files",
  },

  location: {
    roomFloorUnitOrBuildingName: {
      type: String,
    },
    houseLotAndBlockNumber: {
      type: String,
    },
    streetName: {
      type: String,
    },
    subdivision: {
      type: String,
    },
    barangayOrDistrict: {
      type: String,
    },
    cityOrMunicipality: {
      type: String,
    },
    province: {
      type: String,
    },
    postCode: {
      type: String,
    },
    country: {
      type: String,
    },
  },
});

module.exports = mongoose.model("EmployeeProfile", EmployeeProfileSchema);
