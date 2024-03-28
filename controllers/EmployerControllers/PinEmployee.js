const PinEmployeeSchema = require("../../models/PinEmployeeSchema"); // Adjust the path as necessary
const mongoose = require("mongoose");

exports.createPinEmployee = async (req, res) => {
  try {
    const { user, employee, notes } = req.body;

    const newPin = new PinEmployeeSchema({
      user,
      employee,
      notes,
    });

    const savedPin = await newPin.save();

    res.status(201).json({
      message: "Employee pinned successfully",
      pin: savedPin,
    });
  } catch (error) {
    console.error("Failed to pin employee:", error); // Log the error for debugging
    res.status(500).json({
      message: "Failed to pin employee",
      error: error.message,
    });
  }
};

exports.getPinnedEmployees = async (req, res) => {
  try {
    const userId = req.user.id; // Assuming req.user.id contains the current user's ID

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    // Adjusting to populate multiple fields from the employee reference
    const pinnedEmployees = await PinEmployeeSchema.find({ user: userId })
      .populate({
        path: "employee",

        populate: [
          {
            path: "employeeProfile",
            model: "EmployeeProfile",
          },
          {
            path: "skill",
            model: "Skill",
            // Specify fields if needed
          },
          {
            path: "testScores",
            model: "TestScores",
            // Specify fields if needed
          },
          // Add other paths as needed for verificationStatus, etc.
          {
            path: "verificationStatus",
            model: "VerificationStatus",
            // Specify fields if needed
          },
        ],
      })
      .exec();

    res.status(200).json({
      success: true,
      message: "Pinned employees fetched successfully",
      pinnedEmployees: pinnedEmployees,
    });
  } catch (error) {
    console.error("Failed to fetch pinned employees:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch pinned employees",
      error: error.message,
    });
  }
};

exports.unpinEmployee = async (req, res) => {
  try {
    const userId = req.user.id;
    const { employeeId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const result = await PinEmployeeSchema.findOneAndDelete({
      user: userId,
      employee: employeeId,
    });

    if (result) {
      res.status(200).json({
        message: "Employee unpinned successfully",
      });
    } else {
      res.status(404).json({
        message: "Pin not found",
      });
    }
  } catch (error) {
    res.status(500).json({
      message: "Failed to unpin employee",
      error: error.message,
    });
  }
};

exports.editPinNotes = async (req, res) => {
  const userId = req.user.id;
  const { pinId, notes } = req.body;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ message: "Invalid user ID" });
  }

  if (!mongoose.Types.ObjectId.isValid(pinId)) {
    return res.status(400).json({ message: "Invalid pin ID" });
  }

  try {
    const pinEmployee = await PinEmployeeSchema.findOne({
      _id: pinId,
      user: userId,
    });

    if (!pinEmployee) {
      return res
        .status(404)
        .json({ message: "Pin not found or not authorized" });
    }

    pinEmployee.notes = notes;
    await pinEmployee.save();

    res.status(200).json({
      success: true,
      message: "Notes updated successfully",
      pinEmployee,
    });
  } catch (error) {
    console.error("Error updating pin notes:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update pin notes",
      error: error.message,
    });
  }
};
