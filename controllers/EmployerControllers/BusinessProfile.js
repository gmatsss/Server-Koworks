const User = require("../../models/User");
const BusinessProfileSchema = require("../../models/BusinessProfileSchema");
const { MongoClient, ObjectId, GridFSBucket } = require("mongodb");
const { getGridFS } = require("../../db/db");

exports.updateOrCreateProfile = async (req, res) => {
  try {
    const uploadedFile = req.files ? req.files.img : null;

    if (!req.user) {
      return res.status(401).json({ message: "You are not authorized." });
    }

    const userId = req.user._id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    let profile = await BusinessProfileSchema.findOne({ user: userId });

    if (!profile) {
      profile = new BusinessProfileSchema({ user: userId });
      console.log("✅ Created new profile for user:", userId);
    } else {
      console.log("✅ Found existing profile for user:", userId);
    }

    const {
      businessName,
      contactName,
      address,
      country,
      zipCode,
      phone,
      timezone,
      currency,
      website,
      gender,
      city,
      fullName,
    } = req.body;

    console.log("📝 Received data:", req.body);
    console.log("🔍 Extracted values:", {
      country,
      timezone,
      currency,
      city,
    });

    if (businessName) profile.businessName = businessName;
    if (contactName) profile.contactName = contactName;
    if (address) profile.address = address;
    if (country) {
      profile.selectedCountry = country;
      console.log("✅ Set selectedCountry to:", country);
    }
    if (zipCode) profile.zipCode = zipCode;
    if (phone) profile.phone = phone;
    if (timezone) {
      profile.selectedTimezone = timezone;
      console.log("✅ Set selectedTimezone to:", timezone);
    }
    if (currency) {
      profile.selectedCurrency = currency;
      console.log("✅ Set selectedCurrency to:", currency);
    }
    if (website) profile.website = website;
    if (gender) profile.gender = gender;
    if (city) {
      profile.city = city;
      console.log("✅ Set city to:", city);
    }

    if (fullName) {
      user.fullname = fullName;
      console.log("✅ Set user fullname to:", fullName);
    }

    if (uploadedFile) {
      const bucket = getGridFS();

      const existingFiles = await bucket
        .find({ filename: `profile_${userId}` })
        .toArray();
      if (existingFiles.length > 0) {
        await bucket.delete(existingFiles[0]._id);
      }

      const uploadStream = bucket.openUploadStream(`profile_${userId}`, {
        contentType: uploadedFile.mimetype,
      });
      uploadStream.write(uploadedFile.data);
      uploadStream.end();

      await new Promise((resolve, reject) => {
        uploadStream.on("finish", (file) => {
          profile.img = file._id;
          resolve();
        });
        uploadStream.on("error", reject);
      });
    }

    console.log("💾 Saving user...");
    await user.save();
    console.log("✅ User saved successfully");

    console.log("💾 Saving profile with data:", {
      selectedCountry: profile.selectedCountry,
      selectedTimezone: profile.selectedTimezone,
      selectedCurrency: profile.selectedCurrency,
      city: profile.city,
    });
    await profile.save();
    console.log("✅ Profile saved successfully");

    user.businessProfile = profile._id;
    await user.save();
    console.log("✅ Profile linked to user");

    res.status(200).json({
      message: "Business profile updated successfully.",
      data: profile,
    });
  } catch (error) {
    console.error("❌ Profile update error:", error);
    res.status(500).json({
      message:
        "An error occurred while updating or creating the business profile.",
      error: error.message, // ✅ Include error details for debugging
    });
  }
};

exports.getUserProfileImage = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "You are not authorized." });
    }

    const userId = req.user._id;
    const bucket = getGridFS();

    const file = await bucket.find({ filename: `profile_${userId}` }).next();

    if (!file) {
      return res.status(200).json({ message: "No image file uploaded yet" });
    }

    res.contentType(file.contentType);

    const downloadStream = bucket.openDownloadStream(file._id);
    downloadStream.pipe(res);
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
};
