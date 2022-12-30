const express = require("express");
const path = require("path")
const morgan = require("morgan");
const AppError = require("./utils/appError");
const rateLimiter = require("express-rate-limit")
const helmet = require("helmet")
const xss = require("xss-clean")
const cors = require("cors")
const hpp = require("hpp")
const mongoSanitize = require("express-mongo-sanitize")
const globalErrorHandler = require("./controllers/errorControllers")
const cookieParser = require("cookie-parser")
// router imports
const tourRouter = require("./routes/toursRoutes")
const usersRouter = require("./routes/usersRoutes")
const reviewRouter = require("./routes/reviewRoutes")
const viewRouter = require("./routes/viewRoutes")

const app = express();

app.set('view engine', 'pug')
app.set('views', path.join(__dirname, 'views'))

// middleware to serve static files
app.use(express.static(path.join(__dirname, 'public')))

// 
app.use(cors({origin:true, credentials: true}));

// middleware for security 
// app.use(helmet())
// app.use(helmet({crossOriginEmbedderPolicy: false}));
// app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));


// setting header 
// app.use(function(req, res, next) { 
//   res.setHeader('Access-Control-Allow-Origin', '*'); 
//   next(); 
// })
// app.use(function(req, res, next) { 
//   res.setHeader(
//     'Content-Security-Policy',
//     "script-src  'self' api.mapbox.com",
//     "script-src-elem 'self' api.mapbox.com",
//   );
//   next(); 
// })
// app.use(function(req, res, next) { 
//   res.setHeader( 'Content-Security-Policy', "script-src 'self' https://cdnjs.cloudflare.com/ajax/libs/axios/1.2.1/axios.min.js"); 
//   next(); 
// })


// middleware for logging in development environmnet 
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"))
}

// set request limiter 
const limiter = rateLimiter({
  max: 100,
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
app.use(express.urlencoded({
  extended:true,
  limit:'10kb'
}))

app.use(cookieParser())

// express mongo sanitize for nosql injection
app.use(mongoSanitize())
// xss sanitizer
app.use(xss())

// custome middleware
app.use((req, res, next) => {
  // console.log(req.headers)
  console.log("hi",req.cookies.jwt)
  req.timeofreq = new Date().toDateString();
  console.log("time when requested ",req.timeofreq);
  next();
});

// middleware ends

// routes starts here

app.use("/", viewRouter)

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

