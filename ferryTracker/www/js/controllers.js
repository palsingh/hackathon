var ferryTracker = angular.module('myapp.controllers', [])

ferryTracker.controller('DashCtrl', function ($scope, Ferry) {

    var infoBoxes = [];
    for (var i = 0; i < 4; i++) {
        infoBoxes.push(false);
    }

    $scope.data = {
        routes: Ferry.routes(),
        buildings: Ferry.buildings(),
        userBuilding: "",
        buildingRoutes: [],
        ferriesOnRoute: [],
        infoBoxes: infoBoxes,
        showInfoBox: function (targetIndex) {
            angular.forEach($scope.data.infoBoxes, function (bool, index) {
                console.log(typeof (targetIndex));
                console.log(typeof (index));
                if (parseInt(index) === parseInt(targetIndex)) {
                    $scope.data.infoBoxes[index] = !$scope.data.infoBoxes[index];
                } else {
                    $scope.data.infoBoxes[index] = false;
                }
            });
        }
    };

    $scope.selectBuilding = function () {
        var selectedBuilding = $scope.data.userBuilding;
        $scope.data.buildingRoutes = $scope.data.buildings[selectedBuilding];

        var $promise = Ferry.getFerriesOnRoute(selectedBuilding);
        $promise.then(function (ferriesOnRoute) {
            $scope.data.ferriesOnRoute = ferriesOnRoute;
        }, function (errorMessage) {
            console.log("Error while fetching ferries for the selected building. Error Message:" + errorMessage);
        });
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

ferryTracker.controller('AccountCtrl', function ($scope) {
    $scope.settings = {
        enableFriends: true
    };
});
