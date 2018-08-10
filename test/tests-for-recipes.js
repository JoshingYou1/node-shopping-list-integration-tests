const chai = require("chai");
const chaiHttp = require("chai-http");

const {app, closeServer, runServer} = require("../server");

const expect = chai.expect;

chai.use(chaiHttp);

describe("Recipes", function() {
    before(function() {
        return runServer();
    });

    after(function() {
        return closeServer();
    });

    it("Should display recipes on GET requests", function() {
        return chai
            .request(app)
            .get("/recipes")
            .then(function(res) {
                expect(res).to.have.status(200);
                expect(res).to.be.json;
                expect(res.body).to.be.a("array");
                expect(res.body.length).to.be.at.least(1);

                const expectedKeys = ["name", "ingredients", "id"];
                res.body.forEach(function(item) {
                    expect(item).to.be.a("object");
                    expect(item).to.include.keys(expectedKeys);
                });
            });
    });


    it("Should add recipes on POST requests", function() {
        const newRecipe = {name: "ham and cheese omelet", ingredients: ["1 cup diced ham, 1/2 cup cheddar cheese, 3 whole eggs"]}
        return chai
            .request(app)
            .post("/recipes")
            .send(newRecipe)
            .then(function(res) {
                expect(res).to.have.status(201);
                expect(res).to.be.json;
                expect(res.body).to.be.a("object");
                expect(res.body).to.include.keys("name", "ingredients", "id");
                expect(res.body.name).to.equal(newRecipe.name);
                expect(res.body.ingredients).to.be.a("array");
                expect(res.body.ingredients).to.include.members(newRecipe.ingredients);
            });
    });

    it("Should update recipes on PUT requests", function() {
        const updateData = {
            name: "chicken fried rice",
            ingredients: [
                "3 cups white rice",
                "1/2 cup diced carrots",
                "1/2 cup shelled peas",
                "1 whole chicken breast",
                "3/4 cup soy sauce"
            ]
        };
        return chai
            .request(app)
            .get("/recipes")
            .then(function(res) {
                updateData.id = res.body[0].id;

                return chai
                    .request(app)
                    .put(`/recipes/${updateData.id}`)
                    .send(updateData);
            })

            .then(function(res) {
                expect(res).to.have.status(204);
            })
    });

    it("Should delete recipes on DELETE requests", function() {
        return (chai
            .request(app)
            .get("/recipes")
            .then(function(res) {
                return chai.request(app).delete(`/recipes/${res.body[0].id}`)
            })
            .then(function(res) {
                expect(res).to.have.status(204);
            })
        );
    });
});

