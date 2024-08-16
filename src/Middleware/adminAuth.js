const jwt = require("jsonwebtoken");
const Admin = require('../Models/Admin/adminSchema');
require('dotenv').config();


const adminAuth = async (req, res, next) => {
    try {
        const token = req.cookies.jwtoken;
        if (!token) {
            throw new Error('Invalid Credentials')
        }
        const verifyToken = jwt.verify(token, process.env.SECRETKEY);
        console.log("verifyToken", verifyToken)
        const admin = await Admin.findOne({ _id: verifyToken._id, "tokens.token": token });
        if (!admin) {
            throw new Error('Invalid Credentials')
        }
        req.token = token;
        req.admin = admin;
        next();
    } catch (error) {
        return res.status(401).json({ message: error.message, success: false })
    }

}

module.exports = adminAuth;