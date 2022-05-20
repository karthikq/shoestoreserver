/** @format */

const { FetchSimilarprodApi } = require("../controllers/similarProdcontroler");

const route = require("express").Router();

route.get("/product/list/:data", FetchSimilarprodApi);

module.exports = route;
