const express = require("express");
const morgan = require("morgan");
const AppError = require("./utils/appError");
const globalErrorHandler = require("./controllers/errorControllers")

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
  // console.log(req.headers)
  req.timeofreq = new Date().toDateString();
  console.log("time when requested ",req.timeofreq);
  next();
});

// middleware ends

// routes starts here

app.use("/api/v1/tours", tourRouter);
app.use("/api/v1/users", usersRouter);

app.all("*", (req, res, next) => {
  // const err = new Error(`Cannot find URL 😭 ${req.originalUrl} on this server !`)
  // err.statusCode = 404,
  // err.status = "fail",

  next(new AppError(`Cannot find URL 😭 ${req.originalUrl} on this server !`, 404))
})

app.use(globalErrorHandler)

// routes ends here

module.exports = app;

