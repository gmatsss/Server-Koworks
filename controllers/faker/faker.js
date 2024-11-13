const User = require("../../models/User");
const EmployeeProfile = require("../../models/EmployeeProfile");
const Skill = require("../../models/Skill");
const TestScores = require("../../models/TestScores");
const VerificationStatus = require("../../models/VerificationStatusSchema");
const bcrypt = require("bcryptjs");
const { faker } = require("@faker-js/faker");

const generateRandomSkills = () => {
  const skillsCategories = {
    adminandoffice: ["Admin Assistant", "Data Entry", "Email Management"],
    englishSkills: ["Speaking", "Translations", "Tutoring Teaching"],
    financeAndManagement: ["Accounting", "Bookkeeping", "Business Plans"],
    advertising: ["Amazon Product Ads", "Bing Ads", "Facebook Ads"],
    customerSupport: [
      "Community Forum Moderation",
      "Content Moderation",
      "Customer Support",
    ],
    softwareDevelopment: [
      "Android Development",
      "Desktop Applications",
      "Game Development",
    ],
    webDevelopment: ["Wordpress Development", "Shopify", "Laravel"],
    webmaster: [
      "Content Management",
      "Wordpress Webmaster",
      "Google Analytics",
    ],
    writing: ["Blogging", "Copywriting", "Creative Writing"],
    graphicsAndMultimedia: [
      "Three D Modeling",
      "Graphics Editing",
      "Logo Design",
    ],
    marketingAndSales: [
      "Affiliate Marketing",
      "Classified Ads Marketing",
      "Direct Mail Marketing",
    ],
    professionalServices: [
      "Legal Services",
      "Medical Services",
      "Real Estate Services",
    ],
    projectManagement: [
      "Design Project Management",
      "Marketing Project Management",
      "Other Project Management",
    ],
  };

  const skills = {};

  Object.entries(skillsCategories).forEach(([category, skillsList]) => {
    const selectedSkills = skillsList
      .sort(() => 0.5 - Math.random())
      .slice(0, faker.number.int({ min: 1, max: skillsList.length }));
    skills[category] = selectedSkills.map((skill) => ({
      name: skill,
      rating: faker.number.int({ min: 1, max: 5 }),
    }));
  });

  return skills;
};

const generateRandomTestScores = () => ({
  disc: {
    dominance_score: faker.number.int({ min: 0, max: 100 }),
    influence_score: faker.number.int({ min: 0, max: 100 }),
    steadiness_score: faker.number.int({ min: 0, max: 100 }),
    compliance_score: faker.number.int({ min: 0, max: 100 }),
    disc_img: null,
  },
  iq: {
    iq_score: faker.number.int({ min: 0, max: 160 }),
    iq_img: null,
  },
  english: {
    english_score: faker.helpers.arrayElement([
      "A1",
      "A2",
      "B1",
      "B2",
      "C1",
      "C2",
    ]),
    english_img: null,
  },
});

exports.createDummyEmployees = async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash("123", 10);
    let createdUsers = [];

    for (let i = 0; i < 1; i++) {
      const user = await new User({
        fullname: faker.person.fullName(),
        email: faker.internet.email(),
        password: hashedPassword,
        role: "employee",
        postedJobs: [],
        created: faker.date.past().toISOString(),
        lastLogin: faker.date.recent().toISOString(),
        pinnedJobs: [],
      }).save();

      const skills = await new Skill({
        ...generateRandomSkills(),
        user: user._id,
      }).save();

      const testScores = await new TestScores({
        ...generateRandomTestScores(),
        user: user._id,
      }).save();

      const employeeProfile = await new EmployeeProfile({
        job_title: faker.person.jobTitle(),
        summary: faker.commerce.productDescription(),
        salary: faker.number.int({ min: 1000, max: 5000 }),
        hourly_rate: faker.number.int({ min: 20, max: 100 }),
        education: "Bachelor's degree",
        experience: `${faker.number.int({ min: 1, max: 10 })}`,
        contact: faker.phone.number(),
        website: faker.internet.url(),
        gender: faker.helpers.arrayElement(["male", "female", "other"]),
        employment_status: faker.helpers.arrayElement([
          "full-time",
          "part-time",
          "freelancer",
        ]),
        user: user._id,
      }).save();

      const verificationStatus = await new VerificationStatus({
        emailVerified: faker.datatype.boolean(),
        profileCompleted: true,
        skillCompleted: true,
        idVerified: faker.datatype.boolean(),
        addressVerified: faker.datatype.boolean(),
        phoneVerified: faker.datatype.boolean(),
        idScore: faker.number.int({ min: 0, max: 100 }),
        user: user._id,
      }).save();

      user.employeeProfile = employeeProfile._id;
      user.skill = skills._id;
      user.testScores = testScores._id;
      user.verificationStatus = verificationStatus._id;
      await user.save();

      createdUsers.push(user);
    }

    res.status(201).json({
      success: true,
      message: "Dummy employees created successfully",
      users: createdUsers,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Failed to create dummy employees." });
  }
};
