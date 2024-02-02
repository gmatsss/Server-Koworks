const express = require("express");
const router = express.Router();
const {
  updateOrCreateProfile,
  getUserProfileImage,
} = require("../controllers/EmployerControllers/BusinessProfile");

const {
  createPostJob,
  getJobsByUser,
  updatePostJob,
  deletePostJob,
} = require("../controllers/EmployerControllers/PostJob");

const {
  getEmployees,
} = require("../controllers/EmployerControllers/Getjobseeker");

router.post("/updateOrCreateProfile", updateOrCreateProfile);
router.get("/getUserProfileImage", getUserProfileImage);

router.post("/createPostJob", createPostJob);
router.post("/updatePostJob", updatePostJob);
router.get("/getJobsByUser", getJobsByUser);
router.delete("/deletePostJob/:jobId", deletePostJob);

router.get("/getEmployees", getEmployees);

module.exports = router;
