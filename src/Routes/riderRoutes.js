const express = require("express");
const router = express.Router();
const riderAuth = require("../Middleware/transportRiderAuth");
const multer = require("multer");
const {
    registerRider,
    uploadDocs,
    authWithUaePass,
    loginRider,
    logoutRider,
    resetPasswordRequest,
    resetPassword,
    verifyRiderOtp,
    verifyPhone,
} = require("../Controller/riderController");
const uploadToCloudinary = require("../Middleware/cloudinaryConfig");

// Creating a multer instance to handle files in the memory
const upload = multer({ storage: multer.memoryStorage() });

router.route("/register").post(registerRider);
router.route("/uploadDocs").post(upload.array("files"), uploadToCloudinary, uploadDocs);
router.route("/auth/uaePass").post(authWithUaePass);
router.route("/login").post(loginRider);
router.route("/logout").post(riderAuth, logoutRider);
router.route("/resetPassword").post(riderAuth, resetPasswordRequest).patch(riderAuth, resetPassword);
router.route("/verifyOtp").post(riderAuth, verifyRiderOtp);
router.route("/verifyPhone").post(verifyPhone);


module.exports = router;
