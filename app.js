//morgan logs the request
//cors to coomunicate to back and fromnt
//dotenv store sensitive info or connected to git
//import modules
const express = require("express");
const mongoose = require("mongoose");
const morgan = require("morgan");
const cors = require("cors");
require("dotenv").config();
const bodyParser = require("body-parser");
//for secure connection and certificate https
const https = require("https");
const fs = require("fs");
//passport
const passport = require("passport");
const passportLocal = require("passport-local");
//session
const session = require("express-session");
//cookies
const cookieParser = require("cookie-parser");

//app commet
const app = express();

//app use json destricturing crud
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

//db the code
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to DB"))
  .catch((err) => console.log("Error connecting to DB"));

//permissions to connect front end
var corsOptions = {
  // "http://localhost:8000"
  origin: "http://localhost:8000", //to the client side connection
  methods: ["GET", "POST"],
  credentials: true,
  preflightContinue: true,
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
  ],
};
app.use(cors(corsOptions));

//middleware
app.use(morgan("dev"));
app.use(
  session({
    secret: "secretcode",
    resave: true,
    saveUninitialized: true,
  })
);
//cookie handlers
app.use(cookieParser("secretcode"));
app.use(passport.initialize());
app.use(passport.session());

// app.post("/login", (req, res, next) => {
//   passport.authenticate("local", (err, user, info) => {
//     if (err) throw err;
//     if (!user) res.send("No user Exist!");
//     else {
//       req.logIn(user, (err) => {
//         if (err) throw err;
//         res.send("Success Authenticated!");
//         console.log(req.user);
//       });
//     }
//   })(req, res, next);
// });
//routes test
const testRoutes = require("./routes/test");
app.use("/", testRoutes);

//routes test
const JobSeekerRoutes = require("./routes/JobSeekerRoutes");
app.use("/JobSeekerRoutes", JobSeekerRoutes);

//cert options
const serverOptions = {
  key: fs.readFileSync("server.key"),
  cert: fs.readFileSync("server.crt"),
};

//passing appjs to server
const server = https.createServer(serverOptions, app);

//port
const port = process.env.PORT || 8001;

//listener
server.listen(port, () => console.log(`Server is running at ${port}`));
