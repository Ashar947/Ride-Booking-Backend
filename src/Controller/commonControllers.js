// const generatedOTP = new Set();

const throw_error = (errorMsg) => {
    const error_response = new Error(errorMsg);
    error_response.message = errorMsg;
    throw error_response;
}



module.exports = { throw_error }

// const verifyOTP = () => {
//     try {
//         console.log("verify otp")
//     } catch (error) {
//         throw_error(error.message)
//     }
// }



// const generateOTP = () => {
//     const digits = process.env.OTPLENGTH
//     const otp = Math.floor(Math.pow(10, digits - 1) + Math.random() * 9 * Math.pow(10, digits - 1)).toString();
//     if (generatedOTP.has(otp)) {
//         // If the generated OTP is not unique, recursively call the function until a unique OTP is generated
//         return generateOTP();
//     } else {
//         // If the generated OTP is unique, add it to the set of generated OTPs and return it
//         generatedOTP.add(otp);
//         return otp;
//     }
// }




