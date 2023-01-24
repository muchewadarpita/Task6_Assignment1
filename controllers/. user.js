const User = require("../models/user");
const { validationResult } = require("express-validator");
const user = require("../models/user");
var jwt = require("jsonwebtoken");
var expressJwt = require("express-jwt");
var decoded;
exports.signup = (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: errors.array()[0].msg,
    });
  }

  const user = new User(req.body);
  user.save((err, user) => {
    if (err) {
      return res.status(400).json({
        error: "Unable to add user",
      });
    }

    return res.json({
      message: "Success",
      user,
    });
  });
};

exports.signin = (req, res) => {
  const { email, password } = req.body;

  User.findOne({ email }, (err, user) => {
    if (err || !user) {
      return res.status(400).json({
        error: "Email was not found",
      });
    }
    // Authenticate user
    if (!user.authenticate(password)) {
      return res.status(400).json({
        error: "Email and password do not match",
      });
    }
    // Create token
    const token = jwt.sign({ role: user.role }, process.env.SECRET);

    //Extract role payload from token.
    decoded = jwt.verify(token, process.env.SECRET);
    console.log(decoded.role);

    // Put token in cookie
    res.cookie("token", token, { expire: new Date() + 1 });

    // Send response
    const { _id, firstname, email, role } = user;
    return res.json({
      token,
      user: {
        _id,
        firstname,
        email,
        role,
      },
    });
  });
};

exports.signout = (req, res) => {
  res.clearCookie("token");
  return res.json({
    message: "User signout successful",
  });
};

exports.admin = (req, res) => {
  if (decoded.role === "admin") {
    User.find({}, (err, result) => {
      if (err) throw err;
      res.send(result);
    });
  } else {
    return res.status(403).json({
      error: "normal user doesn't have permission to access all data",
    });
  }
};
