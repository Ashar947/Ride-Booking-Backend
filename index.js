require('dotenv').config();
const express = require('express');
const app = express();
app.use(express.json())
const PORT = process.env.PORT || 5000;
const cookieParser = require("cookie-parser");
app.use(cookieParser());
const http = require('http')
const server = http.createServer(app)
exports.socket = require('socket.io')(server);
require('./src/Controller/socketController')
// Cors
const cors = require('cors');
app.use(cors({
    origin: '*',
    credentials: true,
}));
//DataBase Connection
require('./src/Database/connection')

// Routes 
const userRoutes = require("./src/Routes/userRoutes")
const riderRoutes = require("./src/Routes/riderRoutes");
const adminRoutes = require('./src/Routes/adminRoutes')
const transportRoutes = require('./src/Routes/transportRoutes')
const serviceRoutes = require('./src/Routes/serviceRoutes');

app.get('/', async (req, res) => {
    try {
        // const sendMessage = await sendOTPPhoneVerify("12345", "923323610637")
        // console.log(sendMessage);
        // console.log("sendMessage");
        // return res.status(200).json({ success: true, message: "OTP SEND" })
        return res.status(200).json({ success: true, message: "" })
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message })

    }
})
app.use("/api/admin", adminRoutes) // tested
app.use("/api/user", userRoutes) // tested
app.use("/api/rider", riderRoutes) // tested
app.use("/api/transport", transportRoutes)
app.use("/api/services", serviceRoutes)








server.listen(PORT, () => {
    console.log(`Server Running at http://localhost:${PORT}`)
})



