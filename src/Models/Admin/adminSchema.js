const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const adminSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    // unique: true,
  },
  password: {
    type: String,
    required : true
  },
  isActive: {
    type: Boolean,
    default :true
  },
  tokens: [
    {
      token: {
        type: String,
        required: true,
      },
    },
  ],
});

adminSchema.pre("save", async function (next) {
  try {
    if (this.isModified("password")) {
      this.password = await bcrypt.hash(this.password, 12);
    }
    next();
  } catch (error) {
    throw new Error("Error Creating Account");
  }
  //   }
});

adminSchema.methods.generateAuthToken = async function () {
  try {
    let genToken = jwt.sign({ _id: this._id }, process.env.SECRETKEY);
    this.tokens = this.tokens.concat({ token: genToken });
    await this.save();
    return genToken;
  } catch (error) {
    console.log(`error is ${error}`);
  }
};


adminSchema.methods.comparePassword = async function (enteredPassword, next) {
  return await bcrypt.compare(`${enteredPassword}`, `${this.password}`);
};

module.exports = mongoose.model("Admin", adminSchema);
