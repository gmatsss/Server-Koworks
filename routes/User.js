const express = require("express");

const router = express.Router();
const {
  register_user,
  login_user,
  get_user,
  logout_user,
  update_user,
  get_user_profile_image,
  getUserWithDetails,
} = require("../controllers/User");

router.post("/register", register_user);
router.post("/login", login_user);
router.get("/getjobseek", get_user);
router.post("/logoutjobseek", logout_user);
router.post("/updateJSeeker", update_user);
router.get("/getUserProfileImage/:fileId", get_user_profile_image);
router.get("/getUserWithDetails", getUserWithDetails);

module.exports = router;
