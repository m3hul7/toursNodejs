const jwt = require("jsonwebtoken")
const User = require("../models/userModel")
const AppError = require("../utils/appError")
const catchAsync = require("../utils/catchAsync")
const { promisify } = require("util")
const sendEmail = require("./../utils/email")
const crypto = require("crypto")

const app = require('express')
const signToken = id => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXP
    })
}

const cookieOptions = {
    expiresIn: new Date(Date.now() + process.env.JWT_COOKIE_EXP * 24 * 60 * 60 * 1000),
    httpOnly: false
}

const sendTokenandResponse = (user, statusCode, res) => {
    const token = signToken(user.id)

    if (process.env.NODE_ENV === 'production') cookieOptions.secure = true
    res.cookie('jwt', token, cookieOptions)
    user.password = undefined

    
    res.status(statusCode).json({
        status: 'success',
        token,
        user
    })
}

exports.signup = catchAsync(async (req, res, next) => {
    const user = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm,
        passwordChangedAt: req.body.passwordChangedAt,
        role: req.body.role
    })

    sendTokenandResponse(user, 201, res)
})

exports.login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body

    // 1> check whether email and password exists 
    if (!email || !password) {
        return next(new AppError('please provide email and password', 400))
    }

    // 2> if user with email mention exists in database
    const user = await User.findOne({ email }).select('+password')
    // const correct = await user.correctPassword(password, user.password)

    // 3>if user exist then check password entered match with database password
    if (!user || !(await user.correctPassword(password, user.password))) {
        return next(new AppError('email or password are incorrect', 401))
    }

    // 4> if user enterd correct email and password 
    sendTokenandResponse(user, 200, res)
})

exports.logout = (req, res) => {
    res.cookie('jwt', 'logged-out', {
        expiresIn: new Date(new Date() + 10 * 1000),
        httpOnly: true
    })
    res.status(200).json({
        status: 'success'
    })
}

exports.isLoggedIn = async (req, res, next) => {
    if (req.cookies.jwt) {
        try {
            // 1> verification of token
            const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET)

            // 2> check whether user exist or not
            const currentUser = await User.findOne({ _id: decoded.id })
            // console.log(currentUser)
            if (!currentUser) {
                return next()
            }

            // 3> check whether password has been changed after token has been generated
            if (currentUser.changedPasswordAfter(decoded.iat)) {
                return next()
            }

            // 4> storing the currentUser in req
            res.locals.user = currentUser;
            console.log(`currently logged in user is 😎 ${res.locals.user}`)
            return next()
        } catch(err) {
            return next()
        }
    } 
    next()
}


exports.protect = catchAsync(async (req, res, next) => {
    let token
    // 1> check if token exist in header and it is bearer token
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1]
    } else if (req.cookies.jwt) {
        token = req.cookies.jwt
    }
    if (!token) {
        return next(new AppError('Please login in order to get access !!!', 401))
    }

    // 2> verification of token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET)

    // 3> check whether user exist or not
    const currentUser = await User.findOne({ _id: decoded.id })
    // console.log(currentUser)
    if (!currentUser) {
        return next(new AppError('token doesnt belong to the currentUser', 401))
    }

    // 4> check whether password has been changed after token has been generated
    if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next(new AppError('password has been modified', 401))
    }

    // 5> storing the currentUser in req
    req.user = currentUser
    res.locals.user = currentUser;
    console.log(`currently logged in user is 😎 ${req.user.name}`)
    next()
})

exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(new AppError('you do not have permission to perform this action', 403))
        }
        next()
    }
}

exports.forgetPassword = catchAsync(async (req, res, next) => {

    // 1> check if user exist of bodied email
    const user = await User.findOne({ email: req.body.email })

    if (!user) {
        return next(new AppError('no user found of same email', 404))
    }

    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false })

    // send it to user's mail
    const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/reset-password/${resetToken}`
    const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}. \n If you didn't forget your passord, please ignore this email!`
    try {
        await sendEmail({
            email: user.email,
            subject: 'Your password reset token (valid for 10 mins)',
            message
        })

        res.status(200).json({
            status: 'success',
            message: 'Token sent to email!'
        })
    } catch (err) {
        console.log(err)
        user.passwordResetToken = undefined
        user.passwordResetExpires = undefined
        await user.save({ validateBeforeSave: false })
        return next(new AppError('There was a error sending email please try again later'))
    }
})

exports.resetPassword = catchAsync(async (req, res, next) => {
    // check if user exist of mentioned token and is not expired
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex')

    const user = await User.findOne({ passwordResetToken: hashedToken, passwordResetExpires: { $gt: Date.now() } })

    if (!user) {
        return next(new AppError('user not found or token expired ', 400))
    }

    user.password = req.body.password,
        user.passwordConfirm = req.body.passwordConfirm,
        user.passwordResetToken = undefined
    user.passwordResetExpires = undefined
    await user.save()

    sendTokenandResponse(user, 200, res)
})

exports.updatePassword = catchAsync(async (req, res, next) => {
    console.log(req.user)
    const user = await User.findOne({ email: req.user.email }).select('+password')

    if (!(await user.correctPassword(req.body.currentPassword, user.password))) {
        return next(new AppError('current password is not correct', 400))
    }

    user.password = req.body.password
    user.passwordConfirm = req.body.passwordConfirm
    await user.save()

    sendTokenandResponse(user, 200, res)
}) 