/** @format */

const expect = require("chai").expect;
const chai = require("chai");

const chaihttp = require("chai-http");
const { default: mongoose } = require("mongoose");
const { nanoid } = require("nanoid");
const app = require("../app");
const Product = require("../models/Product");
const User = require("../models/User");

chai.use(chaihttp);

describe("testing product's route", () => {
  before(function (done) {
    Product.deleteMany({}).then(() => {
      done();
    });
  });

  let user;
  let token;

  it("generate's user token", (done) => {
    chai
      .request(app)
      .post("/v1/auth/user/signup")
      .set("content-type", "application/json")
      .send({
        email: "test2@test.com",
        password: "testqwerty",
        confirmPassword: "testqwerty",
        firstname: "testname",
        lastname: "test",
        username: "test",
        profileUrl: "test.com",
      })
      .end((err, res) => {
        //         expect(res.status).to.equal(201);
        expect(JSON.parse(res.text)).to.have.property("token");

        user = JSON.parse(res.text).userData;
        token = JSON.parse(res.text).token;
        done();
        console.log(err);
      });
  });

  it("creating product should through 400 not authorized error", (done) => {
    chai
      .request("http://localhost:5000/v1")
      .post("/product/create")
      .set("content-type", "application/json")
      .send({
        p_id: nanoid(),
        p_name: "testproduct",
        p_img: "testproduct.com",
        p_desp: "test",
        price: 100,
        keywords: ["test"],
        date: new Date().toLocaleString(),
        userId: nanoid(),
      })
      .end((err, res) => {
        expect(res.status).to.equal(400);
        done();
      });
  });

  it("Should create a product", (done) => {
    const productDetails = {
      p_id: nanoid(),
      p_name: "testprod",
      p_img: ["test.com"],
      p_desp: "test",
      p_price: 100,
      p_category: ["test"],
      date: new Date().toLocaleString(),
      userId: user._id,
    };
    chai
      .request("http://localhost:5000/v1")
      .post("/product/create")
      .set("content-type", "application/json")
      .set("Authorization", `Bearer ${token}`)
      .send(productDetails)
      .end((err, res) => {
        expect(res.status).to.equal(201);
        expect(JSON.parse(res.text)).to.have.property("p_id");

        done();
      });
  });
});
