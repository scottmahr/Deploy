var app = angular.module("deploy");

app.controller('HomeCtrl', function ($scope,$interval,$timeout,$location,Restangular,BTLE,BTData,FormCollar) {

    $scope.m = {
        userList:[],
        cUserIdx: 0,
        eventList :[],
        cEventIdx:0,
        cTime:0,
        addIcon:'',
        pingOn: false,
    };
    $scope.d = BTData;
    $scope.usersBase = Restangular.all('users');
    $scope.eventsBase = Restangular.all('events');

    $scope.calibPoint = function(pos){
        //first, check if we need to add an icon
        if($scope.m.addIcon!=''){
            $scope.m.eventList[$scope.m.cEventIdx].taskData.push({x:pos[0],y:pos[1],icon:$scope.m.addIcon});
            $scope.m.eventList[$scope.m.cEventIdx].put().then(function(){console.log('saved')});
            $scope.$broadcast('update', {} );
            $scope.m.addIcon='';
            return;
        }

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
                    //now, save it to the event
                    
                    $scope.m.eventList[$scope.m.cEventIdx].calibData.push({x:pos[0],y:pos[1],readings:readings});
                    $scope.m.eventList[$scope.m.cEventIdx].put().then(function(){console.log('saved')});
                    $scope.$broadcast('update', {} );
                }
                
             },function(msg){
                console.log('failed ping:'+msg);  
            }
        );

        

    }

    $scope.loadData = function(){
        
        $scope.userList = $scope.usersBase.getList();
        $scope.userList.then(function(usersResult) {
            //console.log("got users",usersResult)
            $scope.m.userList = usersResult;
            $scope.calcTimes();
            //$scope.$broadcast('update', {} );
            //console.log($scope.m.usersEnt)
           $scope.$broadcast('update', {} );
        });
        $scope.eventList = $scope.eventsBase.getList();
        $scope.eventList.then(function(eventsResult) {
            //console.log("got events",eventsResult)
            $scope.m.eventList = eventsResult;
            //$scope.$broadcast('update', {} );
            //console.log($scope.m.eventList[0].mapData)
            $scope.$broadcast('update', {} );
        });

    }

    $scope.clearTasks = function(){
        $scope.m.eventList[$scope.m.cEventIdx].taskData = [];
        $scope.m.eventList[$scope.m.cEventIdx].put().then(function(){console.log('saved')});
        $scope.$broadcast('update', {} );
        console.log('we are standing now')
        
    }

    $scope.clearCalib = function(){
        $scope.m.eventList[$scope.m.cEventIdx].calibData = [];
        $scope.m.eventList[$scope.m.cEventIdx].put().then(function(){console.log('saved')});
        $scope.$broadcast('update', {} );
        console.log('we are standing now')
        
    }

    $scope.addIcon = function(c){
        if($scope.m.addIcon!=c){
            $scope.m.addIcon= c;
        }else{
            $scope.m.addIcon='';
        }
        
    }

    $scope.startPing = function(){
        if($scope.m.pingOn){
            $scope.m.pingOn= false;
        }else{
            $scope.m.pingOn=true;
        }
        
    }

    $scope.ping = function(){
       if(window.cordova == undefined){
           return;
        }

        BTData.devices = {};
        var location = [];
        FormCollar.ping(2000).then(
            function(devices){
                console.log('got ping');
                BTData.devices = devices;
                //now, go through the readings and see what has the most error
                var closest;
                var closestErr = 1000000;
                var temp;
                console.log('here now')
                _.each($scope.m.eventList[$scope.m.cEventIdx].calibData,function(calib){
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
                        location = [calib.x,calib.y];
                        closestErr = totalErr;
                        console.log('new best',location)
                    }
//
                });
                console.log('ready to save')
                //now, save to the server
                var eventID = $scope.m.eventList[$scope.m.cEventIdx]._id;
                console.log(eventID)
                if(!_.has($scope.m.userList[$scope.m.cUserIdx],'positions')){
                    $scope.m.userList[$scope.m.cUserIdx]['positions'] = {};
                }
                console.log('here')
                $scope.m.userList[$scope.m.cUserIdx].positions[eventID] = [(new Date()).getTime(),location[0],location[1]];

                console.log(JSON.stringify( $scope.m.userList[$scope.m.cUserIdx]))
                $scope.m.userList[$scope.m.cUserIdx].put().then(function(){console.log('saved ping')});


                $scope.$broadcast('update', {} );
             },function(msg){
                console.log('failed ping:'+msg);  
            }
        );
    }



    $scope.changeEvent = function(){
        $scope.m.cEventIdx = ($scope.m.cEventIdx+1)%$scope.m.eventList.length;
        $scope.$broadcast('update', {} );
        //console.log($scope.m.eventList[$scope.m.cEventIdx])
    }
    $scope.changeUser = function(){
        $scope.m.cUserIdx = ($scope.m.cUserIdx+1)%$scope.m.userList.length;
    }



    $scope.loadData();

    $scope.calcTimes = function(){
        if($scope.m.eventList[$scope.m.cEventIdx]==undefined){
            return;
        }
        var event = $scope.m.eventList[$scope.m.cEventIdx];
        _.each($scope.m.userList,function(user){
            //console.log(user.positions[event._id])
            if(_.has(user.positions,event._id)){
                user.lastTime = ($scope.m.cTime  -user.positions[event._id][0])/1000;
            }else{
                user.lastTime = 60000;
            }
        });
    }


    this.heartBeat = $interval(function() {
        $scope.m.cTime = (new Date()).getTime();

        if($scope.m.eventList[$scope.m.cEventIdx]!=undefined){
            $scope.calcTimes();
        }
        
        //console.log($scope.m.userList[0].lastTime)

   }, 1000);

    this.heartBeat2 = $interval(function() {
        $scope.loadData();
        if($scope.m.pingOn){$scope.ping();}
    }, 2500);


});



/*
mapData : {walls:[
                [[0,0],[0,4.34],[8.21,0],[4.85,0],[0,-3.22],[-4.85,0],[0,3.22]],
                [[0,0],[8.21,0],[6.95,0],[0,2.53],[-.95,0],[0,-1.545],[-6,0]],
                [[15.16,0],[0,-1.755],[4.6,0],[0,2.74],[0,2.88],[-4.6,0],[0,-2.88],[4.6,0]]
            ]
        },
        */