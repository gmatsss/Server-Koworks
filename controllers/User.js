const User = require("../models/User");
const bcrypt = require("bcryptjs");
const passport = require("passport");
const TestScores = require("../models/TestScores");

const saltRounds = 10;

exports.register_user = async (req, res) => {
  try {
    // Check if user with the provided email already exists
    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);

    const newUser = new User({
      fullname: req.body.fullname,
      email: req.body.email,
      password: hashedPassword,
      role: req.body.role,
      created: new Date().toISOString(), // Setting the created field to the current date and time
    });

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
    req.logIn(user, (err) => {
      if (err) {
        return next(err);
      }
      return res
        .status(200)
        .json({ message: "Login successful", user: req.user });
    });
  })(req, res, next);
};

// exports.get_user = async (req, res) => {
//   console.log("Endpoint hit:", req.originalUrl); // Log the endpoint hit

//   if (req.isAuthenticated()) {
//     try {
//       const user = await User.findById(req.user._id)
//         .populate("employeeProfile") // Populate the employeeProfile field
//         .populate("skill");

//       if (!user) {
//         return res.status(404).json({
//           isLoggedIn: true,
//           user: null,
//           message: "User not found.",
//         });
//       }

//       // Fetch the TestScores data for the user
//       const testScores = await TestScores.findOne({ user: req.user._id });

//       res.status(200).json({
//         isLoggedIn: true,
//         user: {
//           ...user._doc,
//           employeeProfile: user.employeeProfile,
//           testScores: user.testScores, // Include the TestScores data
//         },
//         message: "User fetched successfully.",
//       });
//     } catch (err) {
//       console.log(err);
//       res.status(500).json({
//         isLoggedIn: true,
//         user: null,
//         message: "Error fetching user data.",
//       });
//     }
//   } else {
//     res.status(200).json({
//       isLoggedIn: false,
//       user: null,
//       message: "User not logged in.",
//     });
//   }
// };

exports.get_user = async (req, res) => {
  console.log("Endpoint hit:", req.originalUrl); // Log the endpoint hit

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

    if (userRole === "employee") {
      user = await User.findById(userId)
        .populate("employeeProfile")
        .populate("skill")
        .populate("testScores")
        .exec();
    } else if (userRole === "employer") {
      user = await User.findById(userId).populate("businessProfile").exec();
    } else {
      user = await User.findById(userId).exec();
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
      message: "User fetched successfully.",
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      isLoggedIn: true,
      user: null,
      message: "Error fetching user data.",
    });
  }
};

exports.logout_user = (req, res, next) => {
  console.log("Endpoint hit:", req.originalUrl);

  req.logout(function (err) {
    if (err) {
      console.error("Error during logout:", err);
      return res
        .status(500)
        .json({ message: "Logout failed. Please try again." });
    }

    // Destroy the session and clear the cookie
    req.session.destroy((sessionErr) => {
      if (sessionErr) {
        console.error("Error destroying session during logout:", sessionErr);
        return res
          .status(500)
          .json({ message: "Logout failed. Please try again." });
      }

      if (req.isAuthenticated()) {
        console.error("User still authenticated after logout.");
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
    console.error(error);
    res.status(500).json({
      message: "An error occurred while updating the user.",
      success: false,
    });
  }
};
