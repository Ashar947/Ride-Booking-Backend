const { throw_error } = require("./commonControllers");
const Admin = require('../Models/Admin/adminSchema');
const VehicleType = require('../Models/Common/vehicleTypesSchema')

const createAdmin = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        // name email password
        const findAdmin = await Admin.findOne({ email });
        if (findAdmin) {
            throw_error("Admin Already Exist With This Email");
        }
        const admin = await Admin.create({ name, email, password });
        return res.status(201).json({ data: { admin }, message: "Admin Created .", success: true });
    } catch (error) {
        console.log(error)
        return res.status(400).json({ message: error.message, success: false });
    }
};

const getAllAdmins = async (req, res) => {
    try {
        const admins = await Admin.find();
        return res.status(200).json({ message: "Found All Admins", data: { admins }, success: true })
    } catch (error) {
        return res.status(400).json({ message: "Error Occurred While Fetching Admins .", success: false })

    }
}

const adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        const admin = await Admin.findOne({ email });
        if (!admin) {
            throw_error("Admin Does Not Exists With This Email")
        }
        const comparePassword = await admin.comparePassword(password);
        if (!comparePassword) {
            throw_error("Invalid Password")
        }
        const token = await admin.generateAuthToken();
        res.cookie("jwtoken", token, {
            httpOnly: true,
        });
        return res.status(200).json({ message: "Admin Logged In", data: { admin, token }, success: false })
    } catch (error) {
        return res.status(400).json({ message: error.message, success: false });
    }
};

const updateAdminPassword = async (req, res) => {
    try {
        const { newPassword, confirmPassword } = req.body;
        if (newPassword !== confirmPassword) {
            throw_error("Password Does Not Match")
        }
        const admin = req.admin;
        // const hashPassword = await bcrypt.hash(newPassword, 12);
        admin.password = newPassword;
        admin.tokens = []
        await admin.save()
        return res.status(200).json({ message: "Admin Password Updated ", data: { admin }, success: true })
    } catch (error) {
        return res.status(400).json({ message: error.message, success: false });
    }
};

const createVehicleType = async (req, res) => {
    try {
        const { vehicleName, pickUser, maxPassenger, weightAllowed, iconLink, description } = req.body
        const vehicleType = await VehicleType.create({
            vehicleName, pickUser, maxPassenger, weightAllowed, iconLink, description
        })
        return res.status(201).json({ message: "Vehicle Type Created Successfully .", data: { vehicleType }, success: true })

    } catch (error) {
        return res.status(400).json({ message: error.message, success: false })
    }
};

const allVehicleTypes = async (req, res) => {
    try {
        const vehicleTypes = await VehicleType.find()
        return res.status(200).json({ message: "All Vehicle Types .", data: { vehicleTypes }, success: true })

    } catch (error) {
        return res.status(400).json({ message: error.message, success: false })
    }
}

const updateVehicleType = async (req, res) => {
    try {
        return res.status(400).json({ message: "error.message", success: false })
    } catch (error) {
        return res.status(400).json({ message: error.message, success: false })
    }
};

const deleteVehicleType = async (req, res) => {
    try {
        const { id } = req.params
        const vehicle = await VehicleType.deleteOne({ _id: id })
        if (!vehicle.deletedCount > 0) {
            throw_error("Unable To Delete Vehicle Type")
        }
        return res.status(200).json({ message: "Vehicle Type Has Been Deleted Successfully .", data: { vehicleType: vehicle }, success: true })

    } catch (error) {
        return res.status(400).json({ message: error.message, success: false })
    }
}

module.exports = {
    createAdmin,
    adminLogin,
    updateAdminPassword,
    getAllAdmins,
    createVehicleType,
    allVehicleTypes,
    updateVehicleType,
    deleteVehicleType
};
