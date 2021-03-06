/** @format */

module.exports = {
  port: 3000,
  db: {
    production: `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.44gx5.mongodb.net/${process.env.MONGO_DB}`,
    development: `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.44gx5.mongodb.net/${process.env.MONGO_DB}`,
    test: "mongodb://localhost/test",
  },
};
