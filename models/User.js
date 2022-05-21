/** @format */

const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const UserSchema = new Schema(
  {
    userId: String,
    username: String,
    email: { type: String, required: true },
    firstname: String,
    lastname: String,
    profileUrl: String,
    googleId: String,
    password: { type: String, select: false },
    resetToken: String,
    tokenExpirationDate: String,
    userLocation: {
      country: String,
      state: String,
      city: String,
    },
    phoneDetails: {
      value: String,
      details: Object,
    },

    favProducts: [
      {
        product: {
          type: Schema.Types.ObjectId,
          ref: "Product",
        },
      },
    ],
    cart: {
      items: [
        {
          product: {
            type: Schema.Types.ObjectId,
            ref: "Product",
          },
          quantity: Number,
        },
      ],
    },
    order: {
      products: [
        {
          product_id: {
            type: Schema.Types.ObjectId,
            ref: "Product",
          },
        },
      ],
      quantity: Number,
    },
    date: String,
  },
  {
    timestamps: true,
  }
);

UserSchema.methods.addtoFav = async function (prodId, prodDetails) {
  const favProducts = this.favProducts;
  const checkProduct = favProducts.find(
    (item) => item.product._id.toString() === prodId
  );

  if (checkProduct) {
    const filterdData = favProducts.filter(
      (item) => item.product._id.toString() !== prodId
    );
    this.favProducts = filterdData;
  } else {
    // if (prodDetails.userId.toString() === this._id.toString()) {
    //   const error = new Error("Not allowed");
    //   error.statusCode = 401;
    //   throw error;
    // } else {
    favProducts.push({
      product: prodId,
    });
    // }
  }
  return await this.save();
};

UserSchema.methods.addtoCart = async function (prodId) {
  const cart = this.cart.items;

  const checkProduct = cart.find(
    (item) => item.product._id.toString() === prodId
  );

  if (checkProduct) {
    checkProduct.quantity++;
  } else {
    cart.push({
      product: prodId,
      quantity: 1,
    });
  }
  return await this.save();
};
function RemoveItemFromCart(cartItems, prodId) {
  const item = cartItems.filter(
    (item) => item.product._id.toString() !== prodId
  );
  return item;
}
UserSchema.methods.updateCartMethod = async function (prodId) {
  const cartItems = this.cart.items;
  const product = cartItems.find((item) => {
    return item.product._id.toString() === prodId;
  });
  if (product) {
    if (product.quantity - 1 <= 0) {
      const items = RemoveItemFromCart(cartItems, prodId);
      this.cart.items = items;
      return await this.save();
    } else {
      product.quantity--;
    }
  } else {
    const error = new Error("Item not found");
    error.statusCode = 404;
    throw error;
  }
  return await this.save();
};
UserSchema.methods.RemoveCartItem = async function (prodId) {
  const cartItems = this.cart.items;
  const items = RemoveItemFromCart(cartItems, prodId);
  this.cart.items = items;
  return await this.save();
};
const User = mongoose.model("User", UserSchema);

module.exports = User;
