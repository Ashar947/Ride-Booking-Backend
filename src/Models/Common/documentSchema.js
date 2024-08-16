const mongoose = require("mongoose");



const documentSchema = new mongoose.Schema({
	passport: {
		type: String,
		default: ''
		// required: true,
	},
	visa: {
		type: String,
		default: ''
		// required: true,
	},
	emiratesIdFront: {
		type: String,
		default: ''
		// required: true,
	},
	emiratesIdBack: {
		type: String,
		default: ''
		// required: true,
	},
	emiratesIdExpiry: {
		type: Date,
		default: ''
		// required: true,
	},
	licenseFront: {
		type: String,
		default: ''
		// required: true,
	},
	licenseBack: {
		type: String,
		default: ''
		// required: true,
	},
	licenseExpiry: {
		type: Date,
		default: ''
		// required: true,
	},
	carRegistrationCardFront: {
		type: String,
		default: ''
		// required: true,
	},
	carRegistrationCardBack: {
		type: String,
		default: ''
		// required: true,
	},
	carRegistrationCardExpiry: {
		type: Date,
		default: ''
		// required: true,
	},
	companyLicense: {
		type: String,
		default: ''
	}
})


module.exports = { documentSchema }