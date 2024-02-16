const express = require("express");

const router = express.Router();

// Controllers

const {
  createEmployeeProfile,
  updateEmployeeProfile,
  getEmployeeProfile,
} = require("../controllers/JobSeekerControllers/EmployeeProfileController"); // Updated the controller import

const {
  getTestScoresByUserId,
  updateTestScores,
} = require("../controllers/JobSeekerControllers/TestScore");

const {
  createSkill,
  updateSkill,
  getSkill,
} = require("../controllers/JobSeekerControllers/SkillController");

const {
  getAllJobs,
  createPinJob,
  unpinJob,
  getPinJobs,
  updatePinJobNotes,
} = require("../controllers/JobSeekerControllers/Joblist");

//testscore
router.post("/updateTestScores", updateTestScores);
router.get("/getTestScoresByUserId", getTestScoresByUserId);

//EmployeeProfile
router.post("/Createprofile", createEmployeeProfile);
router.post("/Updateprofile", updateEmployeeProfile);
router.get("/profile", getEmployeeProfile);

//Skillratings
router.post("/createSkill", createSkill);
router.post("/updateSkill", updateSkill);
router.get("/getSkill", getSkill);

//joblist
router.get("/getAllJobs", getAllJobs);
router.get("/getPinJobs", getPinJobs);
router.post("/createPinJob", createPinJob);
router.post("/updatePinJobNotes", updatePinJobNotes);
router.delete("/unpinJob/:jobId", unpinJob);

module.exports = router;
