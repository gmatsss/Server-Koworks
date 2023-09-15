// Step 1: Importing required modules
const express = require("express");
const mongoose = require("mongoose");
const morgan = require("morgan");
const cors = require("cors");
const https = require("https");
const fs = require("fs");
const passport = require("passport");
const session = require("express-session");
const fileUpload = require("express-fileupload"); // Added this import
require("dotenv").config();
const { connect: connectToDb } = require("./db/db");

const app = express();
app.set("trust proxy", true);

// Step 3: Middleware configuration for logging and parsing requests
app.use(morgan("dev"));

// IMPORTANT: Use express-fileupload before body-parser
app.use(fileUpload());

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Step 4: CORS configuration
const corsOptions = {
  origin: "http://localhost:8000",
  methods: "GET,POST",
  credentials: true,
  optionsSuccessStatus: 204,
};
app.use(cors(corsOptions));

// Step 5: Session configuration
app.use(
  session({
    secret: "secretcode",
    resave: true,
    saveUninitialized: false,
    cookie: {
      sameSite: "none",
      secure: true,
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);

// Passport initialization
app.use(passport.initialize());
app.use(passport.session());

const initializePassport = require("./middleware/passport");
initializePassport(passport);

// Step 7: Database connection
connectToDb();

// Step 8: Importing and using routes
const testRoutes = require("./routes/test");
app.use("/", testRoutes);
const JobSeekerRoutes = require("./routes/JobSeekerRoutes");
app.use("/JobSeekerRoutes", JobSeekerRoutes);
const EmployerRoutes = require("./routes/EmployerRoutes");
app.use("/EmployerRoutes", EmployerRoutes);
const User = require("./routes/User");
app.use("/User", User);

// Step 9: HTTPS server options
const serverOptions = {
  key: fs.readFileSync("server.key"),
  cert: fs.readFileSync("server.crt"),
};

// Step 10: Creating HTTPS server
const server = https.createServer(serverOptions, app);

// Step 11: Port configuration
const port = process.env.PORT || 8001;

// Step 12: Starting the server
server.listen(port, () => console.log(`Server is running at ${port}`));
