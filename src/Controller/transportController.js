const { throw_error } = require("./commonControllers");

const TransportService = require('../Models/TransportServices/transportServiceSchema')
const TransportBooking = require('../Models/TransportServices/transportBookingSchema')
const Rider = require('../Models/TransportServices/Rider/riderSchema')
const User = require('../Models/User/userSchema')


const assignRideToRider = async ({ maxDistance, longitude, latitude }) => {
    // const assignRideToRider = async ({ userId, bookingId, pickupType, rideType }) => {

    try {
        // const longitude = 67.036736;
        // const latitude = 24.845211;
        const riders = await Rider.aggregate([
            {
                $geoNear: {
                    near: {
                        type: "Point", coordinates: [parseFloat(longitude), parseFloat(latitude)]
                    },
                    key: "location",
                    maxDistance: parseFloat(maxDistance) * 1609,
                    distanceField: 'dist.calculated',
                    spherical: true,
                    distanceField: "distance",
                    distanceMultiplier: 0.001,
                }
            }
        ])
        if (!riders || riders.length === 0) {
            return { success: false, rider: null, message: "Unable To Find Rider" }
        }
        const index = riders.length > 1 ? Math.floor(Math.random() * (riders.length - 1 - 0 + 1)) + 0 : 0
        const rider = riders[index]
        // const random  =Math.floor(Math.random() * riders.length);
        console.log(index, "random")
        return { success: true, rider, message: "Rider Found" }
        // return res.status(200).json({message : "Riders With In 5 Km's",data : {riders},success : true})
    } catch (error) {
        console.log(error)
        return { success: false, rider: null, message: error.message }
    }
}

const getAllTransportServices = async (req, res) => {
    try {
        const transportServices = await TransportService.find()
            .populate('vehiclesAccepted.vehicleTypeId')
            .exec();
        // const transportServices = await TransportService.find();
        return res.status(200).json({ message: "Transport Services Retrieved Successfully .", data: { transportServices }, success: true })
    } catch (error) {
        return res.status(400).json({ message: error.message, success: false })
    }
}

const createTransportService = async (req, res) => {
    try {
        const { serviceName,
            pickupType,
            rideType,
            vehiclesAccepted,
            categoryAcceptance,
            categoriesOptions,
            acceptImages,
            rideOptions,
            fieldsInput } = req.body;
        const transportService = new TransportService({
            serviceName,
            pickupType,
            rideType,
            vehiclesAccepted,
            categoryAcceptance,
            categoriesOptions,
            acceptImages,
            rideOptions,
            fieldsInput: JSON.stringify(fieldsInput)
        })
        await transportService.save();
        await transportService.populate('vehiclesAccepted.vehicleTypeId');
        return res.status(200).json({ message: 'Transport Service Created', data: { transportService }, success: true })
    } catch (error) {
        return res.status(400).json({ message: error.message, success: false })
    }
}

const updateTransportService = async (req, res) => {
    try {
        const { id } = req.params;
        const transportService = await TransportService.findOne({ _id: id })
        if (!transportService) {
            throw_error("Transport Service Not Found")
        }
        const { serviceName,
            pickupType,
            rideType,
            vehiclesAccepted,
            categoryAcceptance,
            categoriesOptions,
            acceptImages,
            rideOptions,
            fieldsInput } = req.body
        transportService.serviceName = serviceName
        transportService.pickupType = pickupType
        transportService.rideType = rideType
        transportService.vehiclesAccepted = vehiclesAccepted
        transportService.categoryAcceptance = categoryAcceptance
        transportService.categoriesOptions = categoriesOptions
        transportService.acceptImages = acceptImages
        transportService.rideOptions = rideOptions
        transportService.fieldsInput = JSON.stringify(fieldsInput)
        await transportService.save()
        return res.status(200).json({ message: 'Service Updated', data: { transportService }, success: true })
    } catch (error) {
        return res.status(400).json({ message: error.message, success: false })
    }
}

const deleteTransportService = async (req, res) => {
    try {
        const { id } = req.params;
        const service = await TransportService.deleteOne({ _id: id });
        if (service.deletedCount > 0) {
            return res.status(200).json({ message: "Service Deleted", data: { id }, success: false })
        } else {
            throw_error("Unable To Delete Service")
        }
    } catch (error) {
        return res.status(400).json({ message: error.message, success: false })

    }
}

const validatePickUpType = (mainServiceTypes, currentType) => {
    if (mainServiceTypes.includes(currentType)) {
        return true
    } else {
        return false
    }
}

const createTransportBooking = async (req, res) => {
    try {
        const { rideType, pickupType, totalDistance, totalTime, vehicleTypeAccepted, paymentMethod, purchaseDetails, categoriesAccepted, initialLocation, finalLocation } = req.body
        const user = req.user
        const { id } = req.params
        const service = await TransportService.findOne({ _id: id })
        if (!service) {
            throw_error("Service Not Found")
        }
        if (!validatePickUpType(service.pickupType, pickupType) || !validatePickUpType(service.rideType, rideType)) {
            throw_error("Ride Type Is Not Valid")
        }
        // TODO : images , location , field
        const booking = new TransportBooking({
            userId: user._id,
            serviceId: id,
            rideType,
            pickupType,
            // fieldsInput: fieldsInput ?  JSON.stringify(fieldsInput) : '',
            fieldsInput: '',
            totalDistance,
            totalTime,
            vehicleTypeAccepted,
            paymentMethod,
            initialLocation,
            finalLocation
        })
        if (pickupType === "1") {
            if (["1", "2"].includes(rideType)) {
                // add check for total distance in
                booking.purchaseDetails = null
                if (req.body.stopsLocation) {
                    booking.stopsLocation = req.body.stopsLocation
                }

            } else {
                throw_error("Invalid Ride Type")
            }
        } else if (pickupType === "2") {
            if (["1"].includes(rideType)) {
                // add check for total distance since it only supports with in city 
                if (!purchaseDetails || purchaseDetails == {}) {
                    throw_error("Enter Purchase Details")
                }
                booking.purchaseDetails = purchaseDetails

            } else {
                throw_error("Invalid Ride Type")
            }

        } else {
            // pickup Type 3 will not be handled here .
            throw_error("Pickup Type Is Not Valid")
        }

        if (service.categoryAcceptance) {
            booking.categoriesAccepted = categoriesAccepted && categoriesAccepted.length > 0 ? categoriesAccepted : []
        }
        const { rider, success } = await assignRideToRider({ maxDistance: 5, longitude: initialLocation.coordinates[0], latitude: initialLocation.coordinates[1] })
        if (!success) {
            throw_error("All Riders Are Busy At The Moment Please Try Again Later .")
        }
        console.log(rider._id)
        booking.riderId = rider._id
        // emit socket for rider
        await booking.save()
        await booking.populate([
            'userId',
            'serviceId',
            'vehicleTypeAccepted',
            'riderId'
        ]);
        const bookingObject = booking.toObject();
        delete bookingObject.userId.password;
        delete bookingObject.userId.createdAt;
        delete bookingObject.userId.tokens;
        delete bookingObject.riderId.password;
        delete bookingObject.riderId.domain;
        delete bookingObject.riderId.isActive;
        delete bookingObject.riderId.phoneVerified;
        delete bookingObject.riderId.accountStatus;
        delete bookingObject.riderId.rideTypesAccepted;
        delete bookingObject.riderId.pickupTypesAccepted;
        delete bookingObject.riderId.riderStatus;
        delete bookingObject.riderId.acceptanceToPay;
        delete bookingObject.riderId.tokens;
        return res.status(200).json({ message: "Booking Created", data: { booking: bookingObject }, success: true })
    } catch (error) {
        return res.status(400).json({ message: error.message, success: true })
    }
}


const cancelTransportBooking = async (req, res) => {
    try {
        // user will use this route to cancel booking ;
        const user = req.user;
        const { id } = req.params
        const transportBooking = await TransportBooking.findOne({ _id: id, userId: user._id })
        if (!transportBooking) {
            throw_error("Unable To Find Booking")
        }
        transportBooking.rideStatus = "userCancelled"
        await transportBooking.save()
        return res.status(200).json({ message: "Your Ride Has Been Cancelled .", data: { transportBooking }, success: true })

    } catch (error) {
        return res.status(400).json({ message: `Unable To Cancel Your Ride . ${error.message}`, success: false })

    }
}


const getAllTransportBookingsByUser = async (req, res) => {
    try {
        const { _id } = req.user;
        const transportBookings = await TransportBooking.find({ userId: _id })
            .populate("serviceId").populate("vehicleTypeAccepted")
            .exec();
        return res.status(200).json({ message: "Transport Booking fetched successfully .", data: { transportBookings }, success: true })

    } catch (error) {
        return res.status(400).json({ message: `An Error Occurred While Fetching Transport Bookings .${error.message}`, success: true })

    }
}



const getAllTransportBookings = async (req, res) => {
    try {
        const transportBookings = await TransportBooking.find();
        return res.status(200).json({ message: "Transport Booking fetched successfully .", data: { transportBookings }, success: true })

    } catch (error) {
        return res.status(400).json({ message: `An Error Occurred While Fetching Transport Bookings .${error.message}`, success: true })

    }
}




const riderRejectBooking = async (req, res) => {
    try {
        const rider = req.rider;
        const { id } = req.params
        const transportBooking = await TransportBooking.findOne({ _id: id, riderId: rider._id })
        if (!transportBooking) {
            throw_error("Booking Not Found Against Rider");
        }
        transportBooking.riderId = null;
        transportBooking.rideStatus = "riderCancelled"
        // add socket that rider has cancelled a specific ride 
        await transportBooking.save()
        return res.status(200).json({ message: "Your Request Has Been Approved", data: { transportBooking }, success: true })
    } catch (error) {
        return res.status(400).json({ message: `Unable To Complete Your Request . ${error.message}`, success: false })
    }
}

const riderUpdateBooking = async (req, res) => {
    try {
        // this route will be used to update ride status by rider 
        const rider = req.rider;
        const { id } = req.params
        const { rideStatus } = req.body
        const transportBooking = await TransportBooking.findOne({ _id: id, riderId: rider._id })
        if (!transportBooking) {
            throw_error("Booking Not Found Against Rider");
        }
        transportBooking.riderId = null;
        transportBooking.rideStatus = rideStatus
        // add socket that rider has cancelled a specific ride 
        await transportBooking.save()
        return res.status(200).json({ message: "Your Request Has Been Approved", data: { transportBooking }, success: true })
    } catch (error) {
        return res.status(400).json({ message: `Unable To Complete Your Request . ${error.message}`, success: false })
    }
}









module.exports = {
    createTransportService,
    getAllTransportServices,
    updateTransportService,
    deleteTransportService,
    createTransportBooking,
    cancelTransportBooking,
    getAllTransportBookingsByUser,
    getAllTransportBookings,
    riderRejectBooking,
    riderUpdateBooking
};