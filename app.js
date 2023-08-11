// Importing required modules
const express = require("express");
const mongoose = require("mongoose");
const morgan = require("morgan");
const cors = require("cors");
const bodyParser = require("body-parser");
const https = require("https");
const fs = require("fs");
const passport = require("passport");
const session = require("express-session");
const cookieParser = require("cookie-parser");
require("dotenv").config();

// Importing middleware
const initializePassport = require("./middleware/passport"); // Adjust the path to your file

// Creating Express app
const app = express();

// Middleware configuration
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan("dev")); // Logging requests

// Database connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to DB"))
  .catch((err) => console.log("Error connecting to DB"));

// CORS configuration
const corsOptions = {
  origin: "http://localhost:8000",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
  optionsSuccessStatus: 204,
};
app.use(cors(corsOptions)); // Enabling CORS

// Session configuration
app.use(
  session({
    secret: "secretcode",
    resave: true,
    saveUninitialized: false,
    cookie: {
      sameSite: "none",
      secure: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);

// Passport initialization
app.use(passport.initialize());
app.use(passport.session());
initializePassport(passport);

// Importing and using routes
const testRoutes = require("./routes/test");
app.use("/", testRoutes);
const JobSeekerRoutes = require("./routes/JobSeekerRoutes");
app.use("/JobSeekerRoutes", JobSeekerRoutes);

// HTTPS server options
const serverOptions = {
  key: fs.readFileSync("server.key"),
  cert: fs.readFileSync("server.crt"),
};

// Creating HTTPS server
const server = https.createServer(serverOptions, app);

// Port configuration
const port = process.env.PORT || 8001;

// Starting the server
server.listen(port, () => console.log(`Server is running at ${port}`));
