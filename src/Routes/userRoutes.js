const express = require("express");
const router = express.Router();
const userAuth = require("../Middleware/userAuth");

const {
  registerUser,
  loginUser,
  logoutUser,
  // validateAccessToken,
  resetPasswordRequest,
  resetPassword,
  verifyUserOTP,
  verifyPhone,
  authWithUaePass,
  authWithGoogle,
  fetchAllBookings,
  forgotPasswordRequest,
  verifyForgotPassOTP,
  resetForgotPassword,
} = require("../Controller/userController");

router.route("/register").post(registerUser);
router.route("/auth/uaePass").post(authWithUaePass)
router.route("/auth/google").post(authWithGoogle)
router.route("/login").post(loginUser);
router.route("/logout").post(userAuth, logoutUser);
router.route("/resetPassword").post(userAuth, resetPasswordRequest).patch(userAuth,resetPassword);
router.route("/forgotPassword").post(forgotPasswordRequest).patch(resetForgotPassword);
router.route("/verifyForgotPassOtp").post(verifyForgotPassOTP);
router.route("/verifyOtp").post(userAuth, verifyUserOTP);
router.route("/verifyPhone").post(verifyPhone);
router.route("/allbookings").get(userAuth, fetchAllBookings);

module.exports = router;
