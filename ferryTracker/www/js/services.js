var myAppServices = angular.module('myapp.services', [])

myAppServices.factory('Ferry', function ($q, $http) {

    var geoPositions = {
        "371": {
            "marker": "orange",
            "latitude": "28.5029773",
            "longitude": "77.0706075"
        },
        "36/37": {
            "marker": "green",
            "latitude": "28.5013721",
            "longitude": "77.0700469"
        },
        "14": {
            "marker": "purple",
            "latitude": "28.499069",
            "longitude": "77.0697146"
        },
        "GP-28": {
            "marker": "blue",
            "latitude": "28.5029773",
            "longitude": "77.0706075"
        },
        "17/18": {
            "marker": "brown",
            "latitude": "28.5013721",
            "longitude": "77.0700469"
        },
        "13": {
            "marker": "red",
            "latitude": "28.499069",
            "longitude": "77.0697146"
        }
    };

    var routes = {
        "A": {
            "frequency": "Every 1 hour",
            "buildings": ["371", "36/37", "14", "GP-28"]
        },
        "B": {
            "frequency": "Every 1 hour",
            "buildings": ["371", "GP-28", "13"]
        },
        "C": {
            "frequency": "Every 1 hour",
            "buildings": ["371", "36/37", "14"]
        },
        "D": {
            "frequency": "Every 1 hour",
            "buildings": ["36/37", "14", "17/18"]
        },
        "E": {
            "frequency": "Every 1 hour",
            "buildings": ["36/37", "14", "13"]
        }
    };

    var buildings = {
        "371": ["A", "B", "C"],
        "36/37": ["A", "C", "D", "E"],
        "14": ["A", "C", "D", "E"],
        "GP-28": ["A", "B"],
        "17/18": ["D"],
        "13": ["B", "E"]
    };

    var ferries = [
        {
            "_id": "55735d983dd925782082f482",
            "routeId": "A",
            "currentDirection": 0,
            "isRunning": false,
            "currentLocation": [
                28.5034721999999970,
                77.0709068000000030
            ],
            "__v": 0,
            "route": {
                "371": {
                    "office": "371",
                    "isDeparted": false,
                    "travelTime": "",
                    "distancePending": "",
                    "reached": 0
                },
                "36/37": {
                    "office": "36/37",
                    "isDeparted": false,
                    "travelTime": "",
                    "distancePending": "",
                    "reached": 0
                },
                "14": {
                    "office": "14",
                    "isDeparted": false,
                    "travelTime": "",
                    "distancePending": "",
                    "reached": 1
                },
                "GP-28": {
                    "office": "GP-28",
                    "isDeparted": false,
                    "travelTime": "",
                    "distancePending": "",
                    "reached": 0
                }
            }
        },
        {
            "_id": "55735d983dd925782082f482",
            "routeId": "B",
            "currentDirection": 0,
            "isRunning": false,
            "currentLocation": [
                28.5034721999999970,
                77.0709068000000030
            ],
            "__v": 0,
            "route": {
                "14": {
                    "office": "14",
                    "isDeparted": false,
                    "travelTime": "",
                    "distancePending": "",
                    "reached": 1
                },
                "371": {
                    "office": "371",
                    "isDeparted": false,
                    "travelTime": "",
                    "distancePending": "",
                    "reached": 0
                },
                "36/37": {
                    "office": "36/37",
                    "isDeparted": false,
                    "travelTime": "",
                    "distancePending": "",
                    "reached": 0
                }
            }
        }
    ];

    var serverURL = "http://10.175.174.150:5000/";
    return {
        routes: function () {
            return routes;
        },
        getRoute: function (routeId) {
            return routes[routeId].buildings;
        },
        geoPositions: function () {
            return geoPositions;
        },
        getGeoPosition: function (buildingId) {
            return geoPositions[buildingId];
        },
        buildings: function () {
            return buildings;
        },
        getFerriesOnRoute: function (buildingId) {
            var deferred = $q.defer();
            $http.post(serverURL + "getLocation/", {"office":buildingId}).success(function (response) {
                deferred.resolve(response);
            }).error(function (msg, code) {
                deferred.reject(msg);
            });
            return deferred.promise;
        }
    };
});
