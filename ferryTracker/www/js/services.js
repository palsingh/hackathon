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
            "latitude": "28.409955",
            "longitude": "77.060631"
        },
        "17/18": {
            "marker": "brown",
            "latitude": "28.491686",
            "longitude": "77.080698"
        },
        "13": {
            "marker": "red",
            "latitude": "28.491177",
            "longitude": "77.068292"
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

    var developers = [
        {
            "name": "Jaspal Singh",
            "email": "jaspal.singh@nagarro.com",
            "phone": "+91-9953128989"
        },
        {
            "name": "Manish Kumar",
            "email": "manish.kumar05@nagarro.com",
            "phone": "+91-7838626404"
        },
        {
            "name": "Nikhil Pahwa",
            "email": "nikhil.pahwa@nagarro.com",
            "phone": "+91- 8860191605"
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
        developers:  function() {
            return developers;  
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
