const mongoose = require("mongoose");

const locationSchema = new mongoose.Schema({
    latitude: { type: String, 
        // required: true 
    },
    longitude: { type: String, 
        // required: true 
    },
    address: { type: String, required: false },
    type: {
        type: String,
        enum: {
            values: ["1", "2","3"], // 1 is Home , 2 is shop , 3 current location
            message: `{VALUE} is not a specified location type`,
        },
        required: false
    },
    nearbyPlace: {
        type: String,
        required: false
    }
});



module.exports = { locationSchema }