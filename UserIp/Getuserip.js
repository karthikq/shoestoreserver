/** @format */

const axios = require("axios");

exports.getUserip = async () => {
  try {
    const data = await axios.get("https://geolocation-db.com/json/");
    if (data.data) {
      return data.data;
    } else {
      return {};
    }
  } catch (error) {
    console.log(error);
  }
};
