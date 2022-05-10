/** @format */

const express = require("express");
const {
  getProducts,
  createProduct,

  deleteProduct,
  singleProduct,
  updateProductview,
  updateLike,
  addRating,
  removeRating,
  editProduct,
} = require("../controllers/productcontoller");
const { isAuth } = require("../middleware/isAuth");
const { body } = require("express-validator");
const route = express.Router();

route.get("/all", getProducts);
route.post(
  "/create",
  [
    body("p_name")
      .isLength({ min: 1, max: 12 })
      .withMessage("maxium of 12 character's are allowed")
      .trim(),
    body("p_desp")
      .isLength({ min: 0, max: 200 })
      .withMessage("Must be less than 200 character's")
      .trim(),
    body("p_price")
      .isNumeric()
      .trim()
      .withMessage("Price must be a number and it is required"),
    body("p_img").isArray().withMessage("Must be an array of images"),
  ],
  isAuth,
  createProduct
);
route.patch("/edit/:prodId", isAuth, editProduct);

// route.delete("/all", deleteProduct);
route.patch("/remove/:prodId", isAuth, deleteProduct);
route.get("/get/:prodId", singleProduct);
route.patch("/update/view/:prodId", updateProductview);
route.patch("/like/:prodId", isAuth, updateLike);
route.patch("/rate/:prodId", isAuth, addRating);
route.patch("/remove/rating/:prodId", isAuth, removeRating);

module.exports = route;
