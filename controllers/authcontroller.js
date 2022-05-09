/** @format */
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const User = mongoose.model("User");
const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator");
const { frontendUrl } = require("./FrontendUrl");
const axios = require("axios").default;

exports.getSignin = (req, res, next) => {
  console.log("S");
};

exports.googleCallback = (req, res, next) => {
  console.log("authenticated");
  const { email, _id } = req.user;

  const token = jwt.sign(
    { email: email, userId: _id },
    process.env.JWT_SECRECT,
    { expiresIn: "12h" }
  );

  res.redirect(frontendUrl() + "/?token=" + token);
};

exports.getSignup = (req, res, next) => {};

exports.postSignup = (req, res, next) => {};

exports.login = async (req, res, next) => {
  const { email, password } = req.body;
  console.log(req.body);

  const { errors } = validationResult(req);
  try {
    if (errors.length > 0) {
      return res.status(422).json({ errors });
    }
    const checkUser = await User.findOne({ email });

    if (!checkUser) {
      const error = new Error("User not found");
      error.statusCode = 401;
      throw error;
    }
    if (!checkUser.password) {
      return res.status(403).json({ message: "Try to sign In with Google" });
    }

    bcrypt.compare(password, checkUser.password, (err, result) => {
      if (err) {
        console.log(err);
        next(err);
      }
      if (result) {
        const token = jwt.sign(
          {
            userId: checkUser._id,
            email: checkUser.email,
          },
          process.env.JWT_SECRECT
        );
        res
          .status(200)
          .json({ message: "user found", userData: checkUser, token });
      } else {
        res.status(402).json({ message: "invalid password" });
      }
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

exports.signup = async (req, res, next) => {
  const { email, password, confirmPassword, firstname, lastname } = req.body;
  const { errors } = validationResult(req);
  if (errors.length > 0) {
    return res.status(422).json({ errors });
  }

  try {
    const checkUserExists = await User.findOne({ email });
    if (checkUserExists) {
      return res
        .status(200)
        .json({ message: "Email already exist's", userExists: true });
    } else {
      const username = firstname + "_" + lastname;

      const profileUrl =
        "https://ui-avatars.com/api/?name=" + firstname + lastname;

      bcrypt.genSalt(10, (err, salt) => {
        if (err) {
          throw err;
        } else {
          bcrypt.hash(password, salt, async (err, hash) => {
            const registerNewUser = new User({
              email,
              password: hash,
              firstname,
              lastname,
              username,
              profileUrl,
            });

            await registerNewUser.save();
            const token = jwt.sign(
              { userId: registerNewUser._id, email },
              process.env.JWT_SECRECT
            );
            return res.status(201).json({
              message: "user created",
              userExists: false,
              userData: registerNewUser,
              token,
            });
          });
        }
      });
    }
  } catch (error) {
    console.log(error);
  }
};

exports.logoutUser = (req, res, next) => {
  console.log("s");
  try {
    req.user = {};
    res.status(200).json({ message: "User logged out" });
  } catch (error) {
    console.log(error);
  }
};
