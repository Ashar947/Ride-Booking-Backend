const mongoose = require("mongoose");
const { rideTypeEnumValues, pickupTypeEnumValues } = require("../Common/enum");

const serviceSchema = new mongoose.Schema({
    serviceName: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    iconLink: {
        type: String
    },
    createdAt: {
        type: Date,
        default: new Date()
    },
    updatedAt: {
        type: Date,
        default: new Date()
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
    }
})


module.exports = mongoose.model("Service", serviceSchema);
