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

    // Check if a BusinessProfileSchema exists for the user
    let profile = await BusinessProfileSchema.findOne({ user: userId });

    if (!profile) {
      // Create a new profile if it doesn't exist
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

    // Update fields only if they are provided
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
      const uploadedFile = req.files.img;
      const bucket = getGridFS(); // Use the shared GridFS instance

      // Check for existing file
      const existingFiles = await bucket
        .find({ filename: `profile_${userId}` })
        .toArray();
      if (existingFiles.length > 0) {
        // Delete existing file
        await bucket.delete(existingFiles[0]._id);
      }

      // Upload new file
      const uploadStream = bucket.openUploadStream(`profile_${userId}`, {
        contentType: uploadedFile.mimetype,
      });
      uploadStream.write(uploadedFile.data);
      uploadStream.end();

      await new Promise((resolve, reject) => {
        uploadStream.on("finish", (file) => {
          profile.img = file._id; // Update profile with new image ID
          resolve();
        });
        uploadStream.on("error", reject);
      });
    }

    await profile.save();

    // Link the profile to the user
    user.BusinessProfileSchema = profile._id;
    await user.save();

    res.status(200).json({
      message: "Business profile updated successfully.",
      data: profile,
    });
  } catch (error) {
    console.error("Error updating or creating business profile:", error);
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

    // Use the existing GridFS instance
    const bucket = getGridFS();

    // Fetch the user's profile image
    const file = await bucket.find({ filename: `profile_${userId}` }).next();

    if (!file) {
      return res.status(200).json({ message: "No image file uploaded yet" });
    }

    // Set the appropriate content type for the response
    res.contentType(file.contentType);

    // Stream the image data as the response
    const downloadStream = bucket.openDownloadStream(file._id);
    downloadStream.pipe(res);
  } catch (error) {
    console.error("Error fetching user profile image:", error);
    res.status(500).send("Internal Server Error");
  }
};
