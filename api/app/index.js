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
    'A': [[28.5029773, 77.0706075], [28.5013721, 77.0700469], [28.499069, 77.0697146], [28.490055, 77.060631]],
    'B': [[28.5029773, 77.0706075], [28.490055, 77.060631], [28.491177, 77.068292]],
    'C': [[28.5029773, 77.0706075], [28.5013721, 77.0700469], [28.499069, 77.0697146]],
    'D': [[28.5013721, 77.0700469], [28.499069, 77.0697146], [28.491686, 77.080698]],
    'E': [[28.5013721, 77.0700469], [28.499069, 77.0697146], [28.491177, 77.068292]]
};

var offices = ["371", "37/36", "14", "GP-28", "17/18", "13"];

var routes = {
    routes: {
        "A": ["371", "36/37", "14", "GP-28"],
        "B": ["371", "GP-28", "13"],
        "C": ["371", "36/37", "14"],
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
            route[routes.routes[reqData.routeId][index]].office = routes.routes[reqData.routeId][index];
            // if ferry reaches within 50 meters of building,
            // we assume that it reached that building.
            // so based on that reset flags and change direction
            if (distance < 0.02) {
                route[routes.routes[reqData.routeId][index]].reached = 1;
                if (index === 0) {
                    for (var k = 1; k < routes.routes[reqData.routeId].length; k += 1){
                        route[routes.routes[reqData.routeId][k]].reached = 0;
                    }
                    direction = 1;
                } else if (index === (routes.routes[reqData.routeId].length -1)) {
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
        console.log("Result found: ", items.length);
        var result = [];
        items.map(function (item, index) {
            var yetToreach = [];
            var from = item.currentLocation;
            var direction = item.currentDirection;
            var to = [];
            if (direction === 0) {
                for (var i = (ferryRoutes[item.routeId].length -1); i > 0; i -= 1) {
                    if (item.route[routes.routes[item.routeId][i]].reached === 0) {
                        yetToreach.push({
                            vehicleId: item.vehicleId,
                            office: routes.routes[item.routeId][i],
                            coords: ferryRoutes[item.routeId][i]
                        });
                        to.push(ferryRoutes[item.routeId][i]);
                    }
                }
            } else {
                for (var i = 0; i < (ferryRoutes[item.routeId].length); i += 1) {
                    if (item.route[routes.routes[item.routeId][i]].reached === 0) {
                        yetToreach.push({
                            vehicleId: item._id,
                            office: routes.routes[item.routeId][i],
                            coords: ferryRoutes[item.routeId][i]
                        });
                        to.push(ferryRoutes[item.routeId][i]);
                    }
                }
            }

            var toCoords = to.join("|");
            var url = "https://maps.googleapis.com/maps/api/distancematrix/json?origins=" + from + "&destinations=" + toCoords;
            request.get(url, function (err, res1, body) {
                console.log("Got response from web service");
                if (!err) {
                    body = JSON.parse(body);
                    for (var i = 0; i < (yetToreach.length); i += 1) {
                        item.route[yetToreach[i].office].travelTime = body.rows[0].elements[i].duration.text;
                        item.route[yetToreach[i].office].distancePending = body.rows[0].elements[i].distance.text;
                    }
                    FTS.update({_id: item._id}, {
                        route: item.route
                    }, function (err, data) {
                        if (err) {
                            res.send({
                                'status': 'error'
                            });
                        } else {
                            result.push(item);
                            console.log(index, items.length);
                            if (index === (items.length -1)) {
                                res.json(result);
                            }
                        }
                    })
                } else {
                    res.send({
                        'status': 'error'
                    });
                }
                console.log("web service result");
            });
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