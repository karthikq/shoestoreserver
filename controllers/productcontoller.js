/** @format */

const mongoose = require("mongoose");
const { validationResult } = require("express-validator");
/** @format */
const Product = mongoose.model("Product");
const { nanoid } = require("nanoid");
const _ = require("lodash");
const User = require("../models/User");

exports.getProducts = async (req, res, next) => {
  try {
    const products = await Product.find()
      .populate("likes.userId")
      .populate("rating.user");

    return res.status(200).json({ products });
  } catch (error) {
    console.log(error);
  }
};

exports.createProduct = async (req, res, next) => {
  const { p_name, p_desp, p_price, p_img, p_category } =
    req.body.productDetails;
  const { errors } = validationResult(req);
  if (errors.length > 0) {
    return res.status(422).json({ errors });
  }
  try {
    const newProduct = new Product({
      p_id: nanoid(),
      p_name,
      p_img,
      p_desp,
      price: p_price,
      keywords: p_category,
      date: new Date().toLocaleString(),
      userId: req.user._id,
    });
    const data = await newProduct.save();
    res.status(201).json(data);
  } catch (error) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
exports.editProduct = async (req, res, next) => {
  const { p_name, p_desp, p_price, p_img, p_category } = req.body;
  const { prodId } = req.params;

  try {
    const findProduct = await Product.findOne({ p_id: prodId });
    if (!findProduct) {
      res.status(404).json({ message: "product not found" });
    } else {
      if (findProduct.userId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: "NOT ALLOWED" });
      } else {
        const fetchProduct = await Product.findOneAndUpdate(
          { p_id: prodId },
          {
            $set: {
              p_name,
              p_desp,
              p_img,
              price: p_price,
              keywords: p_category,
            },
          },
          {
            new: true,
          }
        );
        if (!fetchProduct) {
          res.status(404).json({ message: "product not found" });
        } else {
          res
            .status(201)
            .json({ data: fetchProduct, message: "product updated" });
        }
      }
    }
  } catch (error) {
    console.log(error);
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
exports.updateProductview = async (req, res, next) => {
  const prodId = req.params.prodId;

  try {
    const resp = await Product.findOne({ p_id: prodId });

    if (!resp) {
      const error = new Error("product not found");
      error.statusCode = 404;
      throw error;
    }
    const updatedProduct = await Product.findOneAndUpdate(
      { p_id: prodId },
      {
        $set: { viewCount: resp.viewCount + 1 },
      },
      {
        new: true,
      }
    )
      .populate("likes.userId")
      .populate("rating.user")
      .exec();
    res.json({ updatedProduct });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    console.log(err);
    next(err);
  }
};
module.exports.updateLike = async (req, res, next) => {
  const prodId = req.params.prodId;

  const resp = await Product.findOne({ p_id: prodId });

  try {
    if (!resp) {
      const error = new Error("product not found");
      error.statusCode = 404;
      throw error;
    }

    const findUser = resp.likes?.find((user) => {
      return user.userId._id.toString() === req.user._id.toString();
    });
    if (findUser) {
      const removeLike = await Product.findOneAndUpdate(
        { p_id: prodId },
        {
          $pull: { likes: { userId: req.user._id } },
        },
        {
          new: true,
        }
      )
        .populate("likes.userId")
        .populate("rating.user")
        .exec();

      return res
        .status(200)
        .json({ message: "like removed", updatedProduct: removeLike });
    } else {
      const likedBy = {
        userId: req.user._id,
        count: 1,
      };
      const updateDetails = await Product.findOneAndUpdate(
        { p_id: prodId },
        {
          $push: { likes: likedBy },
        },
        {
          new: true,
        }
      )
        .populate("likes.userId")
        .populate("rating.user")
        .exec();

      return res
        .status(200)
        .json({ message: "liked post", updatedProduct: updateDetails });
    }
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }

    next(error);
  }
};

exports.deleteProduct = async (req, res, next) => {
  const prodId = req.params.prodId;
  try {
    const data = await Product.findOne({ _id: prodId });
    if (!data) {
      const error = new Error("Product not found");
      error.statusCode = 404;
      throw error;
    }

    if (req.user._id.toString() !== data.userId.toString()) {
      const error = new Error("NOT ALLOWED");
      error.statusCode = 403;
      throw error;
    } else {
      //deleting the product from products collection
      const resp = await Product.findOneAndRemove(
        { _id: prodId },
        { new: true }
      );

      //deleting the product in user collection

      const userResp = await User.findByIdAndUpdate(
        { _id: req.user._id },
        {
          $pull: {
            "cart.items": { product: prodId },
            favProducts: { product: prodId },
          },
        }
      )
        .populate("cart.items.product")
        .populate("favProducts.product")
        .exec();
      await User.updateMany(
        {},
        {
          $pull: {
            "cart.items": { product: prodId },
            favProducts: { product: prodId },
          },
        }
      );
      return res.status(201).json({ userData: userResp, product: resp });
    }
  } catch (error) {
    console.log(error);
    if (!error.statusCode) {
      error.statusCode = 500;
    }

    next(error);
  }
};

module.exports.singleProduct = async (req, res, next) => {
  const prodId = req.params.prodId;

  try {
    const fetchProduct = await Product.findOne({ p_id: prodId })
      .populate("likes.userId")
      .populate("rating.user")
      .exec();
    if (!fetchProduct) {
      const error = new Error("product not found");
      error.statusCode = 404;
      throw error;
    }
    res
      .status(200)
      .json({ message: "product found", productData: fetchProduct });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

exports.addRating = async (req, res, next) => {
  const { prodId } = req.params;
  const { count } = req.query;

  try {
    const findProduct = await Product.findOne({ p_id: prodId })
      .populate("rating.user")
      .populate("likes.userId")
      .exec();
    if (!findProduct) {
      const error = new Error("product not found");
      error.statusCode = 404;
      throw error;
    }

    const data = {
      user: req.user._id.toString(),
      value: parseInt(count),
    };

    if (findProduct.rating.length > 0) {
      const findUser = findProduct.rating?.find((elem) => {
        return elem.user === req.user._id.toString();
      });
      if (findUser) {
        return res.json({ message: "already rated", status: 400 });
      }
    }
    const updatedProduct = await Product.findOneAndUpdate(
      { p_id: prodId },
      { $push: { rating: data } },
      { new: true }
    )
      .populate("rating.user")
      .populate("likes.userId")
      .exec();

    const total = _.sum(updatedProduct.rating.map((item) => item.value));
    updatedProduct.totalRating = total / updatedProduct.rating.length;
    await updatedProduct.save();

    res.status(201).json({ message: "rating added", updatedProduct });
  } catch (error) {
    console.log(error);
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};
exports.removeRating = async (req, res, next) => {
  const prodId = req.params.prodId;

  try {
    const findProduct = await Product.findOne({ p_id: prodId });
    if (!findProduct) {
      const error = new Error("Product not found");
      error.statusCode = 404;
      throw error;
    }
    const prodDetails = await Product.findOneAndUpdate(
      { p_id: prodId },
      {
        $pull: { rating: { user: req.user._id } },
      },
      {
        new: true,
      }
    )
      .populate("rating.user")
      .populate("likes.userId")
      .exec();

    if (prodDetails.rating.length > 0) {
      const total = _.sum(prodDetails.rating?.map((item) => item.value));
      prodDetails.totalRating = total / prodDetails.rating.length;
    } else {
      prodDetails.totalRating = 0;
    }
    await prodDetails.save();

    res
      .status(201)
      .json({ message: "rating added", updatedProduct: prodDetails });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};
