const express = require("express");
const router = express.Router();
const adminAuth = require('../Middleware/adminAuth');
const { createAdmin, adminLogin, updateAdminPassword, getAllAdmins, createVehicleType, allVehicleTypes, deleteVehicleType, updateVehicleType } = require("../Controller/adminController");
// Auth
router.route("").get(getAllAdmins)
router.route("/create").post(createAdmin);
router.route('/login').post(adminLogin);
router.route('/updatePassword').put(adminAuth, updateAdminPassword)

// Vehicle Types Route

router.route('/vehicle').post(adminAuth, createVehicleType).get(adminAuth, allVehicleTypes)
router.route('/vehicle/:id').put(adminAuth, updateVehicleType).delete(adminAuth, deleteVehicleType)

// router.route('/vehicle/assign/:id').put(assignVehicleToService) TODO : Later => Will be used to assign vehicle to service
/* 
// For Transport Services

// For Services

// For Rider
router.route('/riders').get(adminAuth,()=>{console.log("GET ALL Riders")})
router.route('/rider/ban').put(adminAuth,()=>{console.log("Ban User")}).patch(adminAuth,()=>{console.log("Un ban User")})
router.route('/rider/requests').get(adminAuth)
router.route('/rider/update/:id').get(adminAuth,()=>{console.log("Update rider")})
router.route('/rider/request/:id').put(adminAuth,()=>{console.log('Get data from based based on that accept rider or else send remarks to rider mail ')})

// For Service Providers

// For User

router.route('/users').get(adminAuth,()=>{console.log("Get All Users")})
router.route('/user/ban').put(adminAuth,()=>{console.log("Ban User")}).patch(adminAuth,()=>{console.log("Un ban User")})
*/

module.exports = router;
