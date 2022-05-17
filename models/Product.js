/** @format */

const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const ProductSchema = new Schema(
  {
    p_id: {
      type: String,
    },
    p_name: {
      type: String,
      required: true,
    },
    p_desp: String,
    p_brand: String,
    p_type: String,
    p_img: [],
    price: {
      type: Number,
      required: true,
    },

    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    totalRating: Number,
    rating: [
      {
        user: {
          type: Schema.Types.ObjectId,
          ref: "User",
        },
        value: {
          type: Number,
          min: 0,
          max: 5,
          default: 0,
        },
      },
    ],
    viewCount: {
      type: Number,
      min: 0,
      default: 0,
    },
    likes: [
      {
        userId: {
          type: Schema.Types.ObjectId,
          ref: "User",
        },
        count: {
          type: Number,
          min: 0,
          default: 0,
          max: 1,
        },
      },
    ],
    keywords: [],
    date: String,
    sortDate: Date,
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model("Product", ProductSchema);

module.exports = Product;
