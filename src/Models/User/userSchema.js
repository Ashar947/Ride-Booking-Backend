const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    // unique: true,
    // required: true,
  },
  phone: {
    type: String,
    // unique: true,
    // required: true,
  },
  password: {
    type: String,
  },
  balance: {
    type: Number,
    default: 0.0,
  },
  loyaltyPoints: {
    type: Number,
    default: 0,
  },
  resetLink: {
    type: Boolean,
  },
  forgotPass: {
    type: Boolean,
  },
  isActive: {
    type: Boolean,
    default: false
  },
  phoneVerified: {
    type: Boolean,
    default: false
  },
  domain: {
    type: String,
    enum: {
      values: ["self", "uaepass", "google"],
      message: `{VALUE} is not supported`,
      default: 'self'
    },
    required: true,
    default: "self",
  },
  createdAt:{
    type : Date,
    default : new Date
  },
  tokens: [
    {
      token: {
        type: String,
        required: true,
      },
      // refreshToken : {
      //   type: String
      // }
    },
  ],
});

userSchema.pre("save", async function (next) {
  //   if (this.domain === "self") {
  try {
    if (this.isModified("password")) {
      this.password = await bcrypt.hash(this.password, 12);
    }
    next();
  } catch (error) {
    throw new Error("Error Creating Account");
  }
});


userSchema.methods.createPasswordToken = async function () {
  const passToken = jwt.sign({ _id: this._id }, process.env.SECRETKEY, '1d');
  this.resetLink = passToken;
  return true
}

userSchema.methods.generateAuthToken = async function () {
  try {
    let genToken = jwt.sign({ _id: this._id }, process.env.SECRETKEY);
    this.tokens = this.tokens.concat({ token: genToken });
    await this.save();
    return genToken;
  } catch (error) {
    console.log(`error is ${error}`);
  }
};




userSchema.methods.checkTokenValidity = async function (token) {
  const valid = jwt.verify(token, process.env.SECRETKEY);
  if (!valid) {
    return false
  }
  return true
};

userSchema.methods.comparePassword = async function (enteredPassword, next) {
  return await bcrypt.compare(`${enteredPassword}`, `${this.password}`);
};

module.exports = mongoose.model("User", userSchema);
