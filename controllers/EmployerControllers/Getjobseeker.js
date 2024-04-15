const { getGridFS } = require("../../db/db");
const HiredApplicant = require("../../models/HiredApplicant");
const JobApplicationSchema = require("../../models/JobApplicationSchema");
const PostJob = require("../../models/PostJob");
const User = require("../../models/User");

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
  const gfs = getGridFS();

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
      .lean();

    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    // Fetch application status and convert images to base64 for each applicant
    const applicantsDetailsPromises = job.applicants.map(async (applicant) => {
      const application = await JobApplicationSchema.findOne({
        job: jobId,
        applicant: applicant._id,
      }).lean();

      // Check if imgId exists and fetch image data
      if (applicant.employeeProfile && applicant.employeeProfile.img) {
        try {
          const imgId = applicant.employeeProfile.img;
          // Convert the image to base64
          applicant.employeeProfile.imageData = await streamToBase64(
            gfs.openDownloadStream(imgId)
          );
        } catch (imgError) {
          console.error(
            "Error fetching image with ID:",
            applicant.employeeProfile.img,
            imgError
          );
        }
      }

      return {
        ...applicant,
        applicationStatus: application ? application.status : "Not Applied",
      };
    });

    // Await all the promises to resolve
    const applicantsWithDetails = await Promise.all(applicantsDetailsPromises);

    res.json({
      success: true,
      job: { ...job, applicants: applicantsWithDetails },
    });
  } catch (error) {
    console.error("Failed to fetch applicants:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching applicants.",
    });
  }
};

exports.updateApplication = async (req, res) => {
  const { jobId, applicantId, status, notes } = req.body; // Include notes in the destructured request body

  try {
    const application = await JobApplicationSchema.findOneAndUpdate(
      { job: jobId, applicant: applicantId },
      {
        status: status,
        Employerfeedback: notes,
      },
      { new: true }
    );

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    if (status === "hired") {
      // Check if a hired record already exists, update it if it does, or create a new one if it doesn't
      const updateData = {
        job: application.job,
        applicant: application.applicant,
        feedback: notes,
        hiredAt: new Date(), // Consider if you want to update this field on each modification
      };

      const newHire = await HiredApplicant.findOneAndUpdate(
        { job: application.job, applicant: application.applicant },
        updateData,
        { new: true, upsert: true } // Upsert option will create a new document if no documents match the filter
      );
    }

    res.json({ success: true, application });
  } catch (error) {
    console.error("Error updating application status:", error);
    res.status(500).json({ message: "Failed to update application status" });
  }
};

async function streamToBase64(stream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    stream.on("data", (chunk) => chunks.push(chunk));
    stream.on("end", () => resolve(Buffer.concat(chunks).toString("base64")));
    stream.on("error", (error) => {
      console.error("Stream to base64 conversion error:", error);
      reject(error);
    });
  });
}
