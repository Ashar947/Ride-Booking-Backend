const mongoose = require("mongoose");




const vehicleImage = new mongoose.Schema({
	front: {
		type: String,
	},
	back: {
		type: String,
	},
	rightSide: {
		type: String,
	},
	leftSide: {
		type: String,
	},
	numberPlate: {
		type: String,
	},
})


module.exports = { vehicleImage }