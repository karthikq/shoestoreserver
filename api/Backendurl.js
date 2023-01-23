/** @format */

exports.backendUrl = () => {
  if (process.env.NODE_ENV === "production") {
    return "https://shoestoreserver-production.up.railway.app/v1";
  } else {
    return "http://localhost:5000";
  }
};
