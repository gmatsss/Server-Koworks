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
    }

    const {
      businessName,
      contactName,
      address,
      selectedCountry,
      zipCode,
      phone,
      selectedTimezone,
      selectedCurrency,
      website,
      gender,
      city,
    } = req.body;

    if (businessName) profile.businessName = businessName;
    if (contactName) profile.contactName = contactName;
    if (address) profile.address = address;
    if (selectedCountry) profile.selectedCountry = selectedCountry;
    if (zipCode) profile.zipCode = zipCode;
    if (phone) profile.phone = phone;
    if (selectedTimezone) profile.selectedTimezone = selectedTimezone;
    if (selectedCurrency) profile.selectedCurrency = selectedCurrency;
    if (website) profile.website = website;
    if (gender) profile.gender = gender;
    if (city) profile.city = city;

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

    await profile.save();

    user.businessProfile = profile._id;
    await user.save();

    res.status(200).json({
      message: "Business profile updated successfully.",
      data: profile,
    });
  } catch (error) {
    res.status(500).json({
      message:
        "An error occurred while updating or creating the business profile.",
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
