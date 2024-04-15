const mongoose = require("mongoose");
const Skill = require("../../models/Skill");
const User = require("../../models/User");
const VerificationStatusSchema = require("../../models/VerificationStatusSchema");

// Controller for creating a Skill
exports.createSkill = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "You are not authorized." });
    }
    const userId = req.user._id;

    let user = await User.findById(userId).populate("verificationStatus");
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const skillsData = req.body;
    const formattedSkillsData = {};

    for (let category in skillsData) {
      if (category !== "other") {
        const skillsArray = [];
        for (let skillName in skillsData[category]) {
          skillsArray.push({
            name: skillName,
            rating: skillsData[category][skillName],
          });
        }
        formattedSkillsData[category] = skillsArray;
      }
    }

    if (skillsData.other) {
      formattedSkillsData.other = skillsData.other.map((skill) => ({
        name: skill.name,
        rating: skill.value,
      }));
    }

    if (user.skill) {
      await Skill.findByIdAndUpdate(
        user.skill,
        { ...formattedSkillsData, user: user._id },
        { new: true }
      );
    } else {
      const skill = new Skill({ ...formattedSkillsData, user: user._id });
      try {
        await skill.save();
        user.skill = skill._id;
        await user.save();
      } catch (error) {
        console.error("Saving skill error:", error);
        // Handle error
      }
    }

    // Check if user has a VerificationStatus, create if not
    if (!user.verificationStatus) {
      const verificationStatus = new VerificationStatusSchema({
        skillCompleted: true, // Since we're creating a skill, mark this as true
        idScore: 10, // Initial score for completing skill
      });
      await verificationStatus.save();
      user.verificationStatus = verificationStatus._id;
    } else if (!user.verificationStatus.skillCompleted) {
      // If VerificationStatus exists but skill not completed
      user.verificationStatus.skillCompleted = true;
      user.verificationStatus.idScore = Math.min(
        user.verificationStatus.idScore + 10,
        100
      ); // Increment ID score by 10, not exceeding 100
      await user.verificationStatus.save();
    }

    await user.save();

    res.status(201).json({
      success: true,
      message: "Skill created successfully.",
    });
  } catch (error) {
    console.error("Error detail:", error.message); // Provides more specific error detail
    res.status(500).json({
      message: "An error occurred while creating the skill.",
      error: error.message, // Optionally send back error details to the client for debugging
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
