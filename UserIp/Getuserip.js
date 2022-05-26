/** @format */

const axios = require("axios");

exports.getUserip = async () => {
  try {
    const data = await axios.get(
      `https://api.ipdata.co?api-key=${"0b953632748eeb22974bdb44dda243b5fa8cc01c4d2dd55f7c2223d0"}`
    );
    if (data.data) {
      return data.data;
    } else {
      return {};
    }
  } catch (error) {
    console.log(error);
  }
};
