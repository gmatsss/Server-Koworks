const TestScores = require("../../models/TestScores"); // Update the path accordingly
const User = require("../../models/User"); // Update the path accordingly+
const { MongoClient, GridFSBucket } = require("mongodb");

exports.updateTestScores = async (req, res) => {
  try {
    const userId = req.user._id;
    let testScores = await TestScores.findOne({ user: userId });

    if (!testScores) {
      testScores = new TestScores({ user: userId });
    }

    const conn = await MongoClient.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    const db = conn.db();

    // Create a new instance of GridFSBucket
    const bucket = new GridFSBucket(db, {
      bucketName: "uploads",
    });

    const handleFileUpload = async (fieldName, file) => {
      const existingFile = await db.collection("uploads.files").findOne({
        filename: `${fieldName}_${userId}`,
      });

      if (existingFile) {
        await bucket.delete(existingFile._id);
      }

      const uploadStream = bucket.openUploadStream(`${fieldName}_${userId}`, {
        contentType: file.mimetype,
      });
      uploadStream.write(file.data);
      uploadStream.end();

      return new Promise((resolve, reject) => {
        uploadStream.on("finish", (file) => {
          resolve(file._id);
        });
        uploadStream.on("error", reject);
      });
    };

    if (req.files?.disc_img) {
      testScores.disc.disc_img = await handleFileUpload(
        "disc",
        req.files.disc_img
      );
    }
    if (req.files?.iq_img) {
      testScores.iq.iq_img = await handleFileUpload("iq", req.files.iq_img);
    }
    if (req.files?.english_img) {
      testScores.english.english_img = await handleFileUpload(
        "english",
        req.files.english_img
      );
    }

    // Update the fields based on the flattened structure
    testScores.disc.dominance_score =
      req.body["disc.dominance_score"] || testScores.disc.dominance_score;
    testScores.disc.influence_score =
      req.body["disc.influence_score"] || testScores.disc.influence_score;
    testScores.disc.steadiness_score =
      req.body["disc.steadiness_score"] || testScores.disc.steadiness_score;
    testScores.disc.compliance_score =
      req.body["disc.compliance_score"] || testScores.disc.compliance_score;
    testScores.iq.iq_score = req.body["iq.iq_score"] || testScores.iq.iq_score;
    testScores.english.english_score =
      req.body["english.english_score"] || testScores.english.english_score;

    await testScores.save();

    const user = await User.findById(userId);
    if (user) {
      user.testScores = testScores._id;
      await user.save();
    }

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
