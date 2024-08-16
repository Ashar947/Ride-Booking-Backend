const mongoose = require("mongoose");


const subServicesSchema = new mongoose.Schema({
    serviceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Service",
        required: true
    },
    subServiceName: {
        type: String,
        required: true
    },
    subServiceDescription: {
        type: String,
        required: true
    },
    iconLink: {
        type: String,
        // required: true
    },
    pickupType: {
        type: [String], // add validation function based on main service 
    },
    rideType: {
        type: [String], // add validation function based on main service 
    },
    quotationRequired: {
        type: Boolean,
        required: true
    },
    imagesAccepted: {
        type: Boolean,
        required: true
    },
    imagesHeading: {
        type: String
    },
    categoryRequired :{
        type : Boolean,
        required:true
    },
    categoryOptions: {
        type: [String],
        default: []
    },
    // rideStartDate: {
    //     type: Date
    // },
    // rideStartsNow: {
    //     type: Date
    // },
    userAccompany: {
        type: String,
        enum: {
            values: ["1", "2","3"], // 1 is true , 2 is false , 3 optional
            message: `{VALUE} is not a specified user accompany type`,
        },
        required: true
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



module.exports = mongoose.model("SubService", subServicesSchema);
