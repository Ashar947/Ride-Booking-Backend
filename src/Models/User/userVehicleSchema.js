const mongoose = require("mongoose");
const userVehicleSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    color: {
        type: String,
        required: true
    },
    images: {
        type: [String],
        default: []
    },
    registrationNumber: {
        type: String,
        required: true
    }
    // rest will be added based on vehicle verification response 
});
module.exports = mongoose.model("UserVehicle", userVehicleSchema);
