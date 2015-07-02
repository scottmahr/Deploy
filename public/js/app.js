var app = angular.module("deploy", ['ngRoute','restangular']);

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
    RestangularProvider.setBaseUrl('http://deploy.herokuapp.com/api');
    RestangularProvider.setRestangularFields({
      id: "_id"
    });

});

if(hyper == undefined){
    var hyper = {'log':function(x){console.log(x)}};
}else{
    console.log = function(x){hyper.log(x)};
}





Array.prototype.wSlice = function (start, end) {
  start += this.length;
  end+= this.length;
  start = start%this.length;
  end = end%this.length;
  if(isNaN(end)){end=this.length;}
  if(start<=end){return this.slice(start,end);}
  else{return this.slice(start).concat(this.slice(0,end));}
};

Math.log10 = Math.log10 || function(x) {
  return Math.log(x) / Math.LN10;
};

app.filter('tc', function () {
  return function (input) {
    var words = input.split(' ');
    for (var i = 0; i < words.length; i++) {
      words[i] = words[i].charAt(0).toUpperCase() + words[i].slice(1);
    }
    return words.join(' ');
  }
});


app.filter('int', function () {
  return function (input) {
    return parseInt(input);
  }
});


app.directive('longpress', function($timeout) {
  return {
    restrict: 'A',
    link: function($scope, $elm, $attrs) {
      console.log('starting up')
      $elm.bind('touchstart', function(evt) {
        console.log('start')
        // Locally scoped variable that will keep track of the long press
        $scope.longPress = true;
 
        // We'll set a timeout for 600 ms for a long press
        $timeout(function() {
          if ($scope.longPress) {
            // If the touchend event hasn't fired,
            // apply the function given in on the element's on-long-press attribute
            $scope.$apply(function() {
              $scope.$eval($attrs.onLongPress)
            });
          }
        }, 600);
      });//
 
      $elm.bind('touchend', function(evt) {
        console.log('end')
        // Prevent the onLongPress event from firing
        $scope.longPress = false;
        // If there is an on-touch-end function attached to this element, apply it
        if ($attrs.onTouchEnd) {
          $scope.$apply(function() {
            $scope.$eval($attrs.onTouchEnd)
          });
        }
      });
    }
  };
})