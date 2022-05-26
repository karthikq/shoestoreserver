/** @format */
const mongoose = require("mongoose");
const User = mongoose.model("User");
const Product = mongoose.model("Product");

const { validationResult } = require("express-validator");

const UserFollow = require("../models/UserFollow");

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
exports.UpdateIp = async (req, res, next) => {
  const { userIp } = req.body;
  try {
    const fetchUser = await User.findOne({ _id: req.user._id });
    fetchUser.userIp = userIp;
    await fetchUser.save();
    return res.status(201).json({ userData: fetchUser });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

exports.fetchIndUser = async (req, res, next) => {
  const { userId } = req.params;
  try {
    const findUser = await User.findOne({ _id: userId })
      .populate("cart.items.product")
      .populate("favProducts.product")
      .populate("order.products.product_id")
      .exec();

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
      .populate("order.products.product_id")
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
      .populate("order.products.product_id")
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
  const { email, firstname, lastname, profileUrl, phoneDetails, userLocation } =
    req.body;

  const { errors } = validationResult(req);

  try {
    if (errors.length > 0) {
      return res.status(422).json({ errors });
    }
    const findUser = await User.findOne({ _id: userId })
      .populate("cart.items.product")
      .populate("favProducts.product")
      .populate("order.products.product_id")
      .exec();
    if (!findUser) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }
    if (phoneDetails.value && userLocation.country) {
      if (
        phoneDetails.details.countryCode.toUpperCase() !== userLocation.country
      ) {
        return res.status(400).json({ message: "Location's doesn't match" });
      }
    }
    const username = firstname + " " + lastname;
    findUser.username = username;
    findUser.profileUrl = profileUrl;
    findUser.firstname = firstname;
    findUser.lastname = lastname;
    findUser.email = email;
    findUser.userLocation = userLocation;
    findUser.phoneDetails = phoneDetails;

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
      .populate("order.products.product_id")
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

exports.FollowUserApi = async (req, res, next) => {
  const { userId } = req.params;

  try {
    if (userId.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: "not allowed" });
    }

    const findUser = await User.findOne({ _id: userId });

    const users = [
      {
        user: req.user._id,
      },
    ];

    if (findUser) {
      const checkAlreadyFollowing = req.user.following.users.some((item) =>
        console.log(item.user.toString(), userId)
      );

      const checkFollowers = findUser.followers.users.some(
        (item) => item.user.toString() === req.user._id.toString()
      );
      // const getUser = await UserFollow.findOne({ _id: req.user._id });
      // const userFollow = await UserFollow.findOne({ _id: userId });

      // if (!getUser) {
      //   const newFollow = new UserFollow({
      //     userId: req.user._id,
      //     following: {
      //       users: [
      //         {
      //           user: mongoose.Types.ObjectId(userId),
      //         },
      //       ],
      //     },
      //   });
      //   await newFollow.save();
      //   execFollow(newFollow);
      // } else {
      //   const updateCurrentUser = await UserFollow.findOneAndUpdate(
      //     { _id: req.user._id },
      //     {
      //       $push: { "following.users": [{ user: userId }] },
      //     },
      //     {
      //       new: true,
      //     }
      //   );
      //   execFollow(updateCurrentUser);
      // }

      // async function execFollow(currentUser) {
      //   if (!userFollow) {
      //     const newFollowing = new UserFollow({
      //       userId: mongoose.Types.ObjectId(userId),
      //       followers: {
      //         users: [
      //           {
      //             user: req.user._id,
      //           },
      //         ],
      //       },
      //     });
      //     await newFollowing.save();
      //     return res
      //       .status(201)
      //       .json({ userData: currentUser, foundUser: newFollowing });
      //   } else {
      //     const foundUser = await User.findOneAndUpdate(
      //       { _id: userId },
      //       {
      //         $push: { "followers.users": users },
      //       },
      //       {
      //         new: true,
      //       }
      //     );
      //   }
      //   return res
      //     .status(201)
      //     .json({ userData: currentUser, foundUser: foundUser });
      // }
      if (checkFollowers) {
        const currentUserData = await User.findOneAndUpdate(
          { _id: req.user._id },
          {
            $pull: {
              "following.users": { user: userId },
            },
          },
          {
            new: true,
          }
        )
          .populate("cart.items.product")
          .populate("favProducts.product")
          .populate("order.products.product_id")
          .exec();

        const foundUser = await User.findByIdAndUpdate(
          { _id: userId },
          {
            $pull: {
              "followers.users": { user: req.user._id },
            },
          },
          {
            new: true,
          }
        )
          .populate("cart.items.product")
          .populate("favProducts.product")
          .populate("order.products.product_id")
          .exec();

        return res.status(201).json({ userData: currentUserData, foundUser });
      } else {
        const foundUser = await User.findOneAndUpdate(
          { _id: userId },
          {
            $push: { "followers.users": users },
          },
          {
            new: true,
          }
        )
          .populate("cart.items.product")
          .populate("favProducts.product")
          .populate("order.products.product_id")
          .exec();

        const updateCurrentUser = await User.findOneAndUpdate(
          { _id: req.user._id },
          {
            $push: { "following.users": [{ user: userId }] },
          },
          {
            new: true,
          }
        )
          .populate("cart.items.product")
          .populate("favProducts.product")
          .populate("order.products.product_id")
          .exec();
        return res
          .status(201)
          .json({ userData: updateCurrentUser, foundUser: foundUser });
      }
    } else {
      return res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    console.log(error);
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};
