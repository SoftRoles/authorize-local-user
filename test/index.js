const express = require('express');
const freePort = require("find-free-port")
var app = express();

//=========================================
// authorization check
//=========================================
const authorizeLocalUser = require("../lib/index")

app.use(require('morgan')('tiny'));
app.use(authorizeLocalUser())
app.use(authorizeLocalUser(null))
app.use(authorizeLocalUser({ username: 'localUser' }))

app.get("/user", function (req, res) {
    res.send(req.user)
})

freePort(3000, function (err, port) {
    app.listen(port, function () {
        console.log("Service running on http://127.0.0.1:" + port)
    })
})