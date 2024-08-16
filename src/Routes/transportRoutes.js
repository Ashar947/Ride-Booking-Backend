const express = require("express");
const router = express.Router();
const { createTransportService,
    getAllTransportServices,
    updateTransportService,
    deleteTransportService,
    createTransportBooking,
    cancelTransportBooking,
    getAllTransportBookingsByUser,
    getAllTransportBookings,
    riderRejectBooking,
    riderUpdateBooking } = require("../Controller/transportController");


const userAuth = require('../Middleware/userAuth')
const adminAuth = require('../Middleware/adminAuth')
const riderAuth = require('../Middleware/transportRiderAuth')


// Admin Routes 

router.route('').get(getAllTransportServices).post(adminAuth, createTransportService).put(adminAuth, updateTransportService).delete(adminAuth, deleteTransportService)
router.route('/bookings').get(adminAuth, getAllTransportBookings)


// User Routes 
router.route('/booking').get(userAuth, getAllTransportBookingsByUser)
router.route('/booking/:id').post(userAuth, createTransportBooking).delete(userAuth, cancelTransportBooking)
// post => id = service id 
// delete => id = serviceBookingId



// Rider Routes  
router.route('/rider/booking/:id').put(riderAuth, riderUpdateBooking) 
router.route('/rider/rejectBooking/:id').put(riderAuth, riderRejectBooking)




module.exports = router;