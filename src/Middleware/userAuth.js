const jwt = require("jsonwebtoken");
const User = require('../Models/User/userSchema');
require('dotenv').config();
const bcrypt = require('bcrypt')


const userAuth = async (req , res , next) =>{
    try{
        const token = req.cookies.jwtoken;
        if (!token){
            throw new Error('Invalid Credentials')
        }
        const verifyToken = jwt.verify(token,process.env.SECRETKEY);
        console.log("verifyToken",verifyToken)
        const user = await User.findOne({_id:verifyToken._id , "tokens.token":token});
        if (!user){
            throw new Error('Invalid Credentials')
        }
        req.token = token;
        req.user = user;
        req.userID = user._id;

        next();
                                                               
    }catch(error){
        return res.status(401).json({message : error.message , success : false })
    }

}

module.exports = userAuth;