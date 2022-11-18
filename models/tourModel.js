const mongoose = require("mongoose")
const slugify = require("slugify")

const tourSchema = new mongoose.Schema({
    name: {
      type: String,
      required: [true, 'tour must have name'],
      unique: true,
      trim: true,
      minlength: [10, 'minimum length of tour name should be 10 character'],
      maxlength: [40, 'maximum length of tour name should be 40 character']
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
      required: [true, 'A tour must have difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: "difficulty value does not match the enum values"
      }
    },
    ratingAverage: {
      type: Number,
      default: 4.8,
      min: [1, 'rating should be above 1.0'],
      max: [5, 'rating must be below 5.0']
    },
    ratingQuantity: {
      type: Number,
      default: 0
    },
    price: {
      type: Number,
      required: [true, 'tour must have price']
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function(val) {
          return val < this.price
        },
        message: "discount price ({VALUE}) has to be less than price"
      }
    },
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
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false
    }
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
    // console.log(doc)
    next()
  })

  // query middleware
  tourSchema.pre(/^find/g, function(next) {
    this.find({secretTour: {$ne : true}})
    this.start = new Date()
    next();
  })
  tourSchema.post(/^find/g, function(doc, next) {
    console.log(`query took : ${Date.now() - this.start} in milliseconds`)
    // console.log(doc);
    next()
  })

  // aggregate middleware
  tourSchema.pre('aggregate', function(next) {
    this.pipeline().unshift({$match : {secretTour : {$ne: true}}}),
    console.log(this.pipeline())
    next()
  })

  const Tour = mongoose.model('Tour' , tourSchema)

  module.exports = Tour