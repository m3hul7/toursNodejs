
const AppError = require("../utils/appError");
const Tour = require("./../models/tourModel")
const APIfeatures = require("./../utils/apiFeatures")
const catchAsync = require("./../utils/catchAsync")

// aliasing top five tours
exports.aliasTopFive = (req, res, next) => {
  req.query.page = 1;
  req.query.limit = 5;
  req.query.fields = 'name, ratingAverage, difficulty, price, summary'
  req.query.sort = '-ratingAverage, price'
  next()
}

// controller to get all tours
exports.gettours = catchAsync( async (req, res, next) => {

  const apiFeat = new APIfeatures(Tour.find(), req.query).filter().sort().fields().pagination()

    const allTours = await apiFeat.query;

    res.status(200).json({
      status: "success",
      timeofreq: req.timeofreq,
      results: allTours.length,
      data: {
        tours: allTours,
      },
    });
  // try {

  //   // const queryObject = {...req.query}

  //   // // filtering 
  //   // const excludedParams = ["page", "sort", "limit", "fields"]
  //   // excludedParams.forEach(val => delete queryObject[val])

  //   // // advanced filtering 
  //   // let queryString = JSON.stringify(queryObject);
  //   // queryString = queryString.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`)

  //   // let query = Tour.find(JSON.parse(queryString));

  //   // // sorting
  //   // if(req.query.sort) {
  //   //   const sortsBy = req.query.sort.split(',').join(' ')
  //   //   query = query.sort(sortsBy)
  //   // }

  //   // // fields
  //   // if(req.query.fields) {
  //   //   const fieldsBy = req.query.fields.split(',').join(' ')
  //   //   query = query.select(fieldsBy)
  //   // }
  //   // else {
  //   //   query = query.select('-__v')
  //   // }

  //   // // pagination 
  //   // const page = req.query.page * 1 || 1;
  //   // const limit = req.query.limit * 1 || 100;
  //   // const skip = (page - 1) * limit;

  //   // query = query.skip(skip).limit(limit);

  //   // if(req.query.page) {
  //   //   const countDoc = await Tour.countDocuments();
  //   //   if(skip > countDoc) throw new Error('this page doesnt exist!!')
  //   // }
  //   const apiFeat = new APIfeatures(Tour.find(), req.query).filter().sort().fields().pagination()

  //   const allTours = await apiFeat.query;

  //   res.status(200).json({
  //     status: "success",
  //     timeofreq: req.timeofreq,
  //     results: allTours.length,
  //     data: {
  //       tours: allTours,
  //     },
  //   });
  // } catch (err) {
  //   res.status(400).json({
  //     status: 'fail',
  //     message: err
  //   })
  // }
});

// controller to get tour by id
exports.gettourbyid = catchAsync ( async (req, res, next) => {

  const specificTour = await Tour.findById(req.params.id)
  // Tour.findOne({_id:  req.params.id})

  if(!specificTour) {
    return next(new AppError('No tour found with that ID', 404))
  }
  res.status(200).json({
    status: "success",
    data: {
      tour: specificTour,
    },
  });

});

// controller to post tour
exports.posttour = catchAsync (async (req, res, next) => {
    const postTour = await Tour.create(req.body)
    res.status(201).json({
      status: "success",

      data: {
        tours: postTour,
      },
    });
  
}) ;

// controller to update tour
exports.updatetour = catchAsync (async (req, res, next) => {

    const updatedTour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    res.status(200).json({
      status: "success",
      data: {
        tour: updatedTour
      },
    });

});

// controller to delete tour
exports.deletetour = catchAsync( async (req, res, next) => {

    const deletedTour = await Tour.findByIdAndDelete(req.params.id)

    if(!deletedTour) {
      return next(new AppError('No tour found with that ID', 404))
    }
    res.status(204).json({
      status: "success",
      data: null,
    });
  
});

exports.getToursStats = catchAsync( async (req, res, next) => {

    const stats =  Tour.aggregate([
      // {
      //   $match: { price: { $gte: 500 } }
      // },
      {
        $group: {
          _id: { $toUpper: '$difficulty'},
          numTours: { $sum : 1 },
          numRating: { $sum: '$ratingQuantity' },
          avgRating: { $avg: '$ratingAverage'},
          avgPrice: { $avg: '$price' },
          minPrice: { $min : '$price' },
          maxPrice: { $max: '$price' }
        }
      },
      {
        $sort: {
          minPrice : -1
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

exports.getMonthlyPlan = catchAsync( async (req, res, next) => {

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
          _id: {$month: '$startDates'},
          numTourStarts: {$sum: 1},
          nameToursStarts: {$push: '$name'}
        }
      },
      {
        $addFields: { month : '$_id' }
      },
      {
        $project: {_id: 0}
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