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

// Allow cross domain request
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

// building locations with route
var ferryRoutes = {
    //'A': [[28.5029773, 77.0706075], [28.5013721, 77.0700469], [28.499069, 77.0697146], [28.490055, 77.060631]]
    'A': [[28.503472199999997, 77.0709068], [28.5033025, 77.0708763], [28.503333599999998, 77.07087920000001]]
};

var offices = ["371", "37-36", "14", "GP-28", "17-18", "13"];

var routes = {
    routes: {
        //"A": ["371", "36/37", "14", "GP-28"],
        "A": ["371", "36/37", "14"],
        "B": ["371", "GP-28", "13"],
        "C": ["371", "14", "36/37"],
        "D": ["36/37", "14", "17/18"],
        "E": ["36/37", "14", "13"]
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
        "routeId": String,
        "currentLocation": Array,
        "currentDirection": Number,
        "isRunning": Boolean,
        "route": Object
    });
    FTS = mongoose.model("fts", FTSSchema);
}

process.on("exit", function(){
    console.log("Closing MongoDB connection");
    db.close();
});
initMongoDB();

/************************* Database Connection ***********************/
// API Driver App
var direction = 0;
app.get('/getRoutes/:vehicleId?', function (req, res) {
    var vehicleId = req.params.vehicleId;
    if (!vehicleId) {
        new FTS({
            "routeId": "",
            "currentLocation": [],
            "currentDirection": 0,
            "isRunning": false,
            "route": {}
        }).save(function (err, data) {
            routes.vehicleId = data._id;
            res.json(routes);
        });
    } else {
        routes.vehicleId = vehicleId;
        res.json(routes);
    }
});

app.post('/updateLocation/', function (req, res) {
    var reqData = {
        routeId: req.body.routeId,
        vehicleId: req.body.vehicleId,
        coords: req.body.coords
    };
    var result = [];
    var buildingsOnRoute = ferryRoutes[reqData.routeId];
    var resetOthers = false;

    if (typeof reqData.coords === "string") {
        reqData.coords = JSON.parse(reqData.coords);
    }
    var route = "";
    FTS.findById(reqData.vehicleId, function (err, record) {
        if (!record.route) {
            console.log("Route doesn't exist");
            route = createRouteObject(reqData.routeId);
        } else {
            console.log("Route exist");
            route = record.route;
        }
        buildingsOnRoute.map(function (val, index) {
            var distance = calculateDistance(reqData.coords[0], reqData.coords[1], val[0], val[1], "K");
            route[routes.routes[reqData.routeId][index]].office = routes.routes.A[index];
            // if ferry reaches within 50 meters of building,
            // we assume that it reached that building.
            // so based on that reset flags and change direction
            if (distance < 0.02) {
                route[routes.routes[reqData.routeId][index]].reached = 1;
                if (index === 0) {
                    console.log("This is first stop");
                    for (var k = 1; k < routes.routes[reqData.routeId].length; k += 1){
                        route[routes.routes[reqData.routeId][k]].reached = 0;
                    }
                    direction = 1;
                } else if (index === (routes.routes[reqData.routeId].length -1)) {
                    console.log("This is last stop ", routes.routes.A[index]);
                    direction = 0;
                    // reset previous `reached` flag
                    for (var j = 0; j <= index; j += 1) {
                        route[routes.routes[reqData.routeId][j]].reached = 0;
                    }
                    route[routes.routes[reqData.routeId][index]].reached = 1;
                }
            }
        });
        // update info in the db
        FTS.update({_id: reqData.vehicleId}, {
            "currentLocation": reqData.coords,
            "currentDirection": direction,
            "routeId": reqData.routeId,
            "route": route
        }, function (err, data) {
            if (err) {
                res.json({
                    "vehicleId": reqData.vehicleId,
                    "status": "error",
                    "error": err
                });
            } else {
                res.json({
                    "vehicleId": reqData.vehicleId,
                    "status": "ok"
                });
            }
        });
    });


    // get direction from db for vehicle
    /*FTS.findById(reqData.vehicleId, function (err, data) {
        var direction = data.currentDirection;
        var from = reqData.coords[0]+","+reqData.coords[1];
        var to = "";

        if (direction === 1) {
            to = routes.routes[reqData.routeId][routes.routes[reqData.routeId].length -1]
        } else {
            to = routes.routes[reqData.routeId][0];
        }

        var toCoords = ferryRoutes[reqData.routeId][to];

        // make web service call to google maps distance matrix
        var url = "https://maps.googleapis.com/maps/api/distancematrix/json?origins=" + from + "&destinations=" + toCoords[0]+","+toCoords[1];
        request.get(url,
            function (err, res1, body) {
            if (!err) {
                var result = {}
                res.json(body);
            } else {
                res.send({
                    'status': 'error'
                });
            }
        });
        *//*FTS.update({'_id': data.vehicleId}, {

        })*//*
    });*/
});

// API User App
app.get('/getOffices/', function (req, res) {
    res.json(offices);
});
app.post('/getLocation/', function (req, res) {
    console.log("Getting Location");
    var office = req.body.office;
    var query = {};
    // find available routes
    query['route.' + office] = {$exists: true};
    FTS.find(query, function(err, items) {
        var from = items.currentLocation;
        var to = "";
        if (direction === 0) {
            to = routes.routes[reqData.routeId][routes.routes[reqData.routeId].length -1]
        } else {
            to = routes.routes[reqData.routeId][0];
        }
        var toCoords = ferryRoutes[reqData.routeId][to];
        var url = "https://maps.googleapis.com/maps/api/distancematrix/json?origins=" + from + "&destinations=" + toCoords[0]+","+toCoords[1];
        request.get(url, function (err, res1, body) {
            if (!err) {
                var result = {};
                res.json(body);
            } else {
                res.send({
                    'status': 'error'
                });
            }
        });
    });
});

//:::  Passed to function:                                                    :::
//:::    lat1, lon1 = Latitude and Longitude of point 1 (in decimal degrees)  :::
//:::    lat2, lon2 = Latitude and Longitude of point 2 (in decimal degrees)  :::
//:::    unit = the unit you desire for results                               :::
//:::           where: 'M' is statute miles (default)                         :::
//:::                  'K' is kilometers                                      :::
//:::                  'N' is nautical miles
function calculateDistance (lat1, lon1, lat2, lon2, unit) {
        var radlat1 = Math.PI * lat1/180;
        var radlat2 = Math.PI * lat2/180;
        var radlon1 = Math.PI * lon1/180;
        var radlon2 = Math.PI * lon2/180;
        var theta = lon1-lon2;
        var radtheta = Math.PI * theta/180;
        var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);;
        dist = Math.acos(dist);
        dist = dist * 180/Math.PI;
        dist = dist * 60 * 1.1515;
        if (unit=="K") { dist = dist * 1.609344 }
        if (unit=="N") { dist = dist * 0.8684 }
        return dist;
}

function createRouteObject (routeId) {
    var offices = routes.routes[routeId];
    var result = {};
    for (var i = 0; i < offices.length; i += 1) {
        result[offices[i]] = {
            reached: 0,
            distancePending: '',
            travelTime: '',
            isDeparted: false,
            office: ''
        }
    }
    return result;
}

// listen (start app with node server.js) ======================================
app.listen(5000, "0.0.0.0");
console.log("App listening on port 5000");