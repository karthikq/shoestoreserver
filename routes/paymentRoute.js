/** @format */

const { CreateOrder, verifyOrder } = require("../controllers/Razorpay");
const { isAuth } = require("../middleware/isAuth");

const route = require("express").Router();

route.get("/create/:amt", isAuth, CreateOrder);
route.post("/verify", isAuth, verifyOrder);

module.exports = route;
