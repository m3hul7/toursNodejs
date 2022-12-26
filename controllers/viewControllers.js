const Tour = require('../models/tourModel')
const catchAsync = require('../utils/catchAsync')
const AppError = require("../utils/appError")

exports.getOverview = catchAsync(async (req, res, next) => {

    const tours = await Tour.find()

    res.status(200).render('overview', {
        title : 'All tours',
        tours
    })
})

exports.getTour = catchAsync(async (req, res, next) => {

    const tour = await Tour.findOne({slug: req.params.slug}).populate({
        path: 'reviews',
        fields: 'review rating user'
    })

    if(!tour) {
        console.log("no tour")
        return next(new AppError('No tour found with that tour name', 404))
    }

    res.status(200).set(
        'Content-Security-Policy',
        "default-src 'self' https://*.mapbox.com ;base-uri 'self';block-all-mixed-content;font-src 'self' https: data:;frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src https://cdnjs.cloudflare.com https://api.mapbox.com 'self' blob: ;script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests;"
      ).render('tour', {
        title : `${tour.name} Tour`,
        tour
    })
})

exports.getLogIn = (req, res) => {
    res.status(200).render('login', {
        title: 'Log into your account'
    })
}

exports.getAccount = (req, res) => {
    res.status(200).render('account', {
        title: 'Account details'
    })
}