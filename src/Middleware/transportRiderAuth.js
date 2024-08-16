const jwt = require("jsonwebtoken");
const Rider = require('../Models/TransportServices/Rider/riderSchema');
require('dotenv').config();


const riderAuth = async (req , res , next) =>{
    try{
        const token = req.cookies.jwtoken;

        if (!token){
            throw new Error('Invalid Credentials')
        }

        const verifyToken = jwt.verify(token,process.env.SECRETKEY);
        const rider = await Rider.findOne({_id:verifyToken._id , "tokens.token":token});

        if (!rider){
            throw new Error('Invalid Credentials')
        }
        
        req.token = token;
        req.rider = rider;
        req.riderID = rider._id;

        next();
                                                               
    }catch(error){
        return res.status(401).json({message : error.message , success : false })
    }

}

module.exports = riderAuth;