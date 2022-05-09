/** @format */

const express = require("express");
const passport = require("passport");
const { GoogleAuth } = require("../auth/GoogleAuth");
const { body, check } = require("express-validator");
const mongoose = require("mongoose");
const User = mongoose.model("User");
const route = express.Router();

GoogleAuth(passport);
const bcrypt = require("bcryptjs");
const {
  getSignin,
  postSignup,
  getSignup,
  googleCallback,
  login,
  signup,
  logoutUser,
} = require("../controllers/authcontroller");

route.get(
  "/google/login",
  passport.authenticate("google", { scope: ["profile", "email"] }),
  getSignin
);

route.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/auth/signup" }),
  googleCallback
);

route.post(
  "/user/login",
  [
    body("email")
      .isEmail()
      .trim()
      .withMessage("Email address is not valid")
      .custom((value, { req }) => {
        return User.findOne({ email: value }).then((user) => {
          if (!user) {
            return Promise.reject(value.split("@")[0] + " doesn't exist's");
          }
        });
      }),
    body("password", "Must be atleast 5 char's long")
      .isAlphanumeric()
      .trim()
      .isLength({ min: 5 }),
  ],
  login
);

route.post(
  "/user/signup",
  [
    body("email")
      .isEmail()
      .trim()
      .withMessage("Email address is not valid")
      .normalizeEmail()
      .custom((value, { req }) => {
        return User.findOne({ email: value }).then((user) => {
          if (user) {
            return Promise.reject("User already exist's");
          }
        });
      }),
    body("firstname")
      .isString()
      .trim()
      .isLength({ min: 3, max: 12 })
      .withMessage(
        "Must be atleast 3 char's long and should not contain any numbers"
      ),
    body("lastname").isString().withMessage("Must be string").trim(),
    body("password", "Password must be 5 char's long")
      .isAlphanumeric()
      .trim()
      .isLength({ min: 5 }),
    body("confirmPassword").custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Password's doesn't match");
      }
      return true;
    }),
  ],
  signup
);

route.post("/user/logout", logoutUser);
module.exports = route;
