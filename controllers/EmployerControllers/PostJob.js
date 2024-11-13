const BusinessProfileSchema = require("../../models/BusinessProfileSchema");
const PostJob = require("../../models/PostJob");
const User = require("../../models/User");

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

    const businessProfile = await BusinessProfileSchema.findOne({
      user: userId,
    });
    if (!businessProfile) {
      return res
        .status(403)
        .json({
          message:
            "Employer must have a Business Profile to post a job. Please go to edit account",
        });
    }

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
      applicants: [],
      hits: 0,
      status: "open",
    });

    await postJob.save();

    user.postedJobs.push(postJob._id);
    await user.save();

    res
      .status(201)
      .json({
        success: true,
        message: "Job posted successfully.",
        data: postJob,
      });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "An error occurred while posting the job." });
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
    res.status(200).json({ success: true, data: jobs });
  } catch (error) {
    console.error("Error fetching jobs for user:", error);
    res
      .status(500)
      .json({
        message: "An error occurred while fetching job postings for the user.",
      });
  }
};

exports.updatePostJob = async (req, res) => {
  try {
    const jobId = req.body._id;
    const postJob = await PostJob.findById(jobId);
    if (!postJob) {
      return res.status(404).json({ message: "Job not found." });
    }

    if (!req.user || postJob.user.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "You are not authorized to update this job." });
    }

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

    res
      .status(200)
      .json({
        success: true,
        message: "Job updated successfully.",
        data: postJob,
      });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "An error occurred while updating the job." });
  }
};

exports.deletePostJob = async (req, res) => {
  try {
    const jobId = req.params.jobId;
    const postJob = await PostJob.findById(jobId);
    if (!postJob) {
      return res.status(404).json({ message: "Job not found." });
    }

    if (!req.user || postJob.user.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "You are not authorized to delete this job." });
    }

    await PostJob.deleteOne({ _id: jobId });

    await User.updateOne(
      { _id: req.user._id },
      { $pull: { postedJobs: jobId } }
    );

    res
      .status(200)
      .json({ success: true, message: "Job deleted successfully." });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "An error occurred while deleting the job." });
  }
};
