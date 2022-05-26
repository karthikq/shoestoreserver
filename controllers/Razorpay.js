/** @format */

const { nanoid } = require("nanoid");
const Razorpay = require("razorpay");
const crypto = require("crypto");

const User = require("mongoose").model("User");

const instance = new Razorpay({
  key_id: process.env.KEY_ID,
  key_secret: process.env.KEY_SECRET,
});

exports.CreateOrder = (req, res, next) => {
  const receptId = nanoid();
  const { amt } = req.params;
  const { currency } = req.query;

  const options = {
    amount: amt * 100,
    currency: currency,
    receipt: receptId,
  };

  instance.orders.create(options, (err, order) => {
    if (err) {
      err.message = err.error.description;
      next(err);
    } else {
      res.status(201).json(order);
    }
  });
};
exports.verifyOrder = async (req, res, next) => {
  const { orderData, response, userData } = req.body;
  console.log(
    userData.cart.items.map((item) => {
      return {
        product_id: item.product._id,
        quantity: item.quantity,
      };
    })
  );
  const findUser = await User.findOne({ _id: userData._id });
  if (!findUser) {
    return res.status(404).json("User not found");
  }
  if (!orderData || !response) {
    return res.status(403).json("Not authotized");
  }

  const text = orderData.id + "|" + response.razorpay_payment_id;
  try {
    const hash = crypto.createHmac("sha256", process.env.KEY_SECRET);
    hash.update(text);
    const digest = hash.digest("hex");

    if (digest === response.razorpay_signature) {
      const updateUser = await User.findOneAndUpdate(
        { _id: userData._id },
        {
          $push: {
            "order.products": userData.cart.items.map((item) => {
              return {
                product_id: item.product._id,
                quantity: item.quantity,
                orderId: orderData.id,
                payment_id: response.razorpay_payment_id,
              };
            }),
          },
          $set: {
            "cart.items": [],
          },
        },
        {
          new: true,
        }
      );
      return res
        .status(200)
        .json({ orderVerified: true, userData: updateUser });
    } else {
      return res.status(200).json({ orderVerified: false });
    }
  } catch (error) {
    console.log(error);
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};
