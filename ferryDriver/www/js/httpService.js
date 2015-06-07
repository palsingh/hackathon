angular.module('myDriverApp').factory('myServices', ['$http', function httpService($http){
	
	var requestUrl = 'http://10.175.174.150:5000/';
	var routeId = null,
		timer = null;
		
	return {
		getRoutes: function(){
			return $http.get(requestUrl + 'getRoutes/');
		},
		updateLocation: function(dataObj) {
			return $http.post(requestUrl + 'updateLocation/', dataObj);
		}
	}
	
}]);
