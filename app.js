/** @format */
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connection = require("./utils/database");

const ip = require("ip");

require("./models/Product");
const api = require("./routes/api");

const Port = process.env.PORT || 5000;

const app = express();
app.use(cors());

// app.use(cookieParser());
// app.use(csurfProtection);
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// app.use(async (req, res, next) => {
//   User.findById({ _id: "6254000bdbb530e877e52559" })
//     .then((user) => {
//       if (!user) {
//         const error = new Error("user not found");
//         error.statusCode = 404;
//         throw error;
//       }
//       req.user = user;
//       next();
//     })
//     .catch((err) => {
//       if (!err.statusCode) {
//         err.statusCode = 500;
//       }
//       next(err);
//     });
// });

// app.get("/getcsrftoken", (req, res, next) => {
//   res.json({ CSRFToken: req.csrfToken() });
// });
app.get("/", (req, res) => {
  ip.address();
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
