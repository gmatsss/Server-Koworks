const mongoose = require("mongoose");
const User = require("../../models/User");
const PostJob = require("../../models/PostJob");
const Pinjob = require("../../models/Pinjob");
const BusinessProfile = require("../../models/BusinessProfileSchema");
const { getGridFS } = require("../../db/db");
const JobApplicationSchema = require("../../models/JobApplicationSchema");

exports.createPinJob = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "You are not authorized." });
    }

    const userId = req.user._id;
    const { jobId, notes } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const job = await PostJob.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: "Job not found." });
    }

    const pinJob = new Pinjob({
      user: userId,
      job: jobId,
      notes,
    });

    await pinJob.save();

    if (!user.pinnedJobs) {
      user.pinnedJobs = [];
    }
    user.pinnedJobs.push(pinJob._id);
    await user.save();

    res.status(201).json({
      success: true,
      message: "Job pinned successfully.",
      data: pinJob,
    });
  } catch (error) {
    res.status(500).json({
      message: "An error occurred while pinning the job.",
    });
  }
};

exports.unpinJob = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "User is not authenticated." });
    }

    const userId = req.user._id;
    const { jobId } = req.params;

    const pin = await Pinjob.findOneAndDelete({
      user: userId,
      job: jobId,
    });

    if (!pin) {
      return res
        .status(404)
        .json({ message: "Pin not found or already removed." });
    }

    res
      .status(200)
      .json({ message: "Job successfully unpinned.", success: true });
  } catch (error) {
    res.status(500).json({ message: "Server error while unpinning the job." });
  }
};

exports.getPinJobs = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "You are not authorized." });
    }

    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const pinJobs = await Pinjob.find({ user: userId })
      .populate(
        "job",
        "jobTitle jobDescription salaryType salaryLow salaryHigh salaryExact employmentType experience workingHours jobSkills selectedCategory status idProof created"
      )
      .exec();

    if (!pinJobs.length) {
      return res.status(404).json({ message: "No pinned jobs found." });
    }

    res.status(200).json({
      success: true,
      count: pinJobs.length,
      data: pinJobs,
    });
  } catch (error) {
    res.status(500).json({
      message: "An error occurred while fetching the pinned jobs.",
    });
  }
};

exports.updatePinJobNotes = async (req, res) => {
  const { pinJobId, notes } = req.body;

  if (!pinJobId) {
    return res
      .status(400)
      .json({ success: false, message: "PinJob ID is required." });
  }

  try {
    const pinJob = await Pinjob.findById(pinJobId);

    if (!pinJob) {
      return res
        .status(404)
        .json({ success: false, message: "PinJob not found." });
    }

    if (req.user._id.toString() !== pinJob.user.toString()) {
      return res
        .status(403)
        .json({
          success: false,
          message: "Unauthorized to update this PinJob.",
        });
    }

    pinJob.notes = notes;
    await pinJob.save();

    res.json({
      success: true,
      message: "PinJob notes updated successfully",
      pinJob,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error while updating PinJob notes",
    });
  }
};

exports.getAllJobs = async (req, res) => {
  try {
    const gfs = getGridFS();

    let jobs = await PostJob.find()
      .populate({
        path: "user",
        select: "fullname email businessProfile",
        populate: {
          path: "businessProfile",
          select: "img",
        },
      })
      .lean();

    jobs = await Promise.all(
      jobs.map(async (job) => {
        let imageData = null;
        let isPinned = false;

        if (job.user.businessProfile && job.user.businessProfile.img) {
          try {
            const imgId = job.user.businessProfile.img;
            imageData = await streamToBase64(gfs.openDownloadStream(imgId));
          } catch (imgError) {
            console.error("Error fetching image with ID:", imgId, imgError);
          }
        }

        if (req.user) {
          const userId = req.user._id;
          const pinStatus = await Pinjob.findOne({
            user: userId,
            job: job._id,
          });
          isPinned = !!pinStatus;
        }

        return {
          ...job,
          isPinned,
          businessProfileImage: imageData,
        };
      })
    );

    res.status(200).json({
      success: true,
      count: jobs.length,
      data: jobs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error: Unable to retrieve jobs.",
    });
  }
};

exports.getAllJobsForEmployers = async (req, res) => {
  try {
    let jobs = await PostJob.find({}).select("jobTitle").lean();

    res.status(200).json({
      success: true,
      count: jobs.length,
      data: jobs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error: Unable to retrieve job titles.",
    });
  }
};

async function streamToBase64(stream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    stream.on("data", (chunk) => chunks.push(chunk));
    stream.on("end", () => resolve(Buffer.concat(chunks).toString("base64")));
    stream.on("error", reject);
  });
}

exports.applyForJob = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "User is not authenticated." });
  }

  const { jobId } = req.params;
  const userId = req.user._id;

  try {
    const existingApplication = await JobApplicationSchema.findOne({
      job: jobId,
      applicant: userId,
    });

    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: "You have already applied for this job.",
      });
    }

    const application = new JobApplicationSchema({
      job: jobId,
      applicant: userId,
    });

    await application.save();

    await PostJob.findByIdAndUpdate(jobId, {
      $addToSet: { applicants: userId },
    });

    res
      .status(201)
      .json({ success: true, message: "Application submitted successfully." });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "An error occurred while applying for the job.",
    });
  }
};

exports.checkApplicationStatus = async (req, res) => {
  const { jobId } = req.params;
  const userId = req.user._id;

  try {
    const application = await JobApplicationSchema.findOne({
      job: jobId,
      applicant: userId,
    }).exec();

    if (application) {
      return res
        .status(200)
        .json({ hasApplied: true, status: application.status });
    } else {
      return res.status(200).json({ hasApplied: false });
    }
  } catch (error) {
    return res
      .status(500)
      .send("An error occurred while checking the application status.");
  }
};

exports.getUserJobApplications = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "User is not authenticated." });
  }

  const userId = req.user._id;

  try {
    const applications = await JobApplicationSchema.find({ applicant: userId })
      .populate({
        path: "job",
        model: "PostJob",
        populate: {
          path: "user",
          model: "User",
          populate: {
            path: "businessProfile",
            model: "BusinessProfile",
          },
        },
      })
      .exec();

    res.json(applications);
  } catch (error) {
    res.status(500).send("An error occurred while fetching job applications.");
  }
};
