/** @format */

exports.backendUrl = () => {
  if (process.env.NODE_ENV === "production") {
    return "https://murmuring-reef-49332.herokuapp.com";
  } else {
    return "http://localhost:5000";
  }
};
