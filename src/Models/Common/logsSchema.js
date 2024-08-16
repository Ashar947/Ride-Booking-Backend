const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const logsSchema = new mongoose.Schema({
    userId: {
        type: String,
        // type: mongoose.Schema.Types.ObjectId,
        // ref: "User",
        required: true,
    },
    userType : {
        type: String,
        enum: {
            values: ["user", "rider" , "admin"],
            message: `{VALUE} is not supported`,
        },
        required: true,
    },
    message: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: new Date(),
    }
});

module.exports = mongoose.model("Log", logsSchema);


// Enum for otp requests reason