/** @format */

const express = require("express");

const route = express.Router();
const { body } = require("express-validator");

const {
  fetchuser,
  addToFav,
  addTocart,
  updateUser,
  updateCart,
  removeCartItem,
  fetchIndUser,
  FollowUserApi,
} = require("../controllers/userController");
const { isAuth } = require("../middleware/isAuth");

route.get("/get/:userId", fetchIndUser);

route.get("/userdetails", isAuth, fetchuser);

route.patch("/add/fav/:prodId", isAuth, addToFav);
route.patch("/add/cart/:prodId", isAuth, addTocart);
route.patch("/remove/item/:prodId", isAuth, updateCart);
route.patch("/delete/cart/item/:prodId", isAuth, removeCartItem);

route.put(
  "/update/:userId",
  [
    body("firstname")
      .isString()
      .trim()
      .isLength({ min: 3, max: 12 })
      .withMessage("Minimum of 3 character's is required"),
    body("lastname").trim().isString().withMessage("Must be String"),
    body("profileUrl").isURL().withMessage("Image must be a valid Url"),
  ],
  isAuth,
  updateUser
);

route.post("/follow/:userId", isAuth, FollowUserApi);

module.exports = route;
