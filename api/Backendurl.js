/** @format */

exports.backendUrl = () => {
  if (process.env.NODE_ENV === "production") {
    return "https://shoe-store-app.onrender.com";
  } else {
    return "http://localhost:5000";
  }
};
