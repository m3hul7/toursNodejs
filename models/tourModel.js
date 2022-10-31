const mongoose = require("mongoose")
const slugify = require("slugify")

const tourSchema = new mongoose.Schema({
    name: {
      type: String,
      required: [true, 'tour must have name'],
      unique: true,
      trim: true
    },
    slug: String,
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
      default: Date.now(),
      select: false
    },
    startDates: [Date]
  },{
    toJSON: {virtuals :true},
    toObject: {virtuals: true}
  })
  
  // Virtual Properties
  tourSchema.virtual('durationinweek').get(function (){
    return this.duration / 7;
  })

  // document middleware
  tourSchema.pre('save', function(next) {
    this.slug = slugify(this.name, {lower:true})
    next()
  })

  tourSchema.pre('save', function (next) {
    console.log("saving")
    next()
  })

  tourSchema.post('save', function (doc, next) {
    console.log(doc)
    next()
  })

  const Tour = mongoose.model('Tour' , tourSchema)

  module.exports = Tour