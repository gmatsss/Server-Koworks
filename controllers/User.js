const User = require("../models/User");
const bcrypt = require("bcryptjs");
const passport = require("passport");
const TestScores = require("../models/TestScores");
const { getGridFS } = require("../db/db");
const PostJob = require("../models/PostJob");
const Skill = require("../models/Skill");
const EmployeeProfile = require("../models/EmployeeProfile");
const BusinessProfileSchema = require("../models/BusinessProfileSchema");
const VerificationStatusSchema = require("../models/VerificationStatusSchema");

const saltRounds = 10;

exports.register_user = async (req, res) => {
  try {
    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);
    const userFields = {
      fullname: req.body.fullname,
      email: req.body.email,
      password: hashedPassword,
      role: req.body.role,
      created: new Date().toISOString(),
    };

    if (req.body.role === "employer") {
      userFields.postedJobs = [];
    }

    const newUser = new User(userFields);
    await newUser.save();

    res.status(201).json({
      success: true,
      message: "User registered successfully",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error registering user",
      error: err,
    });
  }
};

exports.login_user = (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(401).json({ message: info.message || "Login failed" });
    }
    req.logIn(user, async (err) => {
      if (err) {
        return next(err);
      }

      user.lastLogin = new Date();
      await user.save();

      return res
        .status(200)
        .json({ message: "Login successful", user: req.user });
    });
  })(req, res, next);
};

exports.get_user = async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(200).json({
      isLoggedIn: false,
      user: null,
      message: "User not logged in.",
    });
  }

  try {
    const userId = req.user._id;
    const userRole = req.user.role;
    let user;
    let userProfileImageData = null;

    const bucket = getGridFS();
    const file = await bucket.find({ filename: `profile_${userId}` }).next();

    if (file) {
      userProfileImageData = await new Promise((resolve, reject) => {
        const downloadStream = bucket.openDownloadStream(file._id);
        const chunks = [];
        downloadStream.on("data", (chunk) => {
          chunks.push(chunk);
        });
        downloadStream.on("end", () => {
          const imageBuffer = Buffer.concat(chunks);
          resolve(imageBuffer.toString("base64"));
        });
        downloadStream.on("error", reject);
      });
    }

    if (userRole === "employee") {
      user = await User.findById(userId)
        .populate("employeeProfile")
        .populate("skill")
        .populate("testScores")
        .populate("verificationStatus")
        .exec();
    } else if (userRole === "employer") {
      user = await User.findById(userId).populate("businessProfile").exec();
    }

    if (!user) {
      return res.status(404).json({
        isLoggedIn: true,
        user: null,
        message: "User not found.",
      });
    }

    res.status(200).json({
      isLoggedIn: true,
      user: user,
      profileImageData: userProfileImageData,
      message: "User fetched successfully.",
    });
  } catch (err) {
    res.status(500).json({
      isLoggedIn: true,
      user: null,
      message: "Error fetching user data.",
    });
  }
};

exports.logout_user = (req, res, next) => {
  req.logout(function (err) {
    if (err) {
      return res
        .status(500)
        .json({ message: "Logout failed. Please try again." });
    }

    req.session.destroy((sessionErr) => {
      if (sessionErr) {
        return res
          .status(500)
          .json({ message: "Logout failed. Please try again." });
      }

      if (req.isAuthenticated()) {
        return res
          .status(500)
          .json({ message: "Logout failed. Please try again." });
      }

      res.clearCookie("connect.sid");
      res.status(200).json({ message: "Successfully logged out." });
    });
  });
};

exports.update_user = async (req, res) => {
  const { _id, email, currentPassword, newPassword, confirmPassword } =
    req.body;

  try {
    if (!_id) {
      return res
        .status(400)
        .json({ message: "User ID is required for updating." });
    }

    const user = await User.findById(_id);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email: email });
      if (existingUser) {
        return res
          .status(409)
          .json({ message: "Email is already in use by another user." });
      }
      user.email = email;
    }

    const updatableFields = ["fullname"];
    Object.keys(req.body).forEach((field) => {
      if (updatableFields.includes(field)) {
        user[field] = req.body[field];
      }
    });

    if (newPassword) {
      if (newPassword !== confirmPassword) {
        return res
          .status(400)
          .json({ message: "New password and confirm password do not match." });
      }

      const isCurrentPasswordValid = await bcrypt.compare(
        currentPassword,
        user.password
      );
      if (!isCurrentPasswordValid) {
        return res
          .status(400)
          .json({ message: "Current password is incorrect." });
      }

      user.password = await bcrypt.hash(newPassword, 10);
    }

    await user.save();

    res.status(200).json({
      message: "User updated successfully!",
      data: user,
      success: true,
    });
  } catch (error) {
    res.status(500).json({
      message: "An error occurred while updating the user.",
      success: false,
    });
  }
};

exports.get_user_profile_image = async (req, res) => {
  try {
    const { fileId } = req.params;
    const conn = await MongoClient.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    const db = conn.db();
    const bucket = new GridFSBucket(db, { bucketName: "uploads" });
    const file = await bucket.find({ _id: new ObjectId(fileId) }).next();

    if (file) {
      const downloadStream = bucket.openDownloadStream(file._id);
      downloadStream.pipe(res);
    } else {
      res.status(404).send("Image not found");
    }
  } catch (err) {
    res.status(500).send("Internal Server Error");
  }
};

exports.getUserWithDetails = async (req, res) => {
  try {
    const gfs = getGridFS();
    const users = await User.find().lean();

    for (let user of users) {
      if (user.role === "employer") {
        user.postedJobs = await PostJob.find({ user: user._id }).lean();
        user.businessProfile = await BusinessProfileSchema.findOne({
          user: user._id,
        }).lean();

        if (user.businessProfile && user.businessProfile.img) {
          try {
            const imgId = user.businessProfile.img;
            user.businessProfile.imageData = await streamToBase64(
              gfs.openDownloadStream(imgId)
            );
          } catch (imgError) {
            console.error(
              "Error fetching image with ID:",
              user.businessProfile.img,
              imgError
            );
          }
        }
      } else if (user.role === "employee") {
        user.employeeProfile = await EmployeeProfile.findOne({
          user: user._id,
        }).lean();

        user.skill = await Skill.findOne({ user: user._id }).lean();
        user.verificationStatus = await VerificationStatusSchema.findOne({
          _id: user.verificationStatus,
        }).lean();
        user.testScores = await TestScores.findOne({ user: user._id }).lean();

        if (user.employeeProfile && user.employeeProfile.img) {
          try {
            const imgId = user.employeeProfile.img;
            user.employeeProfile.imageData = await streamToBase64(
              gfs.openDownloadStream(imgId)
            );
          } catch (imgError) {
            console.error(
              "Error fetching employee image with ID:",
              user.employeeProfile.img,
              imgError
            );
          }
        }
      }
    }

    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error while fetching users.",
    });
  }
};

async function streamToBase64(stream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    stream.on("data", (chunk) => chunks.push(chunk));
    stream.on("end", () => resolve(Buffer.concat(chunks).toString("base64")));
    stream.on("error", reject);
  });
}
