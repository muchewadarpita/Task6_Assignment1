const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
var salt = bcrypt.genSaltSync(10);

const userSchema = new mongoose.Schema(
  {
    firstname: {
      type: String,
      required: true,
      maxlength: 32,
      trim: true,
    },
    lastname: {
      type: String,
      maxlength: 32,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      required: true,
      unique: true,
    },
    role: {
      type: String,
      enum: ["normal", "admin"],
      required: [true, "Please specify user role"],
    },
    encry_password: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

//encrypted password  cretae by calling securePassword method
userSchema
  .virtual("password")
  .set(function (password) {
    this._password = password;
    //this.salt = uuidv1();

    this.encry_password = this.securePassword(password);
  })
  .get(function () {
    return this._password;
  });

//Compare password and authenticate
userSchema.methods = {
  authenticate: function (plainpassword) {
    return bcrypt.compareSync(plainpassword, this.encry_password);
  },

  //securePassword method for create encrypted password
  securePassword: function (plainpassword) {
    if (!plainpassword) return "";

    try {
      return bcrypt.hashSync(plainpassword, salt);
    } catch (err) {
      return "";
    }
  },
};

module.exports = mongoose.model("User", userSchema);
