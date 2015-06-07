var ferryDriverTracker = angular.module('myDriverApp')

ferryDriverTracker.controller('formController', ['myServices','$scope','$interval', function(myServices,$scope,$interval) {
    
    var	dataObj = {};
        dataObj.routeId = 'A';
    
    myServices.getRoutes().success(function(response){ 
        dataObj.vehicleId = response.vehicleId; 
    }); 
    
    $scope.getLocation = function() {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition($scope.updatedataObj);
      }else { 
        alert("Please enable GPS.");
      }
    }
    
    $scope.sendPosition = function(){
        myServices.updateLocation(dataObj).success(function(response){               
        });
    }
    
    $scope.updatedataObj = function(position){
        dataObj.coords = [position.coords.latitude,position.coords.longitude];                     
    } 

        
    /*
        Every 10 second the position will be updated.
    */
    
    $scope.startInterval = function(){
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
