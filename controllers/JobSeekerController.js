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
    return res.status(200).json({ isLoggedIn: true, user: req.user });
  } else {
    return res.status(200).json({ isLoggedIn: false });
  }
};

exports.logout_jobseeker = async (req, res) => {
  try {
    req.session.destroy(function (err) {
      res.send(req.user);
    });
  } catch (error) {}
};
