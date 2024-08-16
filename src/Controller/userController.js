const { throw_error } = require("./commonControllers");
const { verifyOTP, generateOTP, destroyOTP } = require("./otpController")
const User = require("../Models/User/userSchema");
const OTP = require("../Models/Common/otpRequestsSchema");
const ServiceBooking = require("../Models/VendorServices/serviceBookingSchema");
const TransportBooking = require("../Models/TransportServices/transportBookingSchema");

const axios = require("axios");
const { createStripeCustomer } = require("./stripeController");
const { sendEmail } = require("./emailController");

// const finalAPI = async (AccessToken) => {
//   const config = {
//     headers: {
//       'Authorization': `Bearer ${AccessToken}`
//     }
//   };
//   await axios.get('https://stg-id.uaepass.ae/idshub/userinfo', config)
//     .then(response => {
//       console.log("userData", response.data);
//       return true
//     })
//     .catch(error => {
//       console.error(error);
//       return false
//     });
// };


const allUsers = async (req, res) => {
  try {
    const users = await User.find();
    return res.status(200).json({ success: true, message: "All Users Found Successfully .", data: { users } })
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message })
  }
};

const findUserById = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.params.id });
    if (!user) {
      return res.status(404).json({ success: false, message: "User Not Found" })
    }
    return res.status(200).json({ success: true, message: "User Found Successfully.", data: { user } })
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message })
  }
}

const banUser = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.params.id });
    if (!user) {
      return res.status(404).json({ success: false, message: "User Not Found" })
    }
    user.isActive = false
    await user.save()
    return res.status(200).json({ success: true, message: "User Has Been Banned Successfully.", data: { user } })
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message })

  }
}

const adminUpdateUser = async (req, res) => {
  try {
    const user = await User.findOneAndUpdate(
      { _id: req.params.id },
      { $set: { ...req.body } },
      { new: true }
    );
    return res.status(200).json({ success: true, message: "User Information Has Been Successfully.", data: { user } })
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message })
  }
}



const userDataWithUaePass = async (code) => {
  try {
    // const { code, state } = req.body;
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': 'Basic c2FuZGJveF9zdGFnZTpzYW5kYm94X3N0YWdl'
      }
    };
    const response = await axios.post(`https://stg-id.uaepass.ae/idshub/token?grant_type=authorization_code&redirect_uri=http://localhost:3000/3&code=${code}`, null, config)
    const access_token = response.data.access_token
    const dataResponse = await axios.get('https://stg-id.uaepass.ae/idshub/userinfo', {
      headers: {
        'Authorization': `Bearer ${access_token}`
      }
    })
    console.log("dataResponse", dataResponse.data)
    return { data: dataResponse.data, success: true }
  } catch (error) {
    return { data: {}, success: false }

    // return res.status(400).json({ message: error.message, success: false });
  }
}

const authWithUaePass = async (req, res) => {
  try {
    // const { code, state } = req.body;
    const { code } = req.body;
    const { data, success } = await userDataWithUaePass(code);
    if (!success) {
      throw_error("Error while authenticating with UaePass .")
    }
    const { firstnameEN, lastnameEN, fullnameEN, mobile, email } = data;
    const user = await User.findOne({ email });
    if (user) {
      const token = await user.generateAuthToken();
      res.cookie("jwtoken", token, {
        httpOnly: true,
      });
      if (!user.phone) {
        user.phone = mobile
        user.phoneVerified = true
        user.isActive = true
        await user.save()
      }
      res.status(200).json({
        data: { user, token },
        message: "User Logged In",
        success: true,
      });
    } else {
      const createUser = await User.create({
        firstName: firstnameEN, lastName: lastnameEN, email,
        phoneVerified: true, phone: mobile, domain: "uaepass", phoneVerified: true, isActive: true
      })
      const token = await createUser.generateAuthToken();
      res.cookie("jwtoken", token, {
        httpOnly: true,
      });
      return res.status(201).json({ data: { user: createUser, token }, message: "User Created Successfully .", success: true });
    }
  } catch (error) {
    return res.status(400).json({ message: error.message, success: false })
  }

}

const authWithGoogle = async (req, res) => {
  message = "";
  try {
    const { firstName, lastName, email } = req.body;
    const findUser = await User.findOne({ email });
    if (findUser) {
      if (findUser.domain !== "google") {
        throw_error(`Please Continue To Login With ${findUser.domain} .`)
      }
      const token = await findUser.generateAuthToken();
      res.cookie("jwtoken", token, {
        httpOnly: true,
      });
      message = "Logged In Successfully ."
      const userObject = findUser.toObject();
      delete userObject.password;
      delete userObject.tokens;
      return res.status(200).json({ success: true, message, data: { user: userObject, token } })
    } else {
      const user = await User.create({
        firstName,
        lastName,
        email,
        domain: "google",
        isActive: true,
        phoneVerified: true
      })
      const token = await user.generateAuthToken();
      res.cookie("jwtoken", token, {
        httpOnly: true,
      });
      // if(req.body.profileImage){
      // user.profileImage=req.body.profileImage
      // }
      message = "User Created Successfully ."
      const userObject = user.toObject();
      delete userObject.password;
      delete userObject.tokens;
      return res.status(200).json({ success: true, message, data: { user: userObject, token } })
    }

  } catch (error) {
    return res.status(400).json({ success: false, message: error?.message })
  }
}

const registerUser = async (req, res) => {
  try {
    const body = req.body;
    const type = body.type
    // if (type === 'phone') {
    //   throw_error('Sms Service Is Disabled At The Moment . Please Continue With Email .')
    // }
    if (!body[`${type}`] || body[`${type}`].length === 0) {
      throw_error(`${body.type} is required .`)
    }
    const whereClause = type === 'phone' ? { phone: body.phone } : { email: body.email }
    const findUser = await User.findOne(whereClause);
    if (findUser) {
      throw_error(`Account Already Exist With This ${type}`
        // body.type[0].toUpperCase() + body.type.slice(1);
      );
    }

    // const {firstName , lastName , email , password} = req.body;
    // if(body.type == 'phone'){
    //   const findUser = await User.findOne({ phone: body.phone });
    //   if (findUser) {
    //     throw_error("Account Already Exist With This Phone number");
    //   }
    // }
    // else if (body.type == 'email'){
    //   const findUser = await User.findOne({ email: body.email });
    //   if (findUser) {
    //     throw_error("Account Already Exist With This Email");
    //   }
    // }

    delete body.type;

    const user = await User.create({ ...body });
    const otp = type === 'phone' ? "1234" : generateOTP();
    await OTP.create({
      userId: user._id,
      userType: "user",
      otp
      // requestReason: "accountCreation"
    });
    if (type === 'email') {
      await sendEmail({ to: user?.email, subject: "Account Verification .", text: "", html: `<h3>Your Account Verification code is ${otp} </h3>` })
    }

    // const stripeUser = await createStripeCustomer(`${body.firstName} ${body.lastName}`,body.email,body.phone)
    return res.status(201).json({ data: { user, otp }, message: "User Created Successfully.", success: true });
  } catch (error) {
    console.log(error)
    return res.status(400).json({ message: error.message, success: false });
  }
};

const loginUser = async (req, res) => {
  try {
    const body = req.body;
    let user = null;
    if (body.type === 'email') {
      user = await User.findOne({ email: body.email });
      if (!user) {
        throw_error("Invalid Credentials");
      }
    }
    else if (body.type == 'phone') {
      user = await User.findOne({ phone: body.phone });
      if (!user) {
        throw_error("Invalid Credentials");
      }
    }

    if (!user.phoneVerified) {
      throw_error("Please Verify Your Phone Number .");
    } else if (!user.isActive) {
      throw_error("Please Contact Admin To Activate Your Account .");
    }

    if (!(await user.comparePassword(body.password))) {
      throw_error("Invalid Password");
    }

    const token = await user.generateAuthToken();
    res.cookie("jwtoken", token, {
      httpOnly: true,
    });
    const userObject = user.toObject();
    delete userObject.password;
    delete userObject.tokens;
    res.status(200).json({
      data: { user: userObject, token },
      message: "User Logged In",
      success: true,
    });
  } catch (error) {
    return res.status(400).json({ message: error.message, success: false });
  }
};

const logoutUser = async (req, res) => {
  try {
    const token = req.token;
    const user = req.user;
    user.tokens = user.tokens.filter((tokenObj) => tokenObj.token !== token);
    res.clearCookie("jwtoken", { path: "/" });
    await user.save();
    res
      .status(200)
      .json({ data: { user }, message: "User Logged Out", success: true });
  } catch (error) {
    console.log("Error", error);
    return res.status(400).json({ message: error.message, success: false });
  }
};

const resetPasswordRequest = async (req, res) => {
  try {
    const id = req.userID;
    const user = await User.findOne({ _id: id });
    if (!user) {
      throw_error("User Not Found");
    }
    const otp = generateOTP();
    await OTP.create({
      userId: user._id,
      otp,
      requestReason: "resetPassword"
    });
    user.resetLink = true
    await user.save();
    res.status(200).json({ data: { otp }, message: "Please Verify Your OTP .", success: true });
  } catch (error) {
    return res.status(400).json({ message: error.message, success: false });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { password, confirmPassword } = req.body;
    const user = req.user;
    if (!user.resetLink) {
      throw_error("Please Verify Your OTP First")
    }
    user.resetLink = false
    await user.save()
    // check for validity of user.resetLink if valid then proceed else return error
    if (password === confirmPassword) {
      await user.updatePassword(password);
    } else {
      throw_error("Password Doesn't Match .");
    }
    user.tokens = [];
    await user.save();
    res.clearCookie("jwtoken", { path: "/" });
    res.status(200).json({ data: { user }, message: "User Password Updated Successfully . Please Login Again With New Password", success: true });
  } catch (error) {
    return res.status(400).json({ message: error.message, success: false });
  }
};

const verifyUserOTP = async (req, res) => {
  try {
    const { otp } = req.body;
    if (!(await verifyOTP(otp, "user"))) {
      throw_error("Invalid OTP");
    }
    destroyOTP(otp)
    return res.status(200).json({ data: {}, message: "OTP Verified", success: true });
  } catch (error) {
    return res.status(400).json({ message: error.message, success: false });
  }
};

const verifyPhone = async (req, res) => {
  try {
    const { userId, otp } = req.body;
    const user = await User.findOne({ _id: userId });
    if (!user) {
      throw_error("User Not Found")
    }
    const findOtp = await OTP.findOne({ userId: user._id, userType: "user", otp });
    if (!findOtp) {
      throw_error("Invalid OTP");
    }
    user.phoneVerified = true;
    user.isActive = true;
    await user.save();
    return res.status(200).json({ message: "Your Phone Has Been Verified .", data: { user }, success: true });
  } catch (error) {
    return res.status(400).json({ message: error.message, success: false });
  }
};

const fetchAllBookings = async (req, res) => {
  try {
    const userId = req.userID;
    // serviceId => _id serviceName
    // vehicleTypeAccepted => _id  vehicleName weightAllowed iconLink
    // riderId => _id firstName lastName email phoneNo vehicleImage
    const [transportBookings, serviceBookings] = await Promise.all([
      TransportBooking.find({ userId })
        .populate({ path: 'serviceId', select: '_id serviceName' })
        .populate({ path: 'vehicleTypeAccepted', select: '_id  vehicleName weightAllowed iconLink' })
        .populate({ path: 'riderId', select: '_id firstName lastName email phoneNo vehicleImage' })
        .exec(),
      ServiceBooking.find({ userId })
        .populate({ path: 'serviceId', select: '_id serviceName' })
        .populate({ path: "subServices.subServiceId", select: "_id subServiceName  iconLink" })
        .populate({ path: "quotationAccepted.serviceProviderId", select: "_id carDetails vehicleImages email phoneNo location" })
        .populate({ path: "quotations.serviceProviderId", select: "_id carDetails vehicleImages email phoneNo location" })
        .exec()
    ]);
    // serviceId _id serviceName
    // quotationAccepted serviceProviderId companyName carDetails vehicleImages email phoneNo location
    // quotations serviceProviderId  carDetails vehicleImages email phoneNo location

    // subServices subServiceId => _id subServiceName subServiceDescription iconLink

    // Adding typeOfBooking property
    const transportBookingsWithType = transportBookings.map(booking => ({
      ...booking.toObject(),
      typeOfBooking: 'transport'
    }));

    const serviceBookingsWithType = serviceBookings.map(booking => ({
      ...booking.toObject(),
      typeOfBooking: 'service'
    }));

    const combinedBookings = [...transportBookingsWithType, ...serviceBookingsWithType];
    combinedBookings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return res.status(200).json({ message: "Fetched User Bookings Successfully .", data: { bookings: combinedBookings }, success: true });
  } catch (error) {
    return res.status(400).json({ message: error.message, success: false })
  }
}

// const validateAccessToken = async (req, res) => {
//   try {
//     const { token } = req.body;
//     const user = await User.findOne({ _id: req.userID, "tokens.token": token });
//     if (!user) {
//       throw_error("User Not Found");
//     }
//     if (!user.checkTokenValidity(token)) {
//       res.clearCookie("jwtoken", { path: "/" });
//       throw_error("Invalid Token");
//     }
//     const currentToken = user.tokens.filter((tokenObj) => tokenObj.token === token);
//     const newToken =  jwt.sign({ _id: user._id }, process.env.SECRETKEY); 
//   } catch (error) {
//     return res.status(400).json({ message: error.message, success: false });
//   }
// };

const forgotPasswordRequest = async (req, res) => {
  try {
    const email = req.body.email;
    const user = await User.findOne({ email });

    if (!user) {
      throw_error("User Not Found");
    }

    const otp = generateOTP();
    await OTP.create({
      userId: user._id,
      userType: "user",
      otp,
      requestReason: "forgotPassword"
    });

    user.forgotPass = true;
    await user.save();

    await sendEmail({ to: email, subject: "Forgot Password? Here's Your OTP", text: "", html: `<h3>Your Forgot Password code is ${otp} </h3>` })

    res.status(200).json({ data: { userId: user._id, otp }, message: "Please Verify Your OTP .", success: true });
  } catch (error) {
    return res.status(400).json({ message: error.message, success: false });
  }
}

const verifyForgotPassOTP = async (req, res) => {
  try {
    const { userId, otp } = req.body;

    const user = await User.findOne({ _id: userId });
    if (!user) {
      throw_error("User Not Found")
    }

    const findOtp = await OTP.findOne({ userId: user._id, userType: "user", otp, requestReason: "forgotPassword" });
    if (!findOtp) {
      throw_error("Invalid OTP");
    }

    user.forgotPass = false;

    await user.save();

    return res.status(200).json({ message: "Your forgot password otp has been verified.", data: { userId: user._id }, success: true });
  } catch (error) {
    return res.status(400).json({ message: error.message, success: false });
  }
}

const resetForgotPassword = async (req, res) => {
  try {
    const { userId, password, confirmPassword } = req.body;

    const user = await User.findOne({ _id: userId });
    if (!user) {
      throw_error("User Not Found")
    }

    if (user.forgotPass) {
      throw_error("Please Verify Your OTP First")
    }

    // check for validity of user.resetLink if valid then proceed else return error
    if (password === confirmPassword) {
      user.password = password;
    } else {
      throw_error("Password Doesn't Match.");
    }

    await user.save();

    res.status(200).json({ data: { user }, message: "User Password Updated Successfully.", success: true });
  } catch (error) {
    return res.status(400).json({ message: error.message, success: false });
  }
}


module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  resetPasswordRequest,
  resetPassword,
  verifyUserOTP,
  verifyPhone,
  authWithUaePass,
  allUsers,
  findUserById,
  banUser,
  adminUpdateUser,
  authWithGoogle,
  fetchAllBookings,
  forgotPasswordRequest,
  verifyForgotPassOTP,
  resetForgotPassword
};
