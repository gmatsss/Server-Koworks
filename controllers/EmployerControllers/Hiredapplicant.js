const HiredApplicant = require("../../models/HiredApplicant");

exports.getHireApplicant = async (req, res) => {
  try {
    const hiredApplicants = await HiredApplicant.find({})
      .populate({
        path: "job",
        model: "PostJob",
        populate: {
          path: "user",
          model: "User",
          populate: [
            { path: "employeeProfile", model: "EmployeeProfile" },
            { path: "skill", model: "Skill" },
            { path: "testScores", model: "TestScores" },
            { path: "verificationStatus", model: "VerificationStatus" },
          ],
        },
      })
      .populate({
        path: "applicant",
        model: "User",
        select: "fullname email role lastLogin",
        populate: [
          { path: "employeeProfile", model: "EmployeeProfile" },
          { path: "skill", model: "Skill" },
          { path: "testScores", model: "TestScores" },
          { path: "verificationStatus", model: "VerificationStatus" },
        ],
      });

    res.json({
      success: true,
      count: hiredApplicants.length,
      data: hiredApplicants,
    });
  } catch (error) {
    console.error("Failed to fetch hired applicants:", error);
    res.status(500).json({ message: "Failed to retrieve hired applicants" });
  }
};
