var ferryTracker = angular.module('myapp.controllers', [])

ferryTracker.controller('DashCtrl', function ($scope, Ferry) {
    $scope.data = {
        routes: Ferry.routes(),
        buildings: Ferry.buildings(),
        userBuilding: "",
        buildingRoutes: []
    };

    $scope.selectBuilding = function () {
        $scope.data.buildingRoutes = $scope.data.buildings[$scope.data.userBuilding];
        console.log($scope.data.buildingRoutes);
    };
});

ferryTracker.controller('RoutesCtrl', function ($scope, Ferry) {
    // With the new view caching in Ionic, Controllers are only called
    // when they are recreated or on app start, instead of every page change.
    // To listen for when this page is active (for example, to refresh data),
    // listen for the $ionicView.enter event:
    //
    //$scope.$on('$ionicView.enter', function(e) {
    //});
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
    console.log(staticMapHTML);

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
