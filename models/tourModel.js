const mongoose = require("mongoose")

const tourSchema = new mongoose.Schema({
    name: {
      type: String,
      required: [true, 'tour must have name'],
      unique: true,
      trim: true
    },
    duration: {
      type: Number,
      required: [true, 'A tour must have duration']
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must habe group size']
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have difficulty']
    },
    ratingAverage: {
      type: Number,
      default: 4.8
    },
    ratingQuantity: {
      type: Number,
      default: 0
    },
    price: {
      type: Number,
      required: [true, 'tour must have price']
    },
    priceDiscout: Number,
    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a description']
    },
    description: {
      type: String,
      trim: true
    },
    imageCover: {
      type: String
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now()
    },
    startDates: [Date]
  })
  
  const Tour = mongoose.model('Tour' , tourSchema)

  module.exports = Tour