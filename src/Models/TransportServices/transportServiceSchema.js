const mongoose = require("mongoose");
const { pickupTypeEnumValues, rideTypeEnumValues } = require("../Common/enum");


const transportServiceSchema = new mongoose.Schema({
    serviceName: {
        type: String,
        required: true
    },
    pickupType: {
        type: [String],
        validate: {
            validator: function (value) {
                return value.every(item => pickupTypeEnumValues.includes(item));
            },
            message: props => `${props.value} is not a valid ride type`
        }
    },
    rideType: {
        type: [String],
        validate: {
            validator: function (value) {
                return value.every(item => rideTypeEnumValues.includes(item));
            },
            message: props => `${props.value} is not a valid ride type`
        }
    },
    vehiclesAccepted: [
        {
            vehicleTypeId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "VehicleType"
            }
        }
    ],
    categoryAcceptance: {
        type: Boolean,
        required: true
    },
    categoriesOptions: {
        type: [String],
        default: [],
    },
    acceptImages: {
        type: Boolean,
        required: true
    },
    rideOptions: [
        {
            heading: {
                type: String
            },
            description: {
                type: String
            },
            thumbnail: {
                type: String
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
    fieldsInput : { // parsed JSON
        type : String
    }


})


module.exports = mongoose.model("TransportService", transportServiceSchema);

// fieldsInput will be parsed JSON . Sample =>  [ {label :"Message To the Rider" , required : true} ]
