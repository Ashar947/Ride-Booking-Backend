const mongoose = require("mongoose");

const transportReviewsSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    riderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Rider",
    },
    serviceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "TransportService",
    },
    serviceBookingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "TransportBooking",
    },
    serviceRating: {
        type: Number
    },
    serviceComment: {
        type: String
    },
    riderRating: {
        type: Number
    },
    riderComment: {
        type: String
    },
    createdAt: {
        type: Date,
        default: new Date()
    }
})



module.exports = mongoose.model('TransportReview', transportReviewsSchema)