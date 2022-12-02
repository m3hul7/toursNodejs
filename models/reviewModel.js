const mongoose = require('mongoose')
const Tour = require("./../models/tourModel")

reviewSchema = new mongoose.Schema({
    review : {
        type: String,
        required: [true, 'review field is required']
    },
    rating : {
        type: Number,
        min: 1,
        max: 5
    },
    createdAt : {
        type: Date,
        default: Date.now()
    },
    tour : {
        type: mongoose.Schema.ObjectId,
        ref: 'Tour',
        required: [true, 'review must belong to tour']

    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'review must belong to user']
    }
},
{
    toJSON: { virtuals: true},
    toObject: { virtuals: true}
}
);

reviewSchema.index({ tour : 1, user: 1}, { unique: true})

reviewSchema.statics.calculateAvgRating = async function(tourId) {
    const stats = await this.aggregate([
        {
            $match : {tour: tourId}
        },
        {
            $group : {
                _id: '$tour',
                nRating: { $sum : 1},
                avgRating: { $avg: '$rating'}
            }
        }
    ])
    await Tour.findByIdAndUpdate(tourId, {
        ratingAverage: stats.avgRating,
        ratingQuantity: stats.nRating
    })
    console.log(stats)
}

reviewSchema.post('save', function() {
    this.constructor.calculateAvgRating(this.tour)
})

// calculating average rating on update and delete query which should reflect on tour
// reviewSchema.pre(/^findOneAnd/, async function (next) {
//     this.r = await this.findOne()
//     console.log(this.r)
//     next()
// })

// reviewSchema.post(/^findOneAnd/, async function () {
//     // await this.r.constructor.calculateAvgRating(this.r.tour)

// })


reviewSchema.pre(/^find/, function(next) {
    this
    // .populate({
    //     path: 'tour',
    //     select: 'difficulty'
    // })
    .populate({
        path: 'user',
        select: 'name photo'
    })
    next()
})
const Review = mongoose.model('Review', reviewSchema)

module.exports = Review;