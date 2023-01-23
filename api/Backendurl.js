/** @format */

exports.backendUrl = () => {
  if (process.env.NODE_ENV === "production") {
    return "https://shoestoreserver-production.up.railway.app";
  } else {
    return "http://localhost:5000";
  }
};
