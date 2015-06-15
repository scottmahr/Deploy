var app = angular.module("deploy");

app.controller('HomeCtrl', function ($scope,$interval,$timeout,$location,Restangular,BTLE,BTData,FormCollar) {

    $scope.m = {
        userList:[
            {name:"Scott",icon:"oldman",standingIcon:"oldman",lastTime:'40'},
            {name:"Jacob",icon:"oldman",standingIcon:"oldman",lastTime:'15'},
            {name:"Sally",icon:"woman",standingIcon:"woman",lastTime:'5'},
            ],
        cUserIdx: 0,
        mapData : {walls:[
                [[0,0],[0,4.34],[8.21,0],[4.85,0],[0,-3.22],[-4.85,0],[0,3.22]],
                [[0,0],[8.21,0],[6.95,0],[0,2.53],[-.95,0],[0,-1.545],[-6,0]],
                [[15.16,0],[0,-1.755],[4.6,0],[0,2.74],[0,2.88],[-4.6,0],[0,-2.88],[4.6,0]]
            ]
        },
        calibData : [],  //{x,y,readings:[mac,rssi]}
        location: [],
    };
    $scope.d = BTData;

    $scope.usersBase = Restangular.all('users');

    $scope.calibPoint = function(pos){
        console.log('calibrate',pos);
        BTData.devices = {};
        
        
        FormCollar.ping(4000).then(
            function(devices){
                console.log('got devices');
                BTData.devices = devices;
                var readings = _.map(devices,function(device,mac){
                    return [mac,device.rssi]
                });
                if(readings.length > 1){
                    $scope.m.calibData.push({x:pos[0],y:pos[1],readings:readings});

                }
                console.log(JSON.stringify($scope.m.calibData));
                $scope.$broadcast('update', {} );
             },function(msg){
                console.log('failed ping:'+msg);  
            }
        );

        

    }

    $scope.loadData = function(){
        
        $scope.userList = $scope.usersBase.getList();
        $scope.userList.then(function(usersResult) {
            console.log("got data")
            $scope.m.userList = usersResult;
            //$scope.$broadcast('update', {} );
            //console.log($scope.m.usersEnt)
        });

    }

    $scope.clearEvent = function(){
        console.log('we are standing now')
        
    }

    $scope.ping = function(){
        BTData.devices = {};
        $scope.m.location = [];
        FormCollar.ping(2000).then(
            function(devices){
                console.log('got ping');
                BTData.devices = devices;
                //now, go through the readings and see what has the most error
                var closest = undefined;
                var closestErr = 1000000;
                var temp;
                _.each($scope.m.calibData,function(calib){
                    console.log('checking point')
                    var totalErr = _.reduce(calib.readings,function(err, reading){
                        temp = devices[reading[0]];
                        if(temp==undefined){temp ={rssi:-126};}
                        console.log('ping:'+temp.rssi)
                        console.log('calib:'+reading[1])
                        return err +Math.abs(reading[1]-temp.rssi)
                    },0);
                    console.log('total error'+totalErr)
                    if(totalErr<closestErr){
                        $scope.m.location = [calib.x,calib.y];
                        closestErr = totalErr;
                        console.log('new best',$scope.m.location)
                    }
//
                });


                $scope.$broadcast('update', {} );
             },function(msg){
                console.log('failed ping:'+msg);  
            }
        );
    }



    $scope.changeEvent = function(){
        
    }

    $scope.save = function(){
        $scope.m.usersEnt.put().then(function(){console.log('saved')});
    }


    //$scope.loadData();

    $scope.$on('newPosition', function (event, data) {
        if(data.fallen){
            $scope.m.userList[$scope.m.cUserIdx].icon = "falling";
        }else{
            $scope.m.userList[$scope.m.cUserIdx].icon = $scope.m.userList[$scope.m.cUserIdx].standingIcon;
        }
        $scope.m.userList[$scope.m.cUserIdx].lastDataTime = (new Date()).getTime();

        $scope.m.userList[$scope.m.cUserIdx].put().then(function(){console.log('saved')});

    });


    //this.heartBeat = $interval(function() {
   //     $scope.m.cTime = (new Date()).getTime();

   //}, 500);

    //this.heartBeat2 = $interval(function() {
     //   $scope.loadData();

   //}, 2000);


});