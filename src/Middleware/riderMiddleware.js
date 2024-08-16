const jwt = require("jsonwebtoken");
const Rider = require('../Models/TransportServices/Rider/riderSchema');
const ServiceProvider = require('../Models/VendorServices/Vendor/serviceProviderSchema');
require('dotenv').config();


const riderMiddleware = async (req, res, next) => {
    try {
        const { riderType } = req.body
        const token = req.cookies.jwtoken;

        if (!token || !riderType) {
            throw new Error('Invalid Credentials')
        }

        const verifyToken = jwt.verify(token, process.env.SECRETKEY);
        const rider = riderType === "serviceProvider" ? await ServiceProvider.findOne({ _id: verifyToken._id, "tokens.token": token }) : await Rider.findOne({ _id: verifyToken._id, "tokens.token": token })

        if (!rider) {
            throw new Error('Invalid Credentials')
        }

        req.rider = rider;

        next();

    } catch (error) {
        return res.status(401).json({ message: error.message, success: false })
    }

}

module.exports = riderMiddleware;