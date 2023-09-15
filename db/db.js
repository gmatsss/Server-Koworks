const mongoose = require("mongoose");
const { GridFSBucket } = require("mongodb");
require("dotenv").config();

let gfs;

async function connect() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to DB");

    // Setting up GridFS after connecting to the database
    const conn = mongoose.connection;
    gfs = new GridFSBucket(conn.db, {
      bucketName: "uploads",
    });
  } catch (err) {
    console.error("Error connecting to DB", err);
  }
}

function getGridFS() {
  if (!gfs) {
    throw new Error(
      "GridFS is not initialized. Connect to the database first."
    );
  }
  return gfs;
}

module.exports = { connect, getGridFS };
