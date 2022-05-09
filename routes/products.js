/** @format */

const express = require("express");
const {
  getProducts,
  createProduct,
  editProduct,
  deleteProduct,
  singleProduct,
  updateProductview,
  updateLike,
  addRating,
  removeRating,
} = require("../controllers/productcontoller");
const { isAuth } = require("../middleware/isAuth");

const route = express.Router();

route.get("/all", getProducts);
route.post("/create", isAuth, createProduct);
// route.put("/", editProduct);
// route.delete("/all", deleteProduct);
route.patch("/remove/:prodId", isAuth, deleteProduct);
route.get("/get/:prodId", singleProduct);
route.patch("/update/view/:prodId", updateProductview);
route.patch("/like/:prodId", isAuth, updateLike);
route.patch("/rate/:prodId", isAuth, addRating);
route.patch("/remove/rating/:prodId", isAuth, removeRating);

module.exports = route;
