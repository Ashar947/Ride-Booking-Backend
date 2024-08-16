const { throw_error } = require("./commonControllers");
const Log = require("../Models/logsSchema");
// userId
// userType
// message

const createLog = async ({ userId, message, userType }) => {
    try {
        await Log.create({ userId, message, userType });
        return true;
    } catch (error) {
        throw_error(error.message)
    }
};

module.exports = {
    createLog
};