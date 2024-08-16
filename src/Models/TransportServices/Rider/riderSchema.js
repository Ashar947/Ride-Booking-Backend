const mongoose = require("mongoose");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { locationSchema } = require("../../Common/locationSchema");
const { documentSchema } = require("../../Common/documentSchema");
const { vehicleImage } = require("../../Common/vehicleImageSchema");




const riderSchema = new mongoose.Schema({
	firstName: {
		type: String,
		required: true,
	},
	lastName: {
		type: String,
		required: true,
	},
	email: {
		type: String,
		required: true,
		unique: true,
	},
	phoneNo: {
		type: String,
		required: true,
		// unique: true,
	},
	documents: {
		type: documentSchema
	},
	vehicleImage: {
		type: vehicleImage
	},
	password: {
		type: String,
		required: true,
	},
	domain: {
		type: String,
		enum: {
			values: ["self", "uaepass"],
			message: `{VALUE} is not supported`,
		},
		required: true,
		default: 'self',
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
		enum: ['accepted', 'pending', 'rejected','training'], 
		default: 'training',
	},
	totalRides: {
		type: Number,
	},
	todayEarning: {
		type: Number
	},
	vehicleTypeId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "VehicleType"
	},
	serviceId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "TransportService",
	},
	rideTypesAccepted: {
		type: [String],
		default: []
	},
	pickupTypesAccepted: {
		type: [String],
		default: []
	},
	riderStatus: {
		type: String,
		enum: ['online', 'offline', 'inride'],
		default: "offline"
	},
	acceptanceToPay: {
		type: Boolean,
		required: true
	},
	location: {
		type: { type: String},
		coordinates: []
	},
	tokens: [
		{
			token: {
				type: String,
				required: true,
			},
		},
	],
});

riderSchema.index({ location: '2dsphere' });

riderSchema.pre("save", async function (next) {
	try {
		if (this.isModified("password")) {
			this.password = await bcrypt.hash(this.password, 12);
		}
		next();
	} catch (error) {
		throw new Error("Error Creating Account");
	}
});

riderSchema.methods.updatePassword = async function (password) {
	try {
		this.password = await bcrypt.hash(password, 12);
		return true
	} catch (error) {
		throw new Error(error.message)
	}
}

riderSchema.methods.createPasswordToken = async function () {
	const passToken = jwt.sign({ _id: this._id }, process.env.SECRETKEY, '1d');
	this.resetLink = passToken;
	return true
}

riderSchema.methods.generateAuthToken = async function () {
	try {
		let genToken = jwt.sign({ _id: this._id }, process.env.SECRETKEY);
		this.tokens = this.tokens.concat({ token: genToken });
		await this.save();
		return genToken;

	} catch (error) {
		console.log(`Error: ${error}`);
	}
};

riderSchema.methods.checkTokenValidity = async function (token) {
	const valid = jwt.verify(token, process.env.SECRETKEY);
	if (!valid) {
		return false
	}
	return true
};

riderSchema.methods.comparePassword = async function (enteredPassword, next) {
	return await bcrypt.compare(`${enteredPassword}`, `${this.password}`);
};

module.exports = mongoose.model('Rider', riderSchema);