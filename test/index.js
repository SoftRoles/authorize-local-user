const express = require('express');
const freePort = require("find-free-port")
var app = express();

//=========================================
var mongodb;
var assert = require("assert")
var mongoClient = require("mongodb").MongoClient
var mongodbUrl = "mongodb://127.0.0.1:27017"
mongoClient.connect(mongodbUrl, { poolSize: 10, useNewUrlParser: true }, function (err, client) {
    assert.equal(null, err);
    mongodb = client;
});

//=========================================
// authorization check
//=========================================
const ensureLogin = require("../lib/index").ensureLogin

app.use(require('morgan')('tiny'));
app.use(ensureLogin({ redirectTo: "/403", localUser: true }, function (token, callback) {
    mongodb.db("auth").collection("users").findOne({ token: token }, function (err, user) {
        return callback(user); 
    });
}))

app.get("/", function (req, res) {
    res.send("Hello world!")
})
app.get("/403", function (req, res) {
    res.sendStatus(403)
})

freePort(3000, function (err, port) {
    app.listen(port, function () {
        console.log("Service running on http://127.0.0.1:" + port)
    })
})