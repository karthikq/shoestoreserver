/** @format */

const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const User = mongoose.model("User");

exports.isAuth = (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization) {
    const error = new Error("User not authorized");
    error.statusCode = 400;
    throw error;
  }

  const token = authorization.split(" ")[1];
  if (!token) {
    const error = new Error("Invalid Token");
    error.statusCode = 400;
    throw error;
  }

  jwt.verify(token, process.env.JWT_SECRECT, async (err, decodedToken) => {
    try {
      if (err) {
        const error = new Error("User not valid");
        error.statusCode = 403;
        throw error;
      }
      if (!decodedToken) {
        const error = new Error("User not authorized");
        error.statusCode = 403;
        throw error;
      }
      if (decodedToken) {
        const userData = await User.findOne({ _id: decodedToken.userId })
          .populate("cart.items.product")
          .populate("favProducts.product")
          .exec();

        if (!userData) {
          const error = new Error("User not found");
          error.statusCode = 500;
          next(error);
        }
        req.user = userData;
        next();
      }
    } catch (error) {
      if (!error.statusCode) {
        error.statusCode = 500;
      }
      next(error);
    }
  });
};
