const AppError = require("../utils/appError")

const handleCastErrorDB = (err) => {
  const message = `Invaild Id ${err.value} for the path ${err.path} `
  return new AppError(message, 400)
}

const duplicateFieldValueErrorDB = err => {
  const message = `Duplicate field value present named ${err.keyValue.name}`
  return new AppError(message, 400)
}

const handleValidationErrorDB = err => {
  const message = Object.values(err.errors).map(val => val.message).join('. ')
  return new AppError(message, 400)
}

const handleJsonWebTokenError = () => {
  return new AppError('token has been modified', 401)
}
const handleTokenExpiredError = () => {
  return new AppError('token has expired', 401)
}


const sendErrorsDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack
  })
}
const sendErrorProd = (err, res) => {
  // trusted error can be shown here
  if(err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    })
  }
  // for non truested errors like app errors dependency errors or programming error
  else {
    // console.log('Error: 🔥 ', err)
    res.status(500).json({
      status: 'error',
      message: 'something went wrong'
    })
  }
}
module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || "error"
    if(process.env.NODE_ENV == 'development'){
      sendErrorsDev(err, res)
      
    }
    else if(process.env.NODE_ENV == 'production'){
      // let error = {...err}
      let error = Object.defineProperties({}, Object.getOwnPropertyDescriptors(err))
      // need attention here
      if(err.name === 'CastError') error = handleCastErrorDB(error) 
      if(err.code === 11000) error = duplicateFieldValueErrorDB(error)
      if(err.name === 'ValidationError') error = handleValidationErrorDB(error)
      if(err.name === 'JsonWebTokenError') error = handleJsonWebTokenError()
      if(err.name === 'TokenExpiredError') error = handleTokenExpiredError()
      sendErrorProd(error, res)
    }
  }