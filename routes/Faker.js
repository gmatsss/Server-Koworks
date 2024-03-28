const express = require("express");
const router = express.Router();

// Import controller
const { createDummyEmployees } = require("../controllers/faker/faker");

// API
router.get("/createDummyEmployees", createDummyEmployees);

module.exports = router;
