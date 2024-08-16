const mongoose = require("mongoose");

const otpRequestsSchema = new mongoose.Schema({
    userId: {
        type: String,
        // type: mongoose.Schema.Types.ObjectId,
        // ref: "User",
        required: true,
    },
    userType : {
        type: String,
        enum: {
            values: ["user", "rider", "serviceProvider"],
            message: `{VALUE} is not supported`,
        },
        required: true,
    },
    otp: {
        type: String,
        required: true,
    },
    requestReason: {
        type: String,
        enum: {
            values: ["resetPassword", "accountCreation", "forgotPassword"],
            message: `{VALUE} is not supported`,
        },
        // required: true,
    },
    createdAt: {
        type: Date,
        default: new Date(),
    }
});

module.exports = mongoose.model("OTPRequest", otpRequestsSchema);


// Enum for otp requests reason