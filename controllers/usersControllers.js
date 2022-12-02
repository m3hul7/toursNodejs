const User = require("../models/userModel")

const AppError = require("../utils/appError")
const catchAsync = require("../utils/catchAsync")

const handlerFactory = require("./../controllers/handlerFactory")

const filterBody = (obj, ...fields) => {
  const newObj = {};
  Object.keys(obj).forEach(el => {
    if(fields.includes(el)) {
      newObj[el] = obj[[el]]
    }
  })
  return newObj;
}

exports.getMe = (req, res, next) => {
  req.params.id= req.user.id
  next()
}

exports.updateMe = catchAsync(async (req, res, next) => {
   
  // 1> if user enterd password or passwordConfirm which should not be allowed 
  if(req.body.password || req.body.passwordConfirm){
    return next(new AppError('this route is not for password updation', 400))
  }
  let filteredObj;
  if(req.body.role != 'admin' && req.body.role != 'lead-guide'){
    filteredObj = filterBody( req.body, 'name', 'email', 'role')
  } else {
    filteredObj = filterBody( req.body, 'name', 'email')
  }
  const update = await User.findByIdAndUpdate(req.user.id, filteredObj, {runValidators: true, new: true})

  res.status(200).json({
    status: 'success',
    update
  })

})

exports.deleteMe = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.user.id, { active: false })
  res.status(204).json({
    status: 'success',
    user
  })
})

exports.createUser = (req, res) => {
  res.status(500).json({
    status: "fail",
    message: "Please use sign up to create new user",
  })
}

exports.getAllUser = handlerFactory.getAll(User)
exports.getUser = handlerFactory.getOne(User)
exports.updateUser = handlerFactory.updateOne(User) // do not try to update password
exports.deleteUser = handlerFactory.deleteOne(User)