const Tour = require("./../models/tourModel")

const AppError = require("../utils/appError");
const catchAsync = require("./../utils/catchAsync")

const handlerFactory = require("./../controllers/handlerFactory")

// aliasing top five tours
exports.aliasTopFive = (req, res, next) => {
  req.query.page = 1;
  req.query.limit = 5;
  req.query.fields = 'name, ratingAverage, difficulty, price, summary'
  req.query.sort = '-ratingAverage, price'
  next()
}

exports.getAllTour = handlerFactory.getAll(Tour)
exports.getTour = handlerFactory.getOne(Tour, { path: 'reviews' })
exports.createTour = handlerFactory.createOne(Tour)
exports.updateTour = handlerFactory.updateOne(Tour)
exports.deleteTour = handlerFactory.deleteOne(Tour)

exports.getToursStats = catchAsync(async (req, res, next) => {

  const stats = Tour.aggregate([
    // {
    //   $match: { price: { $gte: 500 } }
    // },
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        numTours: { $sum: 1 },
        numRating: { $sum: '$ratingQuantity' },
        avgRating: { $avg: '$ratingAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' }
      }
    },
    {
      $sort: {
        minPrice: -1
      }
    },
    // {
    //   $match: {
    //     _id: { $ee : "EASY" }
    //   }
    // }
  ])

  const statsdata = await stats

  res.status(200).json({
    status: "success",
    data: statsdata,
  });

})

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {

  const year = req.params.year * 1
  const monthlydata = await Tour.aggregate([
    {
      $unwind: '$startDates'
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`)
        }
      }
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTourStarts: { $sum: 1 },
        nameToursStarts: { $push: '$name' }
      }
    },
    {
      $addFields: { month: '$_id' }
    },
    {
      $project: { _id: 0 }
    },
    {
      $sort: {
        numTourStarts: -1
      }
    },
    {
      $limit: 7
    }
  ])
  res.status(200).json({
    status: "success",
    length: monthlydata.length,
    data: monthlydata,
  });

})

exports.getToursWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params

  const [lat, lng] = latlng.split(',')

  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1

  if(!lat | !lng) {
    return new AppError('Please provide latitude and longitude in lat,lng format!', 400)
  }

  const tours = await Tour.find({
    startLocation: {
      $geoWithin: {
        $centerSphere: [[lng, lat], radius]
      }
    }
  })

  res.status(200).json({
    message: 'success',
    results: tours.length,
    data: {
      data: tours
    }
  })
})

exports.getDistances = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params
  const [ lat, lng] = latlng.split(',')
  const multiplier = unit === 'mi' ? 0.000621371 : 0.001
  if(!lat | !lng) {
    return new AppError('Please provide latitude and longitude in proper format of lat,lng !')
  }
  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [lng * 1, lat * 1]
        },
        distanceField: 'distance',
        distanceMultiplier: multiplier
      }
    },
    {
      $project: {
        distance: 1,
        name: 1
      }
    }
  ])
  res.status(200).json({
    status: 'success',
    data: {
      data: distances
    }
  })
})