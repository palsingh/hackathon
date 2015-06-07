var myAppServices = angular.module('myapp.services', [])

myAppServices.factory('Ferry', function () {
    // Might use a resource here that returns a JSON array

    var geoPositions = {
        "371": {
            "longitude": "x",
            "latitude": "y"
        },
        "36/37": {
            "longitude": "x",
            "latitude": "y"
        },
        "14": {
            "longitude": "x",
            "latitude": "y"
        },
        "GP-28": {
            "longitude": "x",
            "latitude": "y"
        }
    };
    
    var routes = {
        "A": {
            "371": {
                "longitude": "x",
                "latitude": "y"
            },
            "36/37": {
                "longitude": "x",
                "latitude": "y"
            },
            "14": {
                "longitude": "x",
                "latitude": "y"
            },
            "GP-28": {
                "longitude": "x",
                "latitude": "y"
            }
        },
        "B": {
            "371": {

            },
            "GP-28": {

            },
            "13": {

            }
        },
        "C": {
            "371": {

            },
            "14": {

            },
            "36/37": {

            }
        },
        "D": {
            "36/37": {

            },
            "14": {

            },
            "17/18": {

            }
        },
        "E": {
            "36/37": {

            },
            "14": {

            },
            "13": {

            }
        }
    };

    return {
        routes: function () {
            return routes;
        },
        getRoute: function (routeId) {
            return routes[routeId];
        }
    };
});
