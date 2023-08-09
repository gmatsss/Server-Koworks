const express = require("express");

const router = express.Router();

//contorllers
const {
  register_jobseeker,
  login_jobseeker,
  get_jobseeker,
  logout_jobseeker,
} = require("../controllers/JobSeekerController");

router.post("/register", register_jobseeker);
router.post("/login", login_jobseeker);
router.get("/getjobseek", get_jobseeker);
router.get("/logoutjobseek", logout_jobseeker);

module.exports = router;
