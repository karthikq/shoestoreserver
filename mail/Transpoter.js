/** @format */
const nodeMailer = require("nodemailer");
const { google } = require("googleapis");

exports.transporter = () => {
  const OAuth2Client = new google.auth.OAuth2(
    process.env.OAUTH_CLIENTID,
    process.env.OAUTH_CLIENT_SECRET,
    process.env.OAUTH_REDIRECT_URL
  );
  OAuth2Client.setCredentials({
    refresh_token: process.env.OAUTH_REFRESH_TOKEN,
  });

  let transport = OAuth2Client.getAccessToken()
    .then((res) => {
      let transport = nodeMailer.createTransport({
        service: "gmail",
        auth: {
          type: "OAuth2",
          user: process.env.MAIL_USERNAME,
          pass: process.env.MAIL_PASSWORD,
          clientId: process.env.OAUTH_CLIENTID,
          clientSecret: process.env.OAUTH_CLIENT_SECRET,
          refreshToken: process.env.OAUTH_REFRESH_TOKEN,
          accessToken: res,
        },
      });
      return transport;
    })
    .catch((err) => {
      console.log(err);
    });
  return transport;
};
