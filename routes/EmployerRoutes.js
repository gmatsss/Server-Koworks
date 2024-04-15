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
  getApplicantsDetails,
  updateApplication,
} = require("../controllers/EmployerControllers/Getjobseeker");

const {
  createPinEmployee,
  getPinnedEmployees,
  unpinEmployee,
  editPinNotes,
} = require("../controllers/EmployerControllers/PinEmployee");

const {
  getHireApplicant,
} = require("../controllers/EmployerControllers/Hiredapplicant");

router.post("/updateOrCreateProfile", updateOrCreateProfile);
router.get("/getUserProfileImage", getUserProfileImage);

router.post("/createPostJob", createPostJob);
router.post("/updatePostJob", updatePostJob);
router.get("/getJobsByUser", getJobsByUser);
router.delete("/deletePostJob/:jobId", deletePostJob);

router.get("/getEmployees", getEmployees);
router.post("/getApplicantsDetails", getApplicantsDetails);
router.post("/updateApplication", updateApplication);

router.post("/createPinEmployee", createPinEmployee);
router.post("/editPinNotes", editPinNotes);
router.get("/getPinnedEmployees", getPinnedEmployees);
router.delete("/unpinEmployee", unpinEmployee);

router.get("/getHireApplicant", getHireApplicant);

module.exports = router;
