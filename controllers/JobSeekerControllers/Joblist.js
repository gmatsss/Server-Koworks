const mongoose = require("mongoose");
const User = require("../../models/User");
const PostJob = require("../../models/PostJob");
const Pinjob = require("../../models/Pinjob");
const BusinessProfile = require("../../models/BusinessProfileSchema");
const { getGridFS } = require("../../db/db");

exports.createPinJob = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "You are not authorized." });
    }

    const userId = req.user._id;
    const { jobId, notes } = req.body; // Assuming these are passed in the request body

    // Validate user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Validate job
    const job = await PostJob.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: "Job not found." });
    }

    // Create PinJob
    const pinJob = new Pinjob({
      user: userId,
      job: jobId,
      notes: notes, // Optional, depending on your schema
    });

    await pinJob.save();

    res.status(201).json({
      success: true,
      message: "Job pinned successfully.",
      data: pinJob,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "An error occurred while pinning the job.",
    });
  }
};

exports.unpinJob = async (req, res) => {
  try {
    const userId = req.user._id; // Assuming you have middleware to set req.user
    const { jobId } = req.params; // Assuming the job ID is passed as a URL parameter

    console.log(jobId);
    console.log(userId);

    // Find the pin by user and job IDs
    const pin = await Pinjob.findOneAndDelete({
      user: userId,
      job: jobId,
    });

    console.log(pin);

    if (!pin) {
      return res
        .status(404)
        .json({ message: "Pin not found or already removed." });
    }

    res
      .status(200)
      .json({ message: "Job successfully unpinned.", success: true });
  } catch (error) {
    console.error("Error unpinning job:", error);
    res.status(500).json({ message: "Server error while unpinning the job." });
  }
};

exports.getAllJobs = async (req, res) => {
  try {
    const userId = req.user._id; // Assuming req.user is populated by your authentication middleware
    const gfs = getGridFS();

    // Fetch all jobs with user details populated
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

    // Check if each job is pinned by the current user and fetch business profile image
    const jobsWithPinStatusAndImage = await Promise.all(
      jobs.map(async (job) => {
        const isPinned = await Pinjob.findOne({ user: userId, job: job._id });
        let imageData = null;

        // Fetch business profile image if available
        if (job.user.businessProfile && job.user.businessProfile.img) {
          try {
            const imgId = job.user.businessProfile.img;
            imageData = await streamToBase64(gfs.openDownloadStream(imgId));
          } catch (imgError) {
            console.error("Error fetching image with ID:", imgId, imgError);
            // Handle missing image or other errors as needed
          }
        }

        return {
          ...job,
          isPinned: !!isPinned,
          businessProfileImage: imageData, // Include the image data in the response
        };
      })
    );

    res.status(200).json({
      success: true,
      count: jobsWithPinStatusAndImage.length,
      data: jobsWithPinStatusAndImage,
    });
  } catch (error) {
    console.log("Error fetching jobs:", error);
    res.status(500).json({
      success: false,
      message: "Server error: Unable to retrieve jobs.",
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
