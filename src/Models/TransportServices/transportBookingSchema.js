const mongoose = require("mongoose");
const { locationSchema } = require("../Common/locationSchema");

// const initialLocationSchema = new mongoose.Schema({
//     latitude: { type: String, required: true },
//     longitude: { type: String, required: true },
//     address: { type: String, required: true },
//     nearbyPlace: { type: String }
// });

const purchaseDetailsSchema = new mongoose.Schema({
    purchase: { type: Boolean, required: true },
    items: {
        type: [String],
        default: []
    },
    purchaseAmount: {
        type: Number,
        default: 0
    },
    finalAmount: {
        type: Number,
        default: 0
    },
    billPicture: {
        type: String,
        default: null // change it to "" in case of an error 
    },
    specialInstruction: {
        type: String,
        default: null // change it to "" in case of an error 
    }
});



const transportBookingSchema = new mongoose.Schema({
    userId: {
        // type: String,
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    serviceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "TransportService",
        required: true
    },
    rideType: {
        type: String,
        required: true
    },
    pickupType: {
        type: String,
        required: true
    },
    riderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Rider'
    },
    initialLocation: {
        type: { type: String },
        coordinates: []
        // required: true
    },
    finalLocation: {
        type: { type: String },
        coordinates: []
        // required: true
    },
    stopsLocation: [
        {
            location: {
                type: { type: String },
                coordinates: []
            }
        }
    ],
    totalAmount: {
        type: Number,
    },
    totalDistance: {
        type: Number
    },
    createdAt: {
        type: Date,
        default: new Date()
    },
    updatedAt: {
        type: Date,
        default: new Date()
    },
    totalTime: {
        type: Number
    },
    images: {
        type: [String],
        default: [],
    },
    purchaseDetails: {
        type: purchaseDetailsSchema
    },
    paymentMethod: {
        type: String,
        enum: {
            values: ["balance", "card"],
            message: `{VALUE} is not a valid payment method`,
        }
    },
    parcelInformation: {
        type: String
    },
    categoriesAccepted: {
        type: [String]
    },
    vehicleTypeAccepted: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "VehicleType"
    },
    fieldsInput: {
        type: String
    },
    // rideCancelled : {
    //     type : Boolean
    // },
    rideStatus: {
        type: String,
        enum: {
            values: ["completed", "riderCancelled", "userCancelled", "incomplete", "inProgress", "finding"],
            message: `{VALUE} is not a valid ride status`,
        },
        default: "finding"
    }

})




module.exports = mongoose.model("TransportBooking", transportBookingSchema);
