const express = require('express');
const freePort = require("find-free-port")
var app = express();

//=========================================
// authorization check
//=========================================
const ensureLogin = require("../lib/index").ensureLogin

app.use(require('morgan')('tiny'));
app.use(ensureLogin({redirectTo:"/403"}))

app.get("/", function(req,res){
    res.send("HeLlo world!")
})
app.get("/403", function(req,res){
    res.sendStatus(403)
})

freePort(3000, function(err, port){
    app.listen(port, function() {
        console.log("Service running on http://127.0.0.1:",port)
    })
})
