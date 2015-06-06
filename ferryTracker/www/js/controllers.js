var ferryTracker = angular.module('myapp.controllers', [])

ferryTracker.controller('DashCtrl', function ($scope) {
  $scope.data = {
    buildings: {
      "371": ["A", "B", "C"],
      "36/37": ["A", "C", "D", "E"],
      "14": ["A", "C", "D", "E"],
      "GP-28": ["A", "B"],
      "17/18": ["D"],
      "13": ["B", "E"]
    },
    routes: {
      "A": ["371", "36/37", "14", "GP-28"],
      "B": ["371", "GP-28", "13"],
      "C": ["371", "14", "36/37"],
      "D": ["36/37", "14", "17/18"],
      "E": ["36/37", "14", "13"]
    }
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

ferryTracker.controller('RouteDetailCtrl', function ($scope, $stateParams, Ferry) { 
  $scope.data = {
    routeId: ($stateParams.routeId).toUpperCase(),
    routeInfo: Ferry.getRoute($stateParams.chatId)
  };
});

ferryTracker.controller('AccountCtrl', function ($scope) {
  $scope.settings = {
    enableFriends: true
  };
});
