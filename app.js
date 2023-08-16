// Step 1: Importing required modules
// These are the libraries and modules needed to build the server.
const express = require("express"); // Web framework for Node.js
const mongoose = require("mongoose"); // MongoDB object modeling tool
const morgan = require("morgan"); // HTTP request logger middleware
const cors = require("cors"); // Middleware to enable CORS (Cross-Origin Resource Sharing)
const bodyParser = require("body-parser"); // Parse incoming request bodies
const https = require("https"); // HTTPS server functionality
const fs = require("fs"); // File system module
const passport = require("passport"); // Authentication middleware
const session = require("express-session"); // Session management
require("dotenv").config(); // Load environment variables from .env file

// Step 2: Creating Express app
// This initializes the Express application.
const app = express();

// Step 3: Middleware configuration for logging and parsing requests
// These middlewares handle logging and parsing incoming requests.
app.use(morgan("dev")); // Log HTTP requests to the console
app.use(express.json()); // Parse JSON bodies
app.use(bodyParser.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Step 4: CORS configuration
// This enables Cross-Origin Resource Sharing, allowing requests from specified origins.
const corsOptions = {
  origin: "http://localhost:8000",
  methods: "GET,POST",
  credentials: true,
  optionsSuccessStatus: 204,
};
app.use(cors(corsOptions));

// Step 5: Session configuration
// This sets up session management, allowing users to remain logged in across requests.
app.use(
  session({
    secret: "secretcode", // Secret key used to sign the session ID cookie
    resave: true, // Forces session to be saved even when unmodified
    saveUninitialized: false, // Don't save uninitialized sessions
    cookie: {
      sameSite: "none", // Cookie SameSite attribute
      secure: true, // Send cookie over HTTPS only
      maxAge: 24 * 60 * 60 * 1000, // Cookie expiration time (24 hours)
    },
  })
);

// Step 6: Passport initialization
// This sets up authentication using Passport.
app.use(passport.initialize());
app.use(passport.session());
const initializePassport = require("./middleware/passport"); // Import Passport configuration
initializePassport(passport);

// Step 7: Database connection
// This connects to the MongoDB database.
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to DB"))
  .catch((err) => console.log("Error connecting to DB"));

// Step 8: Importing and using routes
// These lines import and use the route handlers for different parts of the application.
const testRoutes = require("./routes/test");
app.use("/", testRoutes);
const JobSeekerRoutes = require("./routes/JobSeekerRoutes");
app.use("/JobSeekerRoutes", JobSeekerRoutes);

// Step 9: HTTPS server options
// This sets up the HTTPS server with the SSL certificate and private key.
const serverOptions = {
  key: fs.readFileSync("server.key"),
  cert: fs.readFileSync("server.crt"),
};

// Step 10: Creating HTTPS server
// This creates the HTTPS server using the options defined above.
const server = https.createServer(serverOptions, app);

// Step 11: Port configuration
// This sets the port number that the server will listen on.
const port = process.env.PORT || 8001;

// Step 12: Starting the server
// This starts the server, allowing it to accept incoming connections.
server.listen(port, () => console.log(`Server is running at ${port}`));
