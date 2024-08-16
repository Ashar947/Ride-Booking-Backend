const mongoose = require("mongoose");
const { locationSchema } = require("../Common/locationSchema");

const priceDetailsSchema = new mongoose.Schema({
    quotedPrice: {
        type: Number,
        default: 0
    },
    finalPrice: {
        type: Number,
        default: 0
    }
});



const quotationSchema = new mongoose.Schema({
    serviceProviderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ServiceProvider",
        required: true
    },
    quotedPrice: {
        type: Number
    },
})

// const quotationSchema = new mongoose.Schema({
//     vendorId: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "Vendors",
//         required: true
//     },
//     quotedPrice: {
//         type: Number,
//         required: true
//     },
//     quotedAt: {
//         type: Date,
//         default: Date.now
//     }
// })

const serviceBookingSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    serviceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Service",
        required: true
    },
    subServices: [
        {
            subServiceId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "SubService",
                required: true
            },
            pickupType: {
                type: String,
                required: true
            },
            rideType: {
                type: String,
                required: true
            }
        }
    ],
    priceDetails: {
        type: priceDetailsSchema
    },
    totalDistance: {
        type: Number
    },
    totalTime: {
        type: Number
    },
    initialLocation: {
        type: { type: String },
        coordinates: []
    },
    finalLocation: {
        type: { type: String },
        coordinates: []
    },
    stopsLocation: [
        {
            location: {
                type: { type: String },
                coordinates: []
            }
        }
    ],
    quotationAccepted: {
        type: quotationSchema,
        default: null
    },
    quotations: {
        type: [quotationSchema],
        default: []
    },
    categoriesSelected: {
        type: [String],
        default: []
    },
    rideStartTime: {
        type: String,
    },
    serviceProviderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ServiceProvider",
        default: null
    },
    specialInstruction: {
        type: String,
        required : true
    },
    systemMessage: {
        type: String
    },
    bookingStatus: {
        type: String,
        enum: {
            values: ["completed", "riderCancelled", "userCancelled", "incomplete", "inProgress", "pending", "quoted", "confirmed"],
            // completed => The service has been provided and the booking is complete
            // riderCancelled => The booking has been cancelled by the service provider
            // userCancelled => The booking has been cancelled by the user
            // inProgress => The service is in process, and is being carried out
            // pending => The user has placed the booking, but has no recieved any quotations
            // quoted => Service providers have made quotations for this booking, but the user hasn't selected any quotation yet
            // confirmed => The user selected a quotation
            message: `{VALUE} is not a valid status`,
        },
        default: "pending"
    },
    createdAt: {
        type: Date,
        default: new Date()
    }

})


serviceBookingSchema.index({ initialLocation: '2dsphere' });
serviceBookingSchema.index({ finalLocation: '2dsphere' });




module.exports = mongoose.model("ServiceBooking", serviceBookingSchema);
