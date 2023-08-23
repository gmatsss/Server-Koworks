const mongoose = require("mongoose");
const Skill = require("../../models/Skill");
const User = require("../../models/User");

// Controller for creating a Skill
exports.createSkill = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "You are not authorized." });
    }
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const skillsData = req.body;
    for (let category in skillsData) {
      const skillsArray = [];
      for (let skillName in skillsData[category]) {
        skillsArray.push({
          name: skillName,
          rating: skillsData[category][skillName],
        });
      }
      skillsData[category] = skillsArray;
    }

    const skill = new Skill({
      ...skillsData,
      user: user._id,
    });

    await skill.save();

    user.skill = skill._id;
    await user.save();

    res.status(201).json({
      success: true, // Add this flag
      message: "Skill created successfully.",
      data: skill,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "An error occurred while creating the skill.",
    });
  }
};

// Controller for updating a Skill
exports.updateSkill = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "You are not authorized." });
    }
    const userId = req.user._id;

    const user = await User.findById(userId).populate("skill");
    if (!user || !user.skill) {
      return res.status(404).json({ message: "Skill not found." });
    }

    const fieldsToUpdate = Object.keys(req.body);
    fieldsToUpdate.forEach((field) => {
      user.skill[field] = req.body[field];
    });

    await user.skill.save();

    res.status(200).json({
      message: "Skill updated successfully.",
      data: user.skill,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "An error occurred while updating the skill.",
    });
  }
};

// Controller for retrieving a Skill
exports.getSkill = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "You are not authorized." });
    }
    const userId = req.user._id;

    const user = await User.findById(userId).populate("skill");
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (!user.skill) {
      return res
        .status(404)
        .json({ message: "Skill not found for this user." });
    }

    res.status(200).json({
      message: "Skill retrieved successfully.",
      data: user.skill,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "An error occurred while retrieving the skill.",
    });
  }
};
