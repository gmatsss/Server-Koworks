const express = require("express");
const router = express.Router();
const {
  updateOrCreateProfile,
  getUserProfileImage,
} = require("../controllers/EmployerControllers/BusinessProfile");

router.post("/updateOrCreateProfile", updateOrCreateProfile);
router.get("/getUserProfileImage", getUserProfileImage);

module.exports = router;
