/** @format */
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connection = require("./utils/database");
const helmet = require("helmet");
const compression = require("compression");

require("./models/Product");
const api = require("./routes/api");

const Port = process.env.PORT || 5000;

const app = express();
app.use(cors());
app.use(helmet());
app.use(compression());

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.get("/", (req, res) => {
  res.redirect("/v1");
});

app.use("/v1", api);

app.use((error, req, res, next) => {
  const status = error.statusCode || 500;
  const message = error.message;

  res.status(status).json({ message: message });
});

connection()
  .then(async (res) => {
    app.listen(Port, () => {
      console.log("Server is running");
    });
  })
  .catch((err) => console.log(err));
module.exports = app;
