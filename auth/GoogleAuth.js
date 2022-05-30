/** @format */

const GoogleStratergy = require("passport-google-oauth20").Strategy;
const mongosoe = require("mongoose");
const { nanoid } = require("nanoid");
const { backendUrl } = require("../api/Backendurl");

const User = mongosoe.model("User");

exports.GoogleAuth = async (passport) => {
  try {
    passport.use(
      new GoogleStratergy(
        {
          clientID: process.env.OAUTH_GOOGLE_ID,
          clientSecret: process.env.OAUTH_GOOGLE_SECRET,
          callbackURL: backendUrl() + "/v1/auth/google/callback",
        },
        async function (accessToken, refreshToken, profile, cb) {
          const { displayName, photos, emails, id } = profile;
          const email = emails[0].value;
          const profileUrl = photos[0].value;
          const firstname = displayName.split(" ")[0];
          const lastname = displayName.split(" ")[1] || "";
          try {
            const findUser = await User.findOne({ email })
              .populate("cart.items.product")
              .populate("favProducts.product")
              .populate("order.products.product_id")
              .exec();

            if (!findUser) {
              const userId = nanoid();
              const newGoogleUser = new User({
                username: displayName,
                userId,
                profileUrl,
                email,
                firstname,
                lastname,
                googleId: id,
              });
              await newGoogleUser.save();
              cb(null, newGoogleUser);
            } else {
              cb(null, findUser);
            }
          } catch (error) {
            console.log(error);
            error.statusCode = 403;
          }
        }
      )
    );
    passport.serializeUser(function (user, done) {
      done(null, user.id);
    });

    passport.deserializeUser(function (id, done) {
      User.findById(id, function (err, user) {
        done(err, user);
      });
    });
  } catch (error) {
    throw error;
  }
};
