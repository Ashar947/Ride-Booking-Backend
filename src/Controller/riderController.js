const { throw_error } = require("./commonControllers");
const Rider = require("../Models/TransportServices/Rider/riderSchema");
const ServiceProvider = require("../Models/VendorServices/Vendor/serviceProviderSchema");
const OTP = require("../Models/Common/otpRequestsSchema");
const { verifyOTP, generateOTP } = require("./otpController")



const allRiders = async (req, res) => {
    try {
        const riders = await Rider.find()
        return res.status(200).json({ success: true, message: "All Riders Found Successfully.", data: { riders } })
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message })
    }
}
const riderById = async (req, res) => {
    try {
        const rider = await Rider.findOne({ _id: req.params.id });
        if (!rider) {
            return res.status(404).json({ success: false, message: "Rider Not Found." })
        }
        return res.status(200).json({ success: true, message: "Rider Found Successfully.", data: { rider } })
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message })
    }
};
const banRiderById = async (req, res) => {
    try {
        const rider = await Rider.findOne({ _id: req.params.id })
        if (!rider) {
            return res.status(404).json({ success: false, message: "Rider Not Found." })
        }
        rider.isActive = false
        await rider.save()
        return res.status(200).json({ success: true, message: "Rider Found Successfully.", data: { rider } })
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message })
    }
};






const registerRider = async (req, res) => {
    const body = req.body;
    const riderType = body.riderType;
    delete body.riderType;

    try {
        if (!riderType) {
            throw_error("User Type missing from request body. Should be rider or serviceProvider");
        }
        if (!body.type) {
            throw_error("Type of registration not mentioned. Should be phone or email");
        }

        let user;

        if (riderType == 'rider') {
            if (body.type == 'phone') {
                const findRider = await Rider.findOne({ phone: body.phone });
                if (findRider) {
                    throw_error("Account Already Exist With This Phone number");
                }
            }
            else if (body.type == 'email') {
                const findRider = await Rider.findOne({ email: body.email });
                if (findRider) {
                    throw_error("Account Already Exist With This Email");
                }
            }
            else {
                throw_error("Invalid type of registration. Can be either 'phone' or 'email'.");
            }

            delete body.type;

            user = await Rider.create({
                firstName: body.firstName,
                lastName: body.lastName,
                email: body.email,
                phoneNo: body.phoneNo,
                password: body.password,
                acceptanceToPay: body.acceptanceToPay,
                location: { type: "Point", coordinates: [parseFloat(body.longitude), parseFloat(body.latitude)] }
            });

        }
        else if (riderType == 'serviceProvider') {

            if (body.type == 'phone') {
                const findRider = await ServiceProvider.findOne({ phone: body.phoneNo });
                if (findRider) {
                    throw_error("Account Already Exist With This Phone number");
                }
            }
            else if (body.type == 'email') {
                const findRider = await ServiceProvider.findOne({ email: body.email });
                if (findRider) {
                    throw_error("Account Already Exist With This Email");
                }
            }
            else {
                throw_error("Invalid type of registratoin. Can be either 'phone' or 'email'.");
            }

            delete body.type;

            user = await ServiceProvider.create({
                companyName: body.companyName,
                serviceId: body.serviceId,
                subServices: body.subServices,
                phoneNo: body.phoneNo,
                email: body.email,
                password: body.password,
                // location: { type: "Point", coordinates: [parseFloat(body.longitude), parseFloat(body.latitude)] }
            });

        }
        else {
            throw_error("Invalid User Type. Can be either 'rider' or 'servicerProvider'.");
        }

        const otp = generateOTP();
        await OTP.create({
            userId: user._id,
            userType: riderType,
            otp,
            requestReason: "accountCreation"
        });

        return res
            .status(201)
            .json({ data: { user, otp }, message: `${riderType} Created`, success: true });

    } catch (error) {
        console.log(error.message)
        return res.status(400).json({ message: error.message, success: false });
    }

};

// const registerRider2 = async (req, res) => {
//     try {
//         const body = req.body;

//         if (body.type == 'phone') {
//             const findRider = await Rider.findOne({ phone: body.phone });
//             if (findRider) {
//                 throw_error("Account Already Exist With This Phone number");
//             }
//         }
//         else if (body.type == 'email') {
//             const findRider = await Rider.findOne({ email: body.email });
//             if (findRider) {
//                 throw_error("Account Already Exist With This Email");
//             }
//         }

//         delete body.type;

//         // const rider = await Rider.create({ ...body, location: { type: "Point", coordinates: [req.body.longitude, req.body.latitude] } })
//         const rider = await Rider.create({ ...body, location: { type: "Point", coordinates: [parseFloat(req.body.longitude), parseFloat(req.body.latitude)] } })
//         // const rider = await Rider.create({...body , location : {type : "Point",coordinates :[parseFloat(req.body.longitude,req.body.latitude)]}});

//         const otp = generateOTP();
//         await OTP.create({
//             userId: rider._id,
//             userType: "rider",
//             otp,
//             requestReason: "accountCreation"
//         });

//         return res
//             .status(201)
//             .json({ data: { rider, otp }, message: "Rider Created", success: true });

//     } catch (error) {
//         return res.status(400).json({ message: error.message, success: false });
//     }
// };

const uploadDocs = async (req, res) => {
    const body = req.body;
    const userType = body.userType;


    if (!userType) {
        throw_error("User Type missing from request body. Should be rider or serviceProvider");
    }

    delete body.userType;

    // Parsing expiry dates into Date objects
    const emiratesIdExpiry = new Date(body.emiratesIdExpiry);
    const licenseExpiryDate = new Date(body.licenseExpiry);
    const carRegistrationCardExpiryDate = new Date(body.carRegistrationCardExpiry);

    // Checking if any of the expiry dates are already expired
    if (emiratesIdExpiry < Date.now() || licenseExpiryDate < Date.now() || carRegistrationCardExpiryDate < Date.now()) {
        throw_error("Some of the document expiries have already passed");
    }

    try {
        let user;

        if (userType == 'rider') {
            user = await Rider.findById(body.id);
            if (!user) {
                throw_error("Rider doesnot exist");
            }
        }
        else if (userType == 'serviceProvider') {
            user = await ServiceProvider.findById(body.id);
            if (!user) {
                throw_error("Service provider doesnot exist");
            }
        }
        else {
            throw_error("Invalid User Type. Can be either 'rider' or 'servicerProvider'.");
        }

        if (!user.documents) {
            user.documents = {};
        }

        // Iterating over the keys of the request body and adding them dynamically to the rider object
        for (const key in body) {
            if (key !== 'id') { // Skipping the 'id' field
                user.documents[key] = body[key];
            }
        }

        // Saving the updated rider object to the database
        await user.save();

        return res
            .status(201)
            .json({ data: { user }, message: `${userType} documents uploaded`, success: true });

    } catch (error) {
        console.log(error);
        return res.status(400).json({ message: error.message, success: false });
    }
}

const riderDataWithUaePass = async (code) => {
    try {
        const config = {
            headers: {
                'Content-Type': 'multipart/form-data',
                'Authorization': 'Basic c2FuZGJveF9zdGFnZTpzYW5kYm94X3N0YWdl'
            }
        };

        const response = await axios.post(
            `https://stg-id.uaepass.ae/idshub/token?grant_type=authorization_code&redirect_uri=http://localhost:3000/3&code=${code}`,
            null,
            config);
        const access_token = response.data.access_token;
        const dataResponse = await axios.get('https://stg-id.uaepass.ae/idshub/riderinfo', {
            headers: {
                'Authorization': `Bearer ${access_token}`
            }
        });

        console.log("dataResponse", dataResponse.data);

        return { data: dataResponse.data, success: true }

    } catch (error) {
        return { data: {}, success: false }
    }
}

const authWithUaePass = async (req, res) => {
    try {
        const { code, state } = req.body;
        const { data, success } = await riderDataWithUaePass(code);

        if (!success) {
            throw_error("Error while authenticating with UaePass .")
        }

        const { firstnameEN, lastnameEN, fullnameEN, mobile, email } = data;

        const rider = await Rider.findOne({ email });

        if (rider) {
            const token = await rider.generateAuthToken();

            res.cookie("jwtoken", token, {
                httpOnly: true,
            });

            res.status(200).json({
                data: { rider, token },
                message: "Rider Logged In",
                success: true,
            });
        } else {
            const createrider = await rider.create({
                firstName: firstnameEN, lastName: lastnameEN, email,
                phoneVerified: true, phone: mobile, domain: "uaepass", phoneVerified: true, isActive: true
            })
            return res.status(201).json({ data: { createrider }, message: "rider Created .", success: true });
        }
    } catch (error) {
        return res.status(400).json({ message: error.message, success: false })
    }

}

const loginRider = async (req, res) => {
    const body = req.body;
    const riderType = body.riderType;
    delete body.riderType;
    if (!body.longitude || !body.latitude) {
        throw_error("Please Pass Coordinates")
    }
    try {
        if (!riderType) {
            throw_error("Rider Type missing from request body. Should be rider or serviceProvider");
        }

        if (!body.type) {
            throw_error("Type of registration not mentioned. Should be phone or email");
        }

        let user;

        if (riderType == 'rider') {
            if (body.type == 'email') {
                user = await Rider.findOne({ email: body.email });
                if (!user) {
                    throw_error("Invalid Credentials");
                }
            }
            else if (body.type == 'phone') {
                user = await Rider.findOne({ phone: body.phone });
                if (!user) {
                    throw_error("Invalid Credentials");
                }
            }
            else {
                throw_error("Invalid type of registratoin. Can be either 'phone' or 'email'.");
            }
        }
        else if (riderType == 'serviceProvider') {

            if (body.type == 'email') {
                user = await ServiceProvider.findOne({ email: body.email });
                if (!user) {
                    throw_error("Invalid Credentials");
                }
            }
            else if (body.type == 'phone') {
                user = await ServiceProvider.findOne({ phone: body.phone });
                if (!user) {
                    throw_error("Invalid Credentials");
                }
            }
            else {
                throw_error("Invalid type of registration. Can be either 'phone' or 'email'.");
            }

        }
        else {
            throw_error("Invalid User Type. Can be either 'rider' or 'servicerProvider'.");
        }

        // if (!user.phoneVerified) {
        //     throw_error("Please Verify Your Phone Number .");
        // }

        if (!(await user.comparePassword(body.password))) {
            throw_error("Invalid Password");
        }
        if (!user.phoneVerified) {
            throw_error(`Please Verify Your Phone First .`);
        }
        // Checking whether the status of the rider is accepted or not. If the status is either pending or rejected, the rider will not be allowed to login.
        // if (user.accountStatus !== 'accepted') {
        //     throw_error(`${riderType} not yet authorized by the admin`);
        // }

        user.location = { type: "Point", coordinates: [parseFloat(body.longitude), parseFloat(body.latitude)] }
        const token = await user.generateAuthToken();

        res.cookie("jwtoken", token, {
            httpOnly: true,
        });
        await user.save()

        res.status(200).json({
            data: { user, token },
            message: `${riderType} Logged In`,
            success: true,
        });

    } catch (error) {
        return res.status(400).json({ message: error.message, success: false });
    }
}

const logoutRider = async (req, res) => {
    try {
        const token = req.token;
        const rider = req.rider;
        rider.tokens = rider.tokens.filter((tokenObj) => tokenObj.token !== token);

        res.clearCookie("jwtoken", { path: "/" });

        await rider.save();

        res.status(200).json({ data: { rider }, message: "Rider Logged Out", success: true });

    } catch (error) {
        console.log("Error", error);
        return res.status(400).json({ message: error.message, success: false });
    }
};

const resetPasswordRequest = async (req, res) => {
    try {
        const id = req.riderID;
        const rider = await Rider.findOne({ _id: id });

        if (!rider) {
            throw_error("Rider Not Found");
        }

        const otp = generateOTP();
        await OTP.create({
            userId: rider._id,
            userType: 'rider',
            otp,
            requestReason: "resetPassword"
        });

        res.status(200).json({ data: { otp }, message: "Please Verify Your OTP .", success: true });

    } catch (error) {
        return res.status(400).json({ message: error.message, success: false });
    }
};

const resetPassword = async (req, res) => {
    try {
        const { password, confirmPassword } = req.body;
        const rider = req.rider;

        // check for validity of rider.resetLink if valid then proceed else return error
        if (password === confirmPassword) {
            await rider.updatePassword(password);
        } else {
            throw_error("Password Doesn't Match .");
        }

        rider.tokens = [];

        await rider.save();

        res.clearCookie("jwtoken", { path: "/" });
        res.status(200).json({
            data: { rider },
            message: "Rider Password Updated Successfully . Please Login Again With New Password",
            success: true,
        });

    } catch (error) {
        return res.status(400).json({ message: error.message, success: false });
    }
};

const verifyRiderOtp = async (req, res) => {
    try {
        const { otp } = req.body;

        if (!(await verifyOTP(otp, "rider"))) {
            throw_error("Invalid OTP");
        }

        return res.status(200).json({ data: {}, message: "OTP Verified", success: true });
    } catch (error) {
        return res.status(400).json({ message: error.message, success: false });
    }
};

const verifyPhone = async (req, res) => {
    try {
        const { otp, phoneNumber, riderId, riderType } = req.body;

        const rider = riderType === "serviceProvider" ? await ServiceProvider.findOne({ _id: riderId }) : await Rider.findOne({ _id: riderId });
        if (!rider) {
            throw_error(`Invalid ${riderType} id.`);
        }

        const findOtp = await OTP.findOne({ userId: riderId, userType: riderType, requestReason: "accountCreation", otp });

        if (!findOtp) {
            throw_error("Invalid OTP");
        }

        if (rider.phoneNo !== phoneNumber) {
            throw_error("Phone Number Does Not Match");
        }

        rider.phoneVerified = true;
        rider.isActive = true;
        rider.accountStatus = 'accepted'
        // rider.riderStatus = 'online'
        await rider.save();
        return res.status(201).json({ data: { rider }, message: "Your Phone Has Been Verified .", success: false });

    } catch (error) {
        console.log(error.message)
        return res.status(400).json({ message: error.message, success: false });
    }
};

module.exports = {
    registerRider,
    uploadDocs,
    authWithUaePass,
    loginRider,
    logoutRider,
    resetPasswordRequest,
    resetPassword,
    verifyRiderOtp,
    verifyPhone,
    allRiders,
    riderById,
    banRiderById
};
