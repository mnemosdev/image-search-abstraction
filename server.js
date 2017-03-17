"use strict";

var express = require("express");
var routes = require("./api/routes");
var app = express();

routes(app);




app.listen(process.env.PORT || 3000, function(){
    console.log("listening");
});