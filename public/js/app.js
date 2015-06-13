var app = angular.module("swish", ['ngRoute','restangular']);

app.config(function(RestangularProvider,$routeProvider,$provide) {
   

    $routeProvider.
      when('/home', {
        templateUrl: 'html/home.html',
        controller: 'HomeCtrl'
      }).
      otherwise({
        redirectTo: '/home'
      });

    //RestangularProvider.setBaseUrl('http://localhost:5000/api');
    RestangularProvider.setBaseUrl('http://swishmetrics.herokuapp.com/api');
    RestangularProvider.setRestangularFields({
      id: "_id"
    });

});







