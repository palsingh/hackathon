angular.module('myDriverApp').factory('myServices', ['$http', function httpService($http){
	
	var requestUrl = 'http://10.175.174.150:5000/';
	var routeId = null,
		timer = null;
	
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
		getRoutes: function(){
			return $http.get(requestUrl + 'getRoutes/');
		},
		updateLocation: function(dataObj) {
			console.log(dataObj)
			return $http.post(requestUrl + 'updateLocation/', dataObj);
		},
        routeInformation: function() {
            return routes;
        }
	}
	
}]);
