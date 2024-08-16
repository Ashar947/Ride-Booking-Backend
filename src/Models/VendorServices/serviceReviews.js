// add pre save functions that will overall update the serviceProvider Rating.

const mongoose = require("mongoose");

const serviceReview = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    serviceBookingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ServiceBooking",
        required: true
    },
    serviceRating: {  // service provider rating  
        type: Number
    },
    serviceComment: { // service provider rating 
        type: String
    },
    createdAt: {
        type: Date,
        default: new Date()
    },
    updatedAt: {
        type: Date,
        default: new Date()
    }

})
module.exports = mongoose.model("ServiceReview", serviceReview);