const { throw_error } = require("./commonControllers");

const Service = require('../Models/VendorServices/serviceSchema')
const SubService = require("../Models/VendorServices/subServiceSchema")
const ServiceBooking = require("../Models/VendorServices/serviceBookingSchema")

const validatePickUpTypes = (mainServiceTypes, currentTypes) => {
    for (const currentType of currentTypes) {
        if (!mainServiceTypes.includes(currentType)) {
            return false
        }
    }
    return true
}

const createMainService = async (req, res) => {
    try {
        const { serviceName, description, pickupType, rideType } = req.body;
        const service = new Service({
            serviceName,
            description,
            iconLink: req.body.iconLink ?? null,
            pickupType,
            rideType
        })
        await service.save()
        return res.status(200).json({ message: "Service Has Been Created", data: { service }, success: true })
    } catch (error) {
        return res.status(400).json({ message: `Unable To Create Service . ${error.message}`, success: false })
    }
}

const createSubService = async (req, res) => {
    try {
        const id = req.body.serviceId;

        const service = await Service.findOne({ _id: id })
        if (!service) {
            throw_error("Service Not Found")
        }
        const { serviceId,
            subServiceName,
            subServiceDescription,
            pickupType,
            rideType,
            quotationRequired,
            imagesAccepted,
            categoryRequired,
            userAccompany } = req.body
        const subService = new SubService({
            serviceId,
            subServiceName,
            subServiceDescription,
            iconLink: req.body.iconLink ?? null,
            quotationRequired,
            imagesAccepted,
            imagesHeading: imagesAccepted ? req.body.imagesHeading ?? null : null,
            categoryRequired,
            categoryOptions: categoryRequired ? req.body.categoryOptions ?? [] : [],
            userAccompany
        })
        // check for pickup and ride type validity
        if (pickupType) {
            if (!validatePickUpTypes(service.pickupType, pickupType)) {
                throw_error("Invalid Pickup Type in Sub Service . Please Add Pickup Type In Main Service.")
            }
            subService.pickupType = pickupType
        }
        if (rideType) {
            if (!validatePickUpTypes(service.rideType, rideType)) {
                throw_error("Invalid Pickup Type in Sub Service . Please Add Pickup Type In Main Service.")
            }
            subService.rideType = rideType
        }
        await subService.save()
        return res.status(200).json({ message: "Sub Service Created Successfully .", data: { subService }, success: true })
    } catch (error) {
        return res.status(400).json({ message: `${error.message}`, success: false })
    }
}

const allMainServices = async (req, res) => {
    try {
        const mainServices = await Service.find();
        return res.status(200).json({ message: "Main Services", data: { mainServices }, success: true })
    } catch (error) {
        return res.status(400).json({ message: error.message, success: false })
    }
}

const allSubServices = async (req, res) => {
    try {
        // const subServices = await SubService.find().populate('serviceId');
        const subServices = await SubService.find();
        return res.status(200).json({ message: "Sub Services", data: { subServices }, success: true })
    } catch (error) {
        return res.status(400).json({ message: error.message, success: false })
    }
}

const subServicesAgainstServiceId = async (req, res) => {
    try {
        const { id } = req?.params
        const service = await Service.findOne({ _id: id });
        if (!service) {
            throw_error("Service Not Found");
        }
        const subServices = await SubService.find({ serviceId: service._id })
        return res.status(200).json({ message: "Sub Services", data: { subServices }, success: true })
    } catch (error) {
        return res.status(400).json({ message: error.message, success: false })

    }
}

const updateMainService = async (req, res) => {
    try {
        const { id } = req.params;
        const mainService = await Service.findOne({ _id: id });

        if (!mainService) {
            throw_error("Service Not Found");
        }

        mainService.serviceName = req.body.serviceName ?? mainService.serviceName;
        mainService.description = req.body.description ?? mainService.description;
        mainService.iconLink = req.body.iconLink ?? mainService.iconLink;
        mainService.pickupType = req.body.pickupType ?? mainService.pickupType;
        mainService.rideType = req.body.rideType ?? mainService.rideType;

        await mainService.save();
        return res.status(200).json({ message: 'Service Updated', data: { mainService }, success: true });

    } catch (error) {
        return res.status(400).json({ message: error.message, success: false });
    }
}


const updateSubService = async (req, res) => {
    try {
        const { id } = req.params;
        const subService = await SubService.findOne({ _id: id });

        if (!subService) {
            throw_error("Sub Service Not Found");
        }

        const mainService = await Service.findOne({ _id: subService.serviceId });

        subService.subServiceName = req.body.subServiceName ?? subService.subServiceName;
        subService.subServiceDescription = req.body.subServiceDescription ?? subService.subServiceDescription;
        subService.iconLink = req.body.iconLink ?? subService.iconLink;
        subService.quotationRequired = req.body.quotationRequired ?? subService.quotationRequired;
        subService.imagesAccepted = req.body.imagesAccepted ?? subService.imagesAccepted;
        subService.imagesHeading = req.body.imagesAccepted ? req.body.imagesHeading ?? subService.imagesHeading : null;
        subService.categoryRequired = req.body.categoryRequired ?? subService.categoryRequired;
        subService.categoryOptions = req.body.categoryRequired ? req.body.categoryOptions ?? subService.categoryOptions : [];
        subService.userAccompany = req.body.userAccompany ?? subService.userAccompany;

        // checking pickup and ride type validity
        if (req.body.pickupType) {
            if (!validatePickUpTypes(mainService.pickupType, req.body.pickupType)) {
                throw_error("Invalid Pickup Type in Sub Service . Please Add Pickup Type In Main Service.");
            }
            subService.pickupType = req.body.pickupType;
        }
        if (req.body.rideType) {
            if (!validatePickUpTypes(mainService.rideType, req.body.rideType)) {
                throw_error("Invalid Pickup Type in Sub Service . Please Add Pickup Type In Main Service.");
            }
            subService.rideType = req.body.rideType;
        }

        await subService.save();
        return res.status(200).json({ message: 'Sub Service Updated', data: { subService }, success: true });
    } catch (error) {
        return res.status(400).json({ message: error.message, success: false });
    }
}

const deleteMainService = async (req, res) => {
    try {
        const { id } = req.params;
        const mainService = await Service.deleteOne({ _id: id });

        if (mainService.deletedCount > 0) {
            return res.status(200).json({ message: "Service Deleted", data: { id }, success: false });
        } else {
            throw_error("Unable To Delete Service");
        }
    } catch (error) {
        return res.status(400).json({ message: error.message, success: false });
    }
}

const deleteSubService = async (req, res) => {
    try {
        const { id } = req.params;
        const subService = await SubService.deleteOne({ _id: id });

        if (subService.deletedCount > 0) {
            return res.status(200).json({ message: "Service Deleted", data: { id }, success: false });
        } else {
            throw_error("Unable To Delete Service");
        }
    } catch (error) {
        return res.status(400).json({ message: error.message, success: false });
    }
}

const getAllServices = async () => {
    try {

    } catch (error) {

    }
}
// const createService = async () => {
//     try {


//     } catch (error) {

//     }
// }
// const updateService = async () => {
//     try {

//     } catch (error) {

//     }
// }
// const deleteService = async () => {
//     try {

//     } catch (error) {

//     }
// }




const createServiceBooking = async (req, res) => {
    try {
        const user = req.user;
        const { id } = req.params;
        const { subServices, categoriesSelected, totalDistance, totalTime, initialLocation, finalLocation, stopsLocation, specialInstruction
        } = req.body
        const service = await Service.findOne({ _id: id })
        if (!service) {
            throw_error("Service Not Found")
        }
        if (!specialInstruction) {
            throw_error("")
        }
        const booking = new ServiceBooking({
            userId: user._id,
            serviceId: id,
            priceDetails: {
                quotedPrice: 0,
                finalPrice: 0
            },
            quotations: [],
            categoriesSelected: categoriesSelected,
            totalDistance,
            totalTime,
            initialLocation,
            finalLocation,
            stopsLocation,
            specialInstruction,
        })
        let finalRideTypes = [];
        let finalPickUpType = [];
        // let subServiceNames = [];


        // add validation for subService array
        if (subServices && subServices.length > 0) {
            for (const { subServiceId, pickupType, rideType } of subServices) {
                const subService = await SubService.findOne({ _id: subServiceId })
                if (!subService) {
                    throw_error("Invalid SubService Selected .")
                }
                if (!(validatePickUpTypes(service.pickupType, [`${pickupType}`]) && validatePickUpTypes(service.rideType, [`${rideType}`]))) {
                    throw_error("Invalid Type Selected .")
                }
                booking.subServices = booking.subServices.concat({ subServiceId, pickupType, rideType });
                if (!finalPickUpType.includes(pickupType) && !finalRideTypes.includes(rideType)) {
                    finalPickUpType.push(pickupType)
                    finalRideTypes.push(rideType)
                }
                continue
            }
        } else {
            throw_error("Please Select At least One Service .")
        }
        await booking.save()
        const serviceBooking = await ServiceBooking.findOne({ _id: booking._id })
            // .populate('userId')
            .populate('serviceId')
            .populate('subServices.subServiceId')
            .exec();


        // if (finalPickUpType.includes("1") && finalPickUpType.includes("3")) {
        //     console.log("Considering initial location is the point where service will be provided then from that point other service will continue to final destination")
        //     if(finalPickUpType.includes("2")){
        //         console.log("ALSO \n")
        //         console.log("stop location will be required to due to pickup 2 => WILL ALSO GET THINGS .")
        //     }
        // } else if (finalPickUpType.includes("1")) {
        //     console.log("Get Initial And Final Location .")
        // } else if (finalPickUpType.includes("3")) {
        //     console.log("Get Initial Location => final location will be same .")
        // }
        return res.status(200).json({ message: "Booking Created", data: { serviceBooking }, success: true })
    } catch (error) {
        return res.status(400).json({ message: error.message, success: false })
    }
}

const usersServiceBookings = async (req, res) => {
    const userId = req.userID;

    try {
        const serviceBookings = await ServiceBooking.find({ userId })
            .populate('serviceId')
            .exec();

        if (!serviceBookings) {
            throw_error("Bookings not found");
        }

        return res.status(200).json({ message: "Service bookings of a user", data: { serviceBookings }, success: true });
    } catch (error) {
        return res.status(400).json({ message: error.message, success: false })
    }
}

const serviceBookingById = async (req, res) => {
    const { id } = req.params;

    try {
        const serviceBooking = await ServiceBooking.findById(id)
            .populate('userId')
            .populate('serviceId')
            .exec();

        if (!serviceBooking) {
            throw_error("Booking not found");
        }

        return res.status(200).json({ message: "Details of a single service booking", data: { serviceBooking }, success: true });
    } catch (error) {
        return res.status(400).json({ message: error.message, success: false })
    }
}

const sendQuotationForBooking = async (req, res) => {
    try {
        const { id } = req.params;
        const { serviceProviderId, quotedPrice } = req.body;

        const serviceBooking = await ServiceBooking.findById(id)
            .populate('userId')
            .populate('serviceId')
            .exec();

        if (!serviceBooking) {
            throw_error("No booking exists with this id");
        }

        if (serviceBooking.quotationAccepted) {
            throw_error("Quotations for this booking have been closed");
        }

        serviceBooking.quotations.push({
            serviceProviderId,
            quotedPrice
        });

        await serviceBooking.save()

        //TODO: emit socket to update quotation for user 
        //TODO: add push notification also 

        return res.status(200).json({ message: "Quotation Created", data: { serviceBooking }, success: true })
    } catch (error) {
        return res.status(400).json({ message: error.message, success: false })
    }
}


// can be handled in get booking by id
// const getQuotationsForBookings = async (req, res) => {
//     try {
//         const { id } = req.params
//         const serviceBooking = await ServiceBooking.findOne({ _id: id })
//         if (!serviceBooking) {
//             throw_error("")
//         }


//     } catch (error) {
//         return res.status(400).json({ message: error.message, success: false })
//     }
// }


const acceptQuotation = async (req, res) => {
    try {
        const { id, quotationId } = req.params;

        const serviceBooking = await ServiceBooking.findOne({ _id: id, "quotations._id": quotationId });

        if (!serviceBooking) {
            throw_error("This booking with this quotation doesnot exist");
        }

        const quotation = serviceBooking.quotations.filter(quotation => quotation._id.toString() === quotationId);

        if (quotation.length === 0) {
            throw_error("This quotation doesnot exist");
        }

        serviceBooking.quotationAccepted = quotation[0];
        serviceBooking.quotations = [];

        await serviceBooking.save();

        return res.status(201).json({ message: "Quotation Accepted", data: { serviceBooking }, success: true });
    } catch (error) {
        return res.status(400).json({ message: error.message, success: false });
    }
}


module.exports = {
    createMainService,
    createSubService,
    allMainServices,
    allSubServices,
    updateMainService,
    updateSubService,
    deleteMainService,
    deleteSubService,
    createServiceBooking,
    usersServiceBookings,
    serviceBookingById,
    sendQuotationForBooking,
    acceptQuotation,
    subServicesAgainstServiceId
}