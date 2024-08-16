const express = require("express");
const router = express.Router();
const { createMainService,
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
} = require('../Controller/serviceController');

const userAuth = require('../Middleware/userAuth')
const serviceProviderAuth = require('../Middleware/serviceProviderAuth')
const adminAuth = require('../Middleware/adminAuth')
// const riderAuth = require('../Middleware/transportRiderAuth')
// instead use serviceProviderAuth



// Admin Routes 


// create routes for main and subService as well 
// router.route('').get(adminAuth, getAllServices).post(adminAuth, createService).put(adminAuth, updateService).delete(adminAuth, deleteService)
router.route('/mainService').get(allMainServices).post(adminAuth, createMainService).put(adminAuth, updateMainService).delete(adminAuth, deleteMainService)
router.route('/subService').get(allSubServices).post(adminAuth, createSubService).put(adminAuth, updateSubService).delete(adminAuth, deleteSubService)
router.route("/subService/:id").get(subServicesAgainstServiceId)

// router.route('/serviceBookings').get(adminAuth, getAllServiceBookings)


// User Routes 
router.route('/booking/:id').post(userAuth, createServiceBooking)
    .get(userAuth, serviceBookingById)
// .delete(userAuth, cancelServiceBooking)

router.route('/booking').get(userAuth, usersServiceBookings)
router.route('/user/quotation/:id/:quotationId').put(userAuth, acceptQuotation);

// router.route('/booking/quotations/:id').get(userAuth,getAllQuotations) // against serviceBooking
// router.route('/booking/quotation/:id').put(userAuth,acceptQuotation) // against ServiceBooking



router.route('/serviceProvider/quotation/:id').post(serviceProviderAuth, sendQuotationForBooking)

// also add routes to cancel and delete quotation 





module.exports = router;
