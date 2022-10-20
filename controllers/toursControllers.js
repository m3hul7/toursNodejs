
const Tour = require("./../models/tourModel")

// controller to get all tours
exports.gettours = async (req, res) => {
  try {

    const queryObject = {...req.query}
    const excludedParams = ["page", "sort", "limit", "fields"]
    excludedParams.forEach(val => delete queryObject[val])

    const query = await Tour.find(queryObject);
    const allTours = await query;

    res.status(200).json({
      status: "success",
      timeofreq: req.timeofreq,
      results: allTours.length,
      data: {
        tours: allTours,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err
    })
  }
};

// controller to get tour by id
exports.gettourbyid = async (req, res) => {
  try {
    const specificTour = await Tour.findById(req.params.id)
    res.status(200).json({
      status: "success",
      data: {
        tour: specificTour,
      },
    });
  } catch(err) {
    res.status(400).json({
      status: 'fail',
      message: err
    })
  }
};

// controller to post tour
exports.posttour = async (req, res) => {
  try {
    const postTour = await Tour.create(req.body)
    res.status(201).json({
      status: "success",

      data: {
        tours: postTour,
      },
    });
  } catch(err) {
    res.status(400).json({
      status: 'fail',
      message: err
    })
  }
};

// controller to update tour
exports.updatetour = async (req, res) => {
  try {
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
  } catch(err) {
    res.status(400).json({
      status: 'fail',
      message: err
    })
  }
};

// controller to delete tour
exports.deletetour = async (req, res) => {
  try {
    const deletedTour = await Tour.findByIdAndDelete(req.params.id)
    res.status(204).json({
      status: "success",
      data: null,
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err
    })
  }
};
