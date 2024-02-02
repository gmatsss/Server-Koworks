const TestScores = require("../../models/TestScores"); // Update the path accordingly
const User = require("../../models/User"); // Update the path accordingly+
const { getGridFS } = require("../../db/db");

exports.updateTestScores = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "You are not authorized." });
    }

    const userId = req.user._id;
    let testScores = await TestScores.findOne({ user: userId });

    if (!testScores) {
      testScores = new TestScores({ user: userId });
    }

    const bucket = getGridFS();

    const uploadFile = async (file, fieldName) => {
      const filename = `${fieldName}_${userId}`;
      const existingFile = await bucket.find({ filename }).toArray();

      if (existingFile.length > 0) {
        await bucket.delete(existingFile[0]._id);
      }

      return new Promise((resolve, reject) => {
        const uploadStream = bucket.openUploadStream(filename, {
          contentType: file.mimetype,
        });
        uploadStream.write(file.data);
        uploadStream.end();

        uploadStream.on("finish", (file) => {
          console.log(`File uploaded: ${file._id}`);
          resolve(file._id); // Return the file ID from GridFS
        });
        uploadStream.on("error", reject);
      });
    };

    // Check if there are files to process
    if (req.files && Object.keys(req.files).length > 0) {
      const fileKeys = Object.keys(req.files);
      for (let key of fileKeys) {
        const fileId = await uploadFile(req.files[key], key);

        // Determine the category and field name based on the key
        if (key === "disc_img") {
          testScores.disc.disc_img = fileId;
        } else if (key === "iq_img") {
          testScores.iq.iq_img = fileId;
        } else if (key === "english_img") {
          testScores.english.english_img = fileId;
        }
      }
    }

    // Update the non-file fields
    for (let key in req.body) {
      if (Object.prototype.hasOwnProperty.call(req.body, key)) {
        const [category, subfield] = key.split(".");
        if (category && subfield && testScores[category]) {
          testScores[category][subfield] = req.body[key];
        }
      }
    }

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
