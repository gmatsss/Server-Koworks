// Importing required modules
const express = require("express");
const mongoose = require("mongoose");
const morgan = require("morgan");
const cors = require("cors");
const passport = require("passport");
const session = require("express-session");
const fileUpload = require("express-fileupload");
const MongoStore = require("connect-mongo");

require("dotenv").config();

// Database connection utility
const { connect: connectToDb } = require("./db/db");

// Passport configuration
const initializePassport = require("./middleware/passport");

// Route handlers
const testRoutes = require("./routes/test");
const JobSeekerRoutes = require("./routes/JobSeekerRoutes");
const EmployerRoutes = require("./routes/EmployerRoutes");
const UserRoutes = require("./routes/User");

// Initialize Express app
const app = express();
app.set("trust proxy", true);

// Middleware for logging and parsing requests
app.use(morgan("dev"));
app.use(fileUpload()); // IMPORTANT: Use express-fileupload before body-parser
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// CORS configuration
const corsOptions = {
  origin: ["http://localhost:8000", "http://koworks.customadesign.info"],
  methods: "GET,POST, DELETE",
  credentials: true,
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));

// Session configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET || "default_secret",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
    cookie: {
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    },
  })
);

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());
initializePassport(passport);

// Database connection
connectToDb();

// Routes configuration
app.use("/", testRoutes);
app.use("/JobSeekerRoutes", JobSeekerRoutes);
app.use("/EmployerRoutes", EmployerRoutes);
app.use("/User", UserRoutes);

// Port configuration and starting the server
const port = process.env.PORT || 8001;
app.listen(port, () => console.log(`Server is running at ${port}`));
