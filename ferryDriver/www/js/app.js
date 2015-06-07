// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
var myDriverApp = angular.module('myDriverApp', ['ionic'])

myDriverApp.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
})

myDriverApp.config(function ($stateProvider, $urlRouterProvider) {
  
  $stateProvider
    .state('form', {
      url: "/form",
      templateUrl: "templates/form.html",
      controller: "formController"
   })
   
   .state('startNavigating', {
      url: "/startNavigating",
      templateUrl: "templates/startNavigating.html",
      controller: 'formController'
   });
   
   $urlRouterProvider.otherwise('/form');
   
});
