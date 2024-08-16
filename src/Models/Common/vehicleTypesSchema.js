const mongoose = require("mongoose");
const vehicleTypeSchema = new mongoose.Schema({
    vehicleName: {
        type: String,
        required: true
    },
    pickUser: {
        type: String,
        enum: {
            values: ["1", "2","3"], // 1 is true , 2 is false , 3 optional
            message: `{VALUE} is not a specified user accompany type`,
        },
        required: true
    },
    maxPassenger: {
        type: Number,
        required: true
    },
    weightAllowed: { // in kgs 
        type: Number,
        required: true
    },
    iconLink: {
        type: String,
        // required: true
    },
    description: {
        type: String,
    }
})



module.exports = mongoose.model("VehicleType", vehicleTypeSchema);
