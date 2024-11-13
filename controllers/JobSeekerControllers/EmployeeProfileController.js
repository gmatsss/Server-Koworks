const User = require("../../models/User");
const EmployeeProfile = require("../../models/EmployeeProfile");
const { getGridFS } = require("../../db/db");
const VerificationStatusSchema = require("../../models/VerificationStatusSchema");

exports.createEmployeeProfile = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "You are not authorized." });
    }

    const userId = req.user._id;
    const user = await User.findById(userId).populate("verificationStatus");
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const employeeProfile = new EmployeeProfile({
      ...req.body,
      user: user._id,
    });

    await employeeProfile.save();
    user.employeeProfile = employeeProfile._id;

    if (user.verificationStatus) {
      if (!user.verificationStatus.profileCompleted) {
        user.verificationStatus.profileCompleted = true;
        user.verificationStatus.idScore += 10;
        await user.verificationStatus.save();
      }
    } else {
      const newVerificationStatus = new VerificationStatusSchema({
        profileCompleted: true,
        idScore: 10,
      });
      await newVerificationStatus.save();
      user.verificationStatus = newVerificationStatus._id;
    }

    await user.save();

    res.status(201).json({
      message: "Employee profile created successfully.",
      data: employeeProfile,
    });
  } catch (error) {
    res.status(500).json({
      message: "An error occurred while creating the employee profile.",
    });
  }
};

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

    const uploadedFile = req.files ? req.files.img : null;

    if (uploadedFile) {
      const bucket = getGridFS();

      const existingFile = await bucket
        .find({ filename: `profile_${userId}` })
        .next();
      if (existingFile) {
        await bucket.delete(existingFile._id);
      }

      const uploadStream = bucket.openUploadStream(`profile_${userId}`, {
        contentType: uploadedFile.mimetype,
      });
      uploadStream.write(uploadedFile.data);
      uploadStream.end();

      await new Promise((resolve, reject) => {
        uploadStream.on("finish", (file) => {
          user.employeeProfile.img = file._id;
          resolve();
        });
        uploadStream.on("error", reject);
      });
    } else {
      const fieldsToUpdate = Object.keys(req.body);
      fieldsToUpdate.forEach((field) => {
        user.employeeProfile[field] = req.body[field];
      });
    }

    await user.employeeProfile.save();
    res.status(200).json({
      message: "Employee profile updated successfully.",
      data: user.employeeProfile,
    });
  } catch (error) {
    res.status(500).json({
      message: "An error occurred while updating the employee profile.",
    });
  }
};

exports.getEmployeeProfile = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "You are not authorized." });
    }
    const userId = req.user._id;
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
    res.status(500).json({
      message: "An error occurred while retrieving the employee profile.",
    });
  }
};
