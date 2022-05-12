/** @format */

exports.frontendUrl = () => {
  if (process.env.NODE_ENV === "production") {
    return "https://shoestorea.netlify.app";
  } else {
    return "http://localhost:3000";
  }
};
