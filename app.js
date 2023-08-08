//morgan logs the request
//cors to coomunicate to back and fromnt
//dotenv store sensitive info or connected to git

//import modules
const express = require("express");
const mongoose = require("mongoose");
const morgan = require("morgan");
const cors = require("cors");
require("dotenv").config();
//app commet
const app = express();

//middleware
app.use(morgan("dev"));
app.use(cors({ origin: true, credentials: true }));

//routes test
const testRoutes = require("./routes/test");
app.use("/", testRoutes);

//port
const port = process.env.PORT || 8001;

//listener
const server = app.listen(port, () =>
  console.log(`Server is running at ${port}`)
);
