const DATE = require("./date");
const JobSeeker = require("../models/JobSeekerModel");
const createError = require("http-errors");
//hasing password
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const passport = require("passport");
require("../middleware/passport")(passport);
// const passportLocal = require("passport-local");

// exports.register_jobseeker = async (req, res) => {
//   // Our register logic starts here
//   try {
//     // Get user input
//     const { fullname, email, password } = req.body;

//     // Validate user input
//     if (!(email && password && fullname)) {
//       res.status(400).send("All input is required");
//     }

//     // check if user already exist
//     // Validate if user exist in our database
//     const oldUser = await JobSeeker.findOne({ email });

//     if (oldUser) {
//       return res.status(409).send("User Already Exist. Please Login");
//     }

//     //Encrypt user password
//     encryptedPassword = await bcrypt.hash(password, 10);

//     // Create user in our database
//     const user = await JobSeeker.create({
//       fullname,
//       email: email.toLowerCase(), // sanitize: convert email to lowercase
//       password: encryptedPassword,
//     });

//     // Create token
//     const token = jwt.sign(
//       { user_id: user._id, email },
//       process.env.TOKEN_KEY,
//       {
//         expiresIn: "2h",
//       }
//     );
//     // save user token
//     user.token = token;

//     // return new user
//     console.log(user);
//     res.status(201).json(user);
//   } catch (err) {
//     console.log(err);
//   }
// };

// exports.login_jobseeker = async (req, res) => {
//   try {
//   } catch (error) {}
// };

exports.register_jobseeker = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const oldUser = await JobSeeker.findOne({ email });

    if (oldUser) {
      return res.status(409).send("User Already Exist. Please Login");
    }

    //Encrypt user password
    encryptedPassword = await bcrypt.hash(password, 10);

    // Create user in our database
    const user = await JobSeeker.create({
      fullname: name,
      email: email.toLowerCase(), // sanitize: convert email to lowercase
      password: encryptedPassword,
    });

    res.send(user);
  } catch (error) {}
};

exports.login_jobseeker = async (req, res, next) => {
  try {
    passport.authenticate("local", (err, user, info) => {
      console.log(info);
      if (err) throw err;
      if (!user) res.send("No user Exist!");
      else {
        // make passportjs setup the user object, serialize the user, ...
        req.login(user, {}, function (err) {
          if (err) {
            return next(err);
          }
          return res.send(req.user);
        });
      }
    })(req, res, next);
  } catch (error) {
    console.log(error);
  }
};

exports.get_jobseeker = async (req, res) => {
  try {
    console.log(req.user);

    res.send(req.user);
  } catch (error) {}
};

exports.logout_jobseeker = async (req, res) => {
  try {
    req.session.destroy(function (err) {
      res.send(req.user);
    });
  } catch (error) {}
};
