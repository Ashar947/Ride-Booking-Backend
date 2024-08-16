const OTP = require("../Models/Common/otpRequestsSchema");
const { throw_error } = require("./commonControllers");
const generatedOTP = new Set();


const verifyOTP = async (otp, userType) => {
    try {
        console.log("verify otp")
        const checkOtp = await checkDB(otp, userType);
        if (!checkOtp) {
            console.log("OTP NOT FOUND")
            return false
        }
        return true

    } catch (error) {
        return false
    }
};


const destroyOTP = async(otp)=>{
    await OTP.deleteOne({otp})
}
function generateOTP() {
    const digits = process.env.OTPLENGTH
    const otp = Math.floor(Math.pow(10, digits - 1) + Math.random() * 9 * Math.pow(10, digits - 1)).toString();
    if (generatedOTP.has(otp)) {
        // If the generated OTP is not unique, recursively call the function until a unique OTP is generated
        return generateOTP();
    } else {
        // If the generated OTP is unique, add it to the set of generated OTPs and return it
        generatedOTP.add(otp);
        console.log("otp", otp)
        return otp;
    }
};
const checkSET = (otp) => {
    if (generatedOTP.has(otp)) {
        return true
    } else {
        return false
    }
};
const checkDB = async (otp, userType) => {
    const checkOtp = await OTP.findOne({ otp, userType });
    if (!checkOtp) {
        return false
    } else {
        return true
    }
};


module.exports = {
    verifyOTP,
    generateOTP,
    destroyOTP
}
