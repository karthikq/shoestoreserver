/** @format */
const mongoose = require("mongoose");
const User = mongoose.model("User");
const Product = mongoose.model("Product");

const { validationResult } = require("express-validator");

exports.fetchuser = async (req, res, next) => {
  try {
    if (req.user) {
      res.status(200).json({ userData: req.user });
    } else {
      const error = new Error("Not authenticated");
      error.statusCode = 403;
      next(error);
    }
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

exports.fetchIndUser = async (req, res, next) => {
  console.log("S");
  const { userId } = req.params;
  try {
    const findUser = await User.findOne({ _id: userId });

    if (findUser) {
      res.status(200).json({ foundUserData: findUser });
    } else {
      return res.status(404).json("User not found");
    }
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

exports.addToFav = async (req, res, next) => {
  const prodId = req.params.prodId;

  try {
    const prodDetails = await Product.findOne({ _id: prodId });

    await req.user.addtoFav(prodId, prodDetails);
    // const resp = data
    //   .populate("cart.items.product")
    //   .populate("favProducts.product")
    //   .exec();
    // console.log(resp);
    const userData = await User.findOne({ _id: req.user._id })
      .populate("cart.items.product")
      .populate("favProducts.product")
      .exec();

    return res.status(201).json({ message: "changed", userData: userData });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};
exports.addTocart = async (req, res, next) => {
  const prodId = req.params.prodId;

  try {
    const prodDetails = await Product.findOne({ _id: prodId });

    if (prodDetails.userId.toString() === req.user._id.toString()) {
      return res.status(401).json({ message: "NOT ALLOWED" });
    }
    await req.user.addtoCart(prodId);
    const userData = await User.findOne({ _id: req.user._id })
      .populate("cart.items.product")
      .populate("favProducts.product")
      .exec();

    res.status(201).json({ message: "added to cart", userData: userData });
  } catch (error) {
    console.log(error);
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

exports.updateUser = async (req, res, next) => {
  const { userId } = req.params;
  const { email, firstname, lastname, profileUrl } = req.body;

  const { errors } = validationResult(req);

  try {
    if (errors.length > 0) {
      return res.status(422).json({ errors });
    }
    const findUser = await User.findOne({ _id: userId })
      .populate("cart.items.product")
      .populate("favProducts.product")
      .exec();
    if (!findUser) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }
    const username = firstname + " " + lastname;
    findUser.username = username;
    findUser.profileUrl = profileUrl;
    findUser.firstname = firstname;
    findUser.lastname = lastname;
    findUser.email = email;
    const result = await findUser.save();
    return res.status(201).json({ userData: result });
  } catch (error) {
    console.log(error);
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

exports.updateCart = async (req, res, next) => {
  const { prodId } = req.params;

  try {
    await req.user.updateCartMethod(prodId);
    const userData = await User.findOne({ _id: req.user._id })
      .populate("cart.items.product")
      .populate("favProducts.product")
      .exec();

    res.status(201).json({ message: "Item Updated", userData: userData });
  } catch (error) {
    console.log(error);
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};
exports.removeCartItem = async (req, res, next) => {
  const { prodId } = req.params;
  try {
    const resp = await req.user.RemoveCartItem(prodId);
    console.log(resp);
    res.json({ userData: resp });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
    console.log(error);
  }
};
