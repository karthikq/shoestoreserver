/** @format */

const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const Follow = new Schema({
  userId: String,
  follwers: {
    users: [
      {
        user: Schema.Types.ObjectId,
      },
    ],
  },
  following: {
    users: [
      {
        user: Schema.Types.ObjectId,
      },
    ],
  },
});

const UserFollow = mongoose.model("UserFollow", Follow);

module.exports = UserFollow;
