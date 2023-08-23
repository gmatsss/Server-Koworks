const User = require("../../models/User");
const EmployeeProfile = require("../../models/EmployeeProfile");

// Controller for creating an EmployeeProfile
exports.createEmployeeProfile = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "You are not authorized." });
    }
    const userId = req.user._id; // Assuming you have user ID from session or JWT

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const employeeProfile = new EmployeeProfile({
      ...req.body,
      user: user._id,
    });

    await employeeProfile.save();

    user.employeeProfile = employeeProfile._id;
    await user.save();

    res.status(201).json({
      message: "Employee profile created successfully.",
      data: employeeProfile,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "An error occurred while creating the employee profile.",
    });
  }
};

// Controller for updating an EmployeeProfile
exports.updateEmployeeProfile = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "You are not authorized." });
    }
    const userId = req.user._id;
    const user = await User.findById(userId).populate("employeeProfile");

    if (!user || !user.employeeProfile) {
      return res.status(404).json({ message: "Employee profile not found." });
    }

    // Check if the img field is present in the request body
    if (req.body.img) {
      user.employeeProfile.img = req.body.img;
      await user.employeeProfile.save();
      return res.status(200).json({
        message: "Profile image updated successfully.",
        data: user.employeeProfile,
      });
    }

    // If img is not present, update other fields
    const fieldsToUpdate = Object.keys(req.body);
    fieldsToUpdate.forEach((field) => {
      user.employeeProfile[field] = req.body[field];
    });

    await user.employeeProfile.save();

    res.status(200).json({
      message: "Employee profile updated successfully.",
      data: user.employeeProfile,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "An error occurred while updating the employee profile.",
    });
  }
};

// Controller for retrieving an EmployeeProfile
exports.getEmployeeProfile = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "You are not authorized." });
    }
    const userId = req.user._id; // Assuming you have user ID from session or JWT
    const user = await User.findById(userId).populate("employeeProfile");

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (!user.employeeProfile) {
      return res
        .status(404)
        .json({ message: "Employee profile not found for this user." });
    }

    res.status(200).json({
      message: "Employee profile retrieved successfully.",
      data: user.employeeProfile,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "An error occurred while retrieving the employee profile.",
    });
  }
};
