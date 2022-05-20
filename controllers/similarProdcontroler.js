/** @format */
const mongoose = require("mongoose");

const Product = mongoose.model("Product");

exports.FetchSimilarprodApi = async (req, res, next) => {
  const { data } = req.params;
  const prodList = await Product.find({ p_type: data });

  return res.status(200).json({ items: prodList });
};
