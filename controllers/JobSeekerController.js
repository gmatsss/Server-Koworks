const DATE = require("./date");
const JobSeeker = require("../models/JobSeekerModel");
const createError = require("http-errors");
//hasing password
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const passport = require("passport");

exports.register_jobseeker = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const oldUser = await JobSeeker.findOne({ email });

    if (oldUser) {
      return res.status(409).json({ err: "User already Exist" });
    }

    //Encrypt user password
    encryptedPassword = await bcrypt.hash(password, 10);

    // Create user in our database
    const user = await JobSeeker.create({
      fullname: name,
      email: email.toLowerCase(), // sanitize: convert email to lowercase
      password: encryptedPassword,
      role: "employee",
    });

    res.status(200).json({ data: user, msg: "Register Complete" });
  } catch (error) {
    console.log(error);
  }
};

exports.login_jobseeker = async (req, res, next) => {
  try {
    passport.authenticate("local", (err, user, info) => {
      if (err) return next(err);
      if (!user)
        return res
          .status(401)
          .json({ message: info.message || "No user exists" });

      req.login(user, {}, (err) => {
        if (err) return next(err);
        return res
          .status(200)
          .json({ user: req.user, message: "Login Success" });
      });
    })(req, res, next);
  } catch (error) {
    console.log(error);
  }
};

exports.get_jobseeker = async (req, res) => {
  if (req.isAuthenticated()) {
    console.log(req.user);
    return res.status(200).json({ isLoggedIn: true, user: req.user });
  } else {
    return res.status(200).json({ isLoggedIn: false });
  }
};

exports.logout_jobseeker = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Error during logout:", err);
      return res
        .status(500)
        .json({ message: "Logout failed. Please try again." });
    }

    // Optionally, you can clear the user object if it's stored in the request
    req.user = null;

    res.status(200).json({ message: "Successfully logged out." });
  });
};

exports.update_jobseeker = async (req, res) => {
  try {
    const { currentEmail, email } = req.body;

    if (!currentEmail) {
      return res.status(400).json({
        err: "Current email is required for updating.",
        success: false,
      });
    }

    const user = await JobSeeker.findOne({ email: currentEmail });

    if (!user) {
      return res.status(404).json({ err: "User not found.", success: false });
    }

    if (email && email !== currentEmail) {
      const existingUser = await JobSeeker.findOne({ email: email });
      if (existingUser) {
        return res
          .status(409)
          .json({ err: "Email is already in use.", success: false });
      }
      user.email = email;
    }

    const updatableFields = ["fullname"];

    Object.keys(req.body).forEach((field) => {
      if (updatableFields.includes(field)) {
        user[field] = req.body[field];
      }
    });

    if (req.body.newPassword) {
      if (req.body.newPassword !== req.body.confirmPassword) {
        return res.status(400).json({
          err: "New password and confirm password do not match.",
          success: false,
        });
      }

      const isCurrentPasswordValid = await bcrypt.compare(
        req.body.currentPassword,
        user.password
      );
      if (!isCurrentPasswordValid) {
        return res
          .status(400)
          .json({ err: "Current password is incorrect.", success: false });
      }

      user.password = await bcrypt.hash(req.body.newPassword, 10);
    }

    await user.save();

    res
      .status(200)
      .json({ data: user, msg: "User updated successfully!", success: true });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      err: "An error occurred while updating the user.",
      success: false,
    });
  }
};
