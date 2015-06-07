var express = require("express");
var request = require("request");
var bodyParser = require("body-parser");
var mongoose = require('mongoose');

var app = express();

// Middleware
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({
    'extended': 'true'
}));
app.use(bodyParser.json()); // parse application/json
// parse application/vnd.api+json as json
app.use(bodyParser.json({
    type: 'application/vnd.api+json'
}));

// building locations with route
var ferryRoutes = {
    '1': {
        '371': [28.5029773, 77.0706075],
        '36': [28.5013721, 77.0700469],
        '37': [28.5013721, 77.0700469],
        '14': [28.499069, 77.0697146]
    }
};
/************************* Database Connection ***********************/
function initMongoDB(){
    var db = mongoose.connection;
    db.on("error", function(){
        console.log("Error opening the MongoDB connection");
    });

    db.on("open", function(){
        console.log("Connected to MongoDB server");
        initSchema();
    });

    mongoose.connect("mongodb://localhost/FTS")
}

var FTS;
function initSchema(){
    var FTSSchema = new mongoose.Schema({
        "routeId" : String,
        "currentLocation" : Array,
        "currentDirection" : Number,
        "isRunning" : Boolean
    });
    FTS = mongoose.model("FTS", FTSSchema);
}

process.on("exit", function(){
    console.log("Closing MongoDB connection");
    db.close();
});
initMongoDB();

/************************* Database Connection ***********************/
// API
app.get('/getRoutes/', function (req, res) {
    FTS.find({}, function (err, routes) {
        if (err) {
            console.log("Some error");
            return;
        }
        res.json(routes);
    });
});

app.post('/location/', function (req, res) {

});

// listen (start app with node server.js) ======================================
app.listen(5000);
console.log("App listening on port 5000");