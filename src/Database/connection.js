const mongoose = require("mongoose");

mongoose.connect(process.env.DB_URl, {
}).then(() => {
    console.log("Connection Successful");
}).catch((err) => {
    console.log(`${err}`);
});
