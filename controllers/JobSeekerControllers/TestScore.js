const TestScores = require("../../models/TestScores"); // Update the path accordingly

exports.updateTestScores = async (req, res) => {
  try {
    const userId = req.user._id; // Assuming you have user ID from session or JWT

    // Find the TestScores document for the user
    let testScores = await TestScores.findOne({ user: userId });
    if (!testScores) {
      // Option 2: Create a new TestScores document for the user
      testScores = new TestScores({ user: userId });
    }

    // Update the fields
    if (req.body.disc) {
      testScores.disc = {
        ...testScores.disc,
        ...req.body.disc,
      };
    }

    if (req.body.iq) {
      testScores.iq = {
        ...testScores.iq,
        ...req.body.iq,
      };
    }

    if (req.body.english) {
      testScores.english = {
        ...testScores.english,
        ...req.body.english,
      };
    }

    // Save the updated document
    await testScores.save();

    res.status(200).json({
      message: "Test scores updated successfully.",
      data: testScores,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "An error occurred while updating the test scores.",
    });
  }
};

// Controller to get TestScores by user ID
exports.getTestScoresByUserId = async (req, res) => {
  try {
    const userId = req.user._id; // Assuming you have user ID from session or JWT

    const testScores = await TestScores.findOne({ user: userId });

    if (!testScores) {
      return res
        .status(404)
        .json({ message: "Test scores not found for the given user." });
    }

    res.status(200).json({
      message: "Test scores fetched successfully.",
      data: testScores,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "An error occurred while fetching the test scores.",
    });
  }
};
