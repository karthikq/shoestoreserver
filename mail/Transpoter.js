/** @format */
const nodeMailer = require("nodemailer");

exports.transporter = () => {
  const transport = nodeMailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASS,
    },
    tls: { rejectUnauthorized: false },
    priority: "high",
  });

  return transport;
};
