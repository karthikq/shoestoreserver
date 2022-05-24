/** @format */
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const User = mongoose.model("User");
const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator");
const { frontendUrl } = require("./FrontendUrl");
const crypto = require("crypto");
const nodeMailer = require("nodemailer");
const passport = require("passport");

const transport = nodeMailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASS,
  },
  tls: {
    rejectUnauthorized: true,
  },
});
var redirectPath;

exports.getSignin = (req, res, next) => {
  const { query } = req.query;
  if (query) {
    redirectPath = frontendUrl() + query;
  } else {
    redirectPath = frontendUrl();
  }
  console.log(redirectPath);
  next();
};

exports.googleCallback = (req, res, next) => {
  console.log("authenticated");
  const { email, _id } = req.user;

  const token = jwt.sign(
    { email: email, userId: _id },
    process.env.JWT_SECRECT,
    { expiresIn: "12h" }
  );

  res.redirect(redirectPath + "?token=" + token);
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
    const checkUser = await User.findOne({ email }).select("+password").exec();

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
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.logoutUser = (req, res, next) => {
  try {
    req.user = {};
    res.status(200).json({ message: "User logged out" });
  } catch (error) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.checkUserEmail = async (req, res, next) => {
  const useremail = req.params.id;

  const frontEndUrl = frontendUrl();
  try {
    const checkEmail = await User.findOne({ email: useremail })
      .select("+password")
      .exec();
    if (!checkEmail) {
      return res.status(404).json({ message: "User not found" });
    } else {
      crypto.randomBytes(32, async (err, buffer) => {
        if (err) {
          next(err);
        } else {
          const emailToken = buffer.toString("hex");
          //saving token user database
          checkEmail.resetToken = emailToken;
          checkEmail.tokenExpirationDate = Date.now() + 3600000;
          await checkEmail.save();
          transport
            .sendMail({
              from: "productstorewebapp@gmail.com",
              to: useremail,
              subject: "Reset password",
              html: ` <head>
              <meta charset="UTF-8" />
              <meta http-equiv="X-UA-Compatible" content="IE=edge" />
              <meta name="viewport" content="width=device-width, initial-scale=1.0" />
              <link rel="preconnect" href="https://fonts.googleapis.com" />
              <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
              <title>Reset password</title>
              <style>
              .email-container {
                display: flex;
                font-family: "Poppins", sans-serif;
                color:black;
              }
              .email-contents {
                height: 85%;
                text-align: left;
                margin: 3rem 0rem;
              }
                .email-h1 {
                  font-size: 2rem;
                  margin-top: 0;
                  margin-bottom: 0.8rem;
                }
                .email-span {
                  display: block;
                  max-width: 30rem;
                  margin-bottom: 0.5rem;
                  margin-top: 0.5rem;
                }
                .email-btn {
                  cursor: pointer;
                  margin-top: 1.2rem;
                  padding: 0.4rem;
                  width: 9rem;
                  border-radius: 15px;
                  background-color: black;
                  color: white;
                  border:0;
                  outline:0;
                  font-family: "Poppins", sans-serif;
                }
              </style>
            </head>
            <body>
              <div class="email-container">
                <div class="email-contents">
                  <h1 class="email-h1">Reset your password</h1>
                  <span class="email-span">
                    You're receiving this e-mail because you requested a password reset
                    for your shoestore account. <br />
                    Please tap the button below to choose a new password.
                  </span>
                  <a href=${`${frontEndUrl}/reset/user/${emailToken}?user=${checkEmail._id}`}>
                    <button class="email-btn">Click here</button>
                  </a>
                </div>
              </div>
            </body>`,
            })
            .then((result) => {
              console.log(result);
              return res.status(200).json({ message: "User found" });
            })
            .catch((error) => {
              console.log(error);
              if (!error.statusCode) {
                error.statusCode = 500;
              }
              next(error);
            });
        }
      });
    }
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

exports.checkUserToken = async (req, res, next) => {
  const token = req.params.id;
  const { newpassword } = req.body;
  const { user } = req.query;

  const { errors } = validationResult(req);
  if (errors.length > 0) {
    return res.status(422).json({ errors });
  }
  try {
    const findUser = await User.findOne({
      resetToken: token,
      tokenExpirationDate: { $gt: Date.now() },
      _id: user,
    })
      .select("+password")
      .exec();

    if (findUser) {
      bcrypt.hash(newpassword, 10, async (err, hash) => {
        if (err) {
          return next(err);
        }
        findUser.password = hash;
        findUser.resetToken = "";
        findUser.tokenExpirationDate = "";
        await findUser.save();

        return res.status(200).json({ message: "Password updated" });
      });
    } else {
      return res
        .status(404)
        .json({ message: "token has expired please try again" });
    }
  } catch (error) {
    console.log(error);
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};
