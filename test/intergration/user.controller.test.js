const chai = require("chai");
const chaiHttps = require("chai-http");
const server = require("../../index");
let database = [];

chai.should();
chai.use(chaiHttps);

describe("Manage users", () => {
  describe("UC - 201 add users", () => {
    beforeEach((done) => {
      database = [];
      done();
    });

    it("When a required input is missing, a valid error should be returned", (done) => {
      chai
        .request(server)
        .post("/api/user")
        .send({
          email: "timothyborghouts@gmail.com",
          age: 16,
          password: "password123",
        })
        .end((err, res) => {
          res.should.be.an("object");
          let { status, result } = res.body;
          status.should.equals(400);
          result.should.be.a("string").that.equals("Title must be a string");
          done();
        });
    });
  });
});
