/** @format */

const express = require("express");

const api = express.Router();

api.use("/auth", require("./auth"));
api.use("/product", require("./products"));
api.use("/user", require("./user"));

module.exports = api;
