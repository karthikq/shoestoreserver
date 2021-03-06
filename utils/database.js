/** @format */

const mongoose = require("mongoose");
const config = require("./config");
const env = process.env.NODE_ENV || "development";

const connection = async () => {
  try {
    await mongoose.connect(config.db[env]);

    mongoose.connection.on("connected", () => {
      console.log("connected to database");
    });
    mongoose.connection.on("error", () => {
      throw Error("Error while connecting to databse");
    });
    return "connected to the database";
  } catch (error) {
    console.log(error);
    throw Error("Error while connecting to databse");
  }
};

module.exports = connection;
