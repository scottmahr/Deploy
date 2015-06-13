var app = angular.module("swish");

app.controller('HomeCtrl', function ($scope,$interval,$timeout,$location,Restangular) {

    $scope.m = {
        shotsEnt:{shots:[]}
    };

    $scope.shotsBase = Restangular.all('shots');

    

    $scope.loadData = function(){
        
        $scope.shotsList = $scope.shotsBase.getList();
        $scope.shotsList.then(function(shotsResult) {
            //console.log(JSON.stringify(shotsResult))
            $scope.m.shotsEnt = shotsResult[0];
            $scope.$broadcast('update', {} );
            //console.log($scope.m.shotsEnt)
        });

    }

    $scope.shoot = function(){
        $scope.m.shotsEnt.shots.push([Math.random()*100,Math.random()*50,true ? Math.random()<.75 : false])
        $scope.$broadcast('update', {} );
        $scope.save();
    }

    $scope.clear = function(){
        $scope.m.shotsEnt.shots = [];
        $scope.$broadcast('update', {} );
        $scope.save()

    }

    $scope.auto = function(){
        $scope.loadData();
    }

    $scope.save = function(){
        $scope.m.shotsEnt.put().then(function(){console.log('saved')});
    }


    $scope.loadData();


    this.heartBeat = $interval(function() {
        $scope.loadData();
    }, 1000);


});