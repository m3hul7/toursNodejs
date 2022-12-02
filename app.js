const express = require("express");
const morgan = require("morgan");
const AppError = require("./utils/appError");
const rateLimiter = require("express-rate-limit")
const helmet = require("helmet")
const xss = require("xss-clean")
const hpp = require("hpp")
const mongoSanitize = require("express-mongo-sanitize")
const globalErrorHandler = require("./controllers/errorControllers")

// router imports
const tourRouter = require("./routes/toursRoutes");
const usersRouter = require("./routes/usersRoutes");
const reviewRouter = require("./routes/reviewRoutes")

const app = express();

// middleware for security 
app.use(helmet())

// middleware for logging in development environmnet 
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// set request limiter 
const limiter = rateLimiter({
  max: 50,
  windowMs: 60 * 60 * 1000,
  messsage: 'too many requests from this IP, Please try again in an hour!'
})
app.use('/api', limiter)



// prevent params pollution
app.use(hpp({
  whitelist: [
    'duration',
    'maxGroupSize',
    'ratingAverage',
    'ratingQuantity',
    'price',
    'difficulty'
  ]
}))

// parser of body to req body
app.use(express.json( {limit: '10kb'} ));

// express mongo sanitize for nosql injection
app.use(mongoSanitize())
// xss sanitizer
app.use(xss())

// middleware to serve static files
// app.use(express.static("./4-natours/starter/public"));

// custome middleware
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
app.use("/api/v1/reviews", reviewRouter)

app.all("*", (req, res, next) => {
  // const err = new Error(`Cannot find URL 😭 ${req.originalUrl} on this server !`)
  // err.statusCode = 404,
  // err.status = "fail",

  next(new AppError(`Cannot find URL 😭 ${req.originalUrl} on this server !`, 404))
})

app.use(globalErrorHandler)

// routes ends here

module.exports = app;

