const { throw_error } = require("./commonControllers");
const axios = require("axios");

const sendMessage = async (template, phoneNumber) => {
    try {
        console.log("template", template)
        const { data } = await axios({
            method: 'post', baseURL: process.env.SMS_URL,
            data: {
                api_id: process.env.SMS_ID,
                api_password: process.env.SMS_PASSWORD,
                sender_id: process.env.SENDER_ID,
                phonenumber: phoneNumber,
                encoding: 'T',
                sms_type: 'T',
                textmessage: template,
            },
            url: '/SendSMS'
        })
        console.log("data", data)
        if (data.status === "F" ){
            throw_error("Unable To Send Message")
        }
        return true
    } catch (error) {
        console.log("error", error)
        // throw_error(error.message)
        return false
    }
}



const sendOTPPhoneVerify = async (otp, phoneNumber) => {
    try {
        const template = `Your OTP is ${otp}`
        if (await sendMessage(template, phoneNumber)) { 
            return true
        }
        throw_error("Unable To Send Message") 
    } catch (error) {
        throw_error(error.message)
    }
}



module.exports = { sendOTPPhoneVerify }



