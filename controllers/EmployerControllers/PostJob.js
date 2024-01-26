const PostJob = require("../../models/PostJob"); // Update the path to your PostJob model
const User = require("../../models/User"); // Update the path to your User model

exports.createPostJob = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "You are not authorized." });
    }
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Extract job details from request body
    const {
      jobTitle,
      jobDescription,
      salaryType,
      salaryLow,
      salaryHigh,
      salaryExact,
      idProof,
      employmentType,
      experience,
      workingHours,
      jobSkills,
      selectedCategory,
    } = req.body;

    // Create a new PostJob instance
    const postJob = new PostJob({
      user: userId,
      jobTitle,
      jobDescription,
      salaryType,
      salaryLow,
      salaryHigh,
      salaryExact,
      idProof,
      employmentType,
      experience,
      workingHours,
      jobSkills,
      selectedCategory,
      applicants: [], // Initialize as an empty array
      hits: 0, // Initialize with 0 views
      status: "open", // Default status
    });

    await postJob.save();

    // Optionally, you can add the job to the user's postedJobs array
    user.postedJobs.push(postJob._id);
    await user.save();

    res.status(201).json({
      success: true,
      message: "Job posted successfully.",
      data: postJob,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "An error occurred while posting the job.",
    });
  }
};

exports.getJobsByUser = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "You are not authorized." });
    }
    const userId = req.user._id;
    const jobs = await PostJob.find({ user: userId }).populate(
      "user",
      "fullname email"
    );
    res.status(200).json({
      success: true,
      data: jobs,
    });
  } catch (error) {
    console.error("Error fetching jobs for user:", error);
    res.status(500).json({
      message: "An error occurred while fetching job postings for the user.",
    });
  }
};

exports.updatePostJob = async (req, res) => {
  try {
    const jobId = req.body._id; // Assuming the job ID is passed as a URL parameter

    // Find the job by ID
    const postJob = await PostJob.findById(jobId);
    if (!postJob) {
      return res.status(404).json({ message: "Job not found." });
    }

    // Check if the logged-in user is the owner of the job
    if (!req.user || postJob.user.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "You are not authorized to update this job." });
    }

    // Extract job details from request body
    const {
      jobTitle,
      jobDescription,
      salaryType,
      salaryLow,
      salaryHigh,
      salaryExact,
      idProof,
      employmentType,
      experience,
      workingHours,
      jobSkills,
      selectedCategory,
    } = req.body;

    // Update the job details
    postJob.jobTitle = jobTitle || postJob.jobTitle;
    postJob.jobDescription = jobDescription || postJob.jobDescription;
    postJob.salaryType = salaryType || postJob.salaryType;
    postJob.salaryLow = salaryLow !== undefined ? salaryLow : postJob.salaryLow;
    postJob.salaryHigh =
      salaryHigh !== undefined ? salaryHigh : postJob.salaryHigh;
    postJob.salaryExact =
      salaryExact !== undefined ? salaryExact : postJob.salaryExact;
    postJob.idProof = idProof || postJob.idProof;
    postJob.employmentType = employmentType || postJob.employmentType;
    postJob.experience = experience || postJob.experience;
    postJob.workingHours = workingHours || postJob.workingHours;
    postJob.jobSkills = jobSkills || postJob.jobSkills;
    postJob.selectedCategory = selectedCategory || postJob.selectedCategory;

    await postJob.save();

    res.status(200).json({
      success: true,
      message: "Job updated successfully.",
      data: postJob,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "An error occurred while updating the job.",
    });
  }
};

exports.deletePostJob = async (req, res) => {
  try {
    const jobId = req.params.jobId; // Assuming the job ID is passed as a URL parameter

    // Find the job by ID
    const postJob = await PostJob.findById(jobId);
    if (!postJob) {
      return res.status(404).json({ message: "Job not found." });
    }

    // Check if the logged-in user is the owner of the job
    if (!req.user || postJob.user.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "You are not authorized to delete this job." });
    }

    // Delete the job
    await PostJob.deleteOne({ _id: jobId });

    // Optionally, you can also remove the job from the user's postedJobs array
    await User.updateOne(
      { _id: req.user._id },
      { $pull: { postedJobs: jobId } }
    );

    res.status(200).json({
      success: true,
      message: "Job deleted successfully.",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "An error occurred while deleting the job.",
    });
  }
};
