const mongoose = require("mongoose");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { locationSchema } = require("../../Common/locationSchema");
const { documentSchema } = require("../../Common/documentSchema");
const { vehicleImage } = require("../../Common/vehicleImageSchema");



const serviceProviderSchema = new mongoose.Schema({
    companyName: {
        type: String,
        required: true
    },
    officeAddress: {
        type: String
    },
    carDetails: {
        // type : carDetailSchema ,
        type: String
    },
    documents: {
        type: documentSchema
    },
    serviceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Service",
        required: true
    },
    vehicleImages: {
        type: vehicleImage
    },
    subServices: [
        {
            subServiceId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "SubService",
                required: true
            }
        }
    ],
    email: {
        type: String,
        required: true,
        unique:true
    },
    phoneNo: {
        type: String,
        required: true,
        unique:true
    },
    password: {
        type: String,
        required: true
    },
    riderStatus: {
        type: String,
        enum: ['online', 'offline', 'inride'],
        default: "offline"
    },
    location: {
        type: { type: String},
        coordinates: []
    },
    isActive: {
        type: Boolean,
        default: false
    },
    phoneVerified: {
        type: Boolean,
        default: false
    },
    accountStatus: {
        type: String,
        enum: ['accepted', 'pending', 'rejected'], // The status will be pending at time of register, and will be modified by the admin
        default: 'pending',
    },
    totalRides: {
        type: Number,
    },
    todayEarning: {
        type: Number
    },
    tokens: [
        {
            token: {
                type: String

            }
        }
    ]

})


serviceProviderSchema.index({ location: '2dsphere' });


serviceProviderSchema.pre("save", async function (next) {
    try {
        if (this.isModified("password")) {
            this.password = await bcrypt.hash(this.password, 12);
        }
        next();
    } catch (error) {
        throw new Error("Error Creating Account");
    }
});

serviceProviderSchema.methods.updatePassword = async function (password) {
    try {
        this.password = await bcrypt.hash(password, 12);
        return true
    } catch (error) {
        throw new Error(error.message)
    }
}

serviceProviderSchema.methods.createPasswordToken = async function () {
    const passToken = jwt.sign({ _id: this._id }, process.env.SECRETKEY, '1d');
    this.resetLink = passToken;
    return true
}

serviceProviderSchema.methods.generateAuthToken = async function () {
    try {
        let genToken = jwt.sign({ _id: this._id }, process.env.SECRETKEY);
        this.tokens = this.tokens.concat({ token: genToken });
        await this.save();
        return genToken;

    } catch (error) {
        console.log(`Error: ${error}`);
    }
};

serviceProviderSchema.methods.checkTokenValidity = async function (token) {
    const valid = jwt.verify(token, process.env.SECRETKEY);
    if (!valid) {
        return false
    }
    return true
};

serviceProviderSchema.methods.comparePassword = async function (enteredPassword, next) {
    return await bcrypt.compare(`${enteredPassword}`, `${this.password}`);
};

module.exports = mongoose.model("ServiceProvider", serviceProviderSchema);
