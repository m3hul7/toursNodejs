const express = require("express");
const morgan = require("morgan");

// router imports
const tourRouter = require("./routes/toursRoutes");
const usersRouter = require("./routes/usersRoutes");

const app = express();

// middleware for development environmnet 
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use(express.json());
// app.use(express.static("./4-natours/starter/public"));

app.use((req, res, next) => {
  console.log("middleware called");
  req.timeofreq = new Date().toDateString();
  next();
});

// middleware ends

// routes starts here

app.use("/api/v1/tours", tourRouter);
app.use("/api/v1/users", usersRouter);

// routes ends here

module.exports = app;
