/** @format */

const expect = require("chai").expect;
const chai = require("chai");
const mongoose = require("mongoose");
const chaihttp = require("chai-http");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const sinon = require("sinon");
const app = require("../app");
chai.use(chaihttp);

describe("Test user controller", () => {
  // before(function (done) {
  //   mongoose
  //     .connect("mongodb://localhost:27017/test")
  //     .then(() => {
  //       console.log("connected to database");
  //       done();
  //     })
  //     .catch((err) => {
  //       console.log(err);
  //     });
  // });

  it("User doesn't exist's", (done) => {
    chai
      .request(app)
      .post("/v1/auth/user/login")
      .set("content-type", "application/json")
      .send({
        email: "a@a.com",
        password: "qweqwe",
      })
      .end((err, res) => {
        expect(res.status).to.equal(422);
        expect(res).to.have.property("error");
        expect(res.text).to.be.a("string");

        done();
      });
  });

  it("test user signup", (done) => {
    chai
      .request(app)
      .post("/v1/auth/user/signup")
      .set("content-type", "application/json")
      .send({
        email: "test@test.com",
        password: "testqwerty",
        confirmPassword: "testqwerty",
        firstname: "testname",
        lastname: "test",
        username: "test",
        profileUrl: "test.com",
      })
      .end((err, res) => {
        expect(res.status).to.equal(201);
        expect(JSON.parse(res.text).message).to.equal("user created");

        done();
      });
  });

  it("test user login", (done) => {
    // sinon.stub(bcrypt, "compare").resolves({ result: true });
    chai
      .request(app)
      .post("/v1/auth/user/login")
      .set("content-type", "application/json")
      .send({
        email: "test@test.com",
        password: "testqwerty",
      })
      .end((err, res) => {
        expect(res.status).to.equal(200);
        expect(JSON.parse(res.text).message).to.equal("user found");
        done();
      });
  });
  // after(function (done) {
  //   User.deleteMany({}).then(() => {
  //     done();
  //   });
  // });
});
