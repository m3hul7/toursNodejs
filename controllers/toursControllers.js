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