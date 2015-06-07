var ferryDriverTracker = angular.module('myDriverApp')

ferryDriverTracker.controller('formController', ['myServices','$scope','$interval', function(myServices,$scope,$interval) {
    
    var	dataObj = {};
        
    $scope.data = {
        selectedRoute : null
    };
    
    console.log('vehicle id in local storage '+localStorage.getItem("vehicleId"))
    
    $scope.routes = myServices.routeInformation();
    
    if(localStorage.getItem("vehicleId") == null){
        myServices.getRoutes().success(function(response){ 
            var routes = null;
            
            dataObj.vehicleId = response.vehicleId; 
            console.log(response);

            localStorage.setItem("vehicleId", response.vehicleId);
            localStorage.setItem("routes",routes);
        });
    }else{
        dataObj.vehicleId = localStorage.getItem("vehicleId");
    }
   
    $scope.getLocation = function() {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition($scope.updatedataObj);
      }else { 
        alert("Please enable GPS.");
      }
    }
    
    $scope.sendPosition = function(){
        myServices.updateLocation(dataObj).success(function(response){    
            console.log(response)           
        });
    }
    
    $scope.updatedataObj = function(position){
        dataObj.coords = [position.coords.latitude,position.coords.longitude];                     
    } 

        
    /*
        Every 10 second the position will be updated.
    */
    
    $scope.startInterval = function(){
        console.log('selectedRoute '+$scope.data.selectedRoute);
        dataObj.routeId = $scope.data.selectedRoute;
        console.log(dataObj)
        myServices.timer = $interval( function(){
            $scope.getLocation();
            if (typeof(dataObj.vehicleId) != 'undefined' && typeof(dataObj.coords) != 'undefined'){                
                $scope.getLocation();
                $scope.sendPosition();
            }
        }, 2000);        
    }
    
    $scope.cancelInterval = function(){
        $interval.cancel(myServices.timer)
    }            
    
}]);


// ferryDriverTracker.controller('updatingLocation', ['myServices','$interval','$scope', function(myServices,$interval,$scope) {
  
// }]);
