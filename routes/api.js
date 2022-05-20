/** @format */

const express = require("express");

const api = express.Router();

api.use("/auth", require("./auth"));
api.use("/product", require("./products"));
api.use("/user", require("./user"));
api.use("/similar", require("./similar"));

api.get("/", (req, res, next) => {
  res.send("Running on Api version 1");
});

module.exports = api;
