const { getGridFS } = require("../../db/db");
const PostJob = require("../../models/PostJob");
const User = require("../../models/User"); // Adjust the path according to your project structure

exports.getEmployees = async (req, res) => {
  try {
    const employees = await User.find({ role: "employee" })
      .populate("employeeProfile")
      .populate("skill")
      .populate("testScores")
      .populate("verificationStatus")
      .lean();

    // Use the GridFSBucket instance from your db.js module
    const gfs = getGridFS();

    const filteredEmployees = await Promise.all(
      employees.map(async (user) => {
        if (user.employeeProfile && user.employeeProfile.img) {
          // Fetch the image from GridFS
          const imgId = user.employeeProfile.img;
          const downloadStream = gfs.openDownloadStream(imgId);

          return new Promise((resolve, reject) => {
            let data = [];
            downloadStream.on("data", (chunk) => {
              data.push(chunk);
            });
            downloadStream.on("error", (err) => {
              reject(err);
            });
            downloadStream.on("end", () => {
              // Convert the image data to a base64 string or similar depending on your needs
              user.employeeProfile.imageData =
                Buffer.concat(data).toString("base64");
              resolve(user);
            });
          });
        } else {
          return user;
        }
      })
    );

    res.status(200).json({
      message: "Employees retrieved successfully",
      data: filteredEmployees,
    });
  } catch (error) {
    console.error("Error fetching employees:", error);
    res.status(500).json({
      message: "An error occurred while fetching employees.",
    });
  }
};

exports.getApplicantsDetails = async (req, res) => {
  const { jobId } = req.body;

  try {
    const job = await PostJob.findById(jobId)
      .populate({
        path: "applicants",
        select: "-password",
        populate: [
          { path: "employeeProfile", model: "EmployeeProfile" },
          { path: "skill", model: "Skill" },
          { path: "testScores", model: "TestScores" },
          { path: "verificationStatus", model: "VerificationStatus" },
        ],
      })
      .lean(); // Use lean() to return a plain JS object

    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    res.json({ success: true, job: job });
  } catch (error) {
    console.error("Failed to fetch applicants:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching applicants.",
    });
  }
};
