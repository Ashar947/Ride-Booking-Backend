const jwt = require("jsonwebtoken");
const ServiceProvider = require('../Models/VendorServices/Vendor/serviceProviderSchema');
require('dotenv').config();


const serviceProviderAuth = async (req , res , next) =>{
    try{
        const token = req.cookies.jwtoken;

        if (!token){
            throw new Error('Invalid Credentials');
        }

        const verifyToken = jwt.verify(token,process.env.SECRETKEY);
        const serviceProvider = await ServiceProvider.findOne({_id:verifyToken._id , "tokens.token":token});

        if (!serviceProvider){
            throw new Error('Invalid Credentials');
        }
        
        req.token = token;
        req.serviceProvider = serviceProvider;
        req.serviceProviderID = serviceProvider._id;

        next();
                                                               
    }catch(error){
        return res.status(401).json({message : error.message , success : false })
    }

}

module.exports = serviceProviderAuth;