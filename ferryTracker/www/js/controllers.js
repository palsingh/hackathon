var ferryTracker = angular.module('myapp.controllers', [])

ferryTracker.controller('infoBoxesCtrl', function ($scope) {
    var infoBoxes = [];
    for (var i = 0; i < 4; i++) {
        infoBoxes.push(false);
    }

    $scope.info = {
        boxes: infoBoxes,
        showBox: function (targetIndex) {
            angular.forEach($scope.info.boxes, function (bool, index) {
                if (parseInt(index) === parseInt(targetIndex)) {
                    $scope.info.boxes[index] = !$scope.info.boxes[index];
                } else {
                    $scope.info.boxes[index] = false;
                }
            });
        }
    };
});

ferryTracker.controller('DashCtrl', function ($scope, $interval, Ferry) {
    var $intervalPromise = "",
        selectedBuilding = "";
    
    $scope.data = {
        routes: Ferry.routes(),
        buildings: Ferry.buildings(),
        userBuilding: "",
        loadingFerries: false,
        buildingRoutes: [],
        ferriesOnRoute: []
    };
    
    $scope.data.loadFerries = function() {
        var $promise = Ferry.getFerriesOnRoute(selectedBuilding);
        $promise.then(function (ferriesOnRoute) {
            $scope.data.ferriesOnRoute = ferriesOnRoute;
            $scope.data.buildingRoutes = $scope.data.buildings[selectedBuilding];
            $scope.data.loadingFerries = false;
        }, function (errorMessage) {
            console.log("Error while fetching ferries for the selected building. Error Message:" + errorMessage);
        });
    };

    $scope.selectBuilding = function () {
         // Stop the pending timeout
        $interval.cancel($intervalPromise);
        
        $scope.data.loadingFerries = true;
        selectedBuilding = $scope.data.userBuilding;
        $scope.data.loadFerries(selectedBuilding);
        
        // Load data recursively
        //$intervalPromise = $interval($scope.data.loadFerries, 10000, 0, true);
    };
});

ferryTracker.controller('RoutesCtrl', function ($scope, Ferry) {
    $scope.data = {
        routes: Ferry.routes()
    };
});

ferryTracker.controller('RouteDetailCtrl', function ($scope, $stateParams, $window, Ferry) {
    var routeId = ($stateParams.routeId).toUpperCase(),
        routeArray = Ferry.getRoute(routeId),
        geoPositions = Ferry.geoPositions(),
        staticMapPath = "&path=color:0x0000ff|weight:5",
        staticMapHTML = "https://maps.googleapis.com/maps/api/staticmap?size=" + ($window.innerWidth - 20) + "x" + ($window.innerHeight - 40) + "&scale=1&maptype=roadmap";

    angular.forEach(routeArray, function (building, index) {
        var geoLocation = geoPositions[building];
        staticMapHTML += "&markers=size:mid|color:" + geoLocation.marker + "|label:N|" + geoLocation.latitude + "," + geoLocation.longitude;
        staticMapPath += "|" + geoLocation.latitude + "," + geoLocation.longitude;
    });

    staticMapHTML += staticMapPath;

    $scope.data = {
        selectedRoute: routeId,
        geoPositions: geoPositions,
        staticMapHTML: staticMapHTML
    };
});

ferryTracker.controller('AccountCtrl', function ($scope, Ferry) {
    $scope.data = {
        developers:  Ferry.developers()  
    };
});
