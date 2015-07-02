var app = angular.module("deploy");

app.controller('HomeCtrl', function ($scope,$interval,$timeout,$location,Restangular,BTLE,BTData,FormCollar) {

    $scope.m = {
        userList:[],
        cUserIdx: 0,
        eventList :[],
        cEventIdx:0,
        cTime:0,
        addTask:-1,
        pingOn: false,
        tasks: [['f',0],['g',0]]

    };
    $scope.d = BTData;
    $scope.usersBase = Restangular.all('users');
    $scope.eventsBase = Restangular.all('events');
    this.cancelTask;


    $scope.removeTask = function(pos){
        //we need to remove any task that is close to pos, and has the correct user
        var userID = $scope.m.userList[$scope.m.cUserIdx]._id;
        var eIdx = $scope.m.cEventIdx
        console.log(pos)
        $scope.m.eventList[eIdx].taskData = _.filter($scope.m.eventList[eIdx].taskData, function(task){
            if(task.userID != userID){return true;}
            //console.log(task.x,task.y)
            var dist = Math.sqrt(Math.pow(task.x-pos[0],2)+Math.pow(task.y-pos[1],2));
            //console.log('dist'+dist)
            if(dist<.5){
                console.log('removed task')
                return false; 
            }else{
                return true;
            }
            
        });

        
        $scope.m.eventList[eIdx].put().then(function(){console.log('saved')});
        $scope.$broadcast('update', {} );
    }


    $scope.calibPoint = function(pos){
        console.log(pos)
        //first, check if we need to add an icon
        if($scope.m.addTask!=-1){
            var userIndex = $scope.m.tasks[$scope.m.addTask][1];
            var userID = $scope.m.userList[userIndex]._id;
            //console.log($scope.m.userList[userIndex].name)
            $scope.m.eventList[$scope.m.cEventIdx].taskData.push({x:pos[0],y:pos[1],
                icon:$scope.m.tasks[$scope.m.addTask][0],userID:userID});
            $scope.m.eventList[$scope.m.cEventIdx].put().then(function(){console.log('saved')});
            $scope.$broadcast('update', {} );
            $scope.m.addTask=-1;
            $timeout.cancel( this.cancelTask );
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

    $scope.addTask = function(c){
        if($scope.m.addTask!=c){
            $scope.m.addTask= c;
        }else{
            //change the user
            $scope.m.tasks[c][1] = ($scope.m.tasks[c][1]+1)% $scope.m.userList.length;
            //$scope.m.addTask=-1;
        }

        $timeout.cancel( this.cancelTask );
        this.cancelTask = $timeout(function() {
            $scope.m.addTask=-1;
        }, 5000);
        
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

        //BTData.devices = {};
        var location = [];
        FormCollar.ping(4000).then(
            function(devices){
                //console.log('got ping');
                BTData.devices = devices;
                //now, go through the readings and see what has the most error
                var closest;
                var closestErr = 1000000;
                var temp,terr;
                //console.log('here now')
                _.each($scope.m.eventList[$scope.m.cEventIdx].calibData,function(calib){
                    //console.log('checking point')
                    var totalErr = _.reduce(calib.readings,function(err, reading){
                        temp = devices[reading[0]];
                        if(temp==undefined){temp ={rssi:-126};}
                        //console.log('ping:'+temp.rssi)
                        //console.log('calib:'+reading[1])
                        return err +Math.abs(reading[1]-temp.rssi)/Math.abs(temp.rssi)
                    },0);



                    console.log('total error'+totalErr)
                    if(totalErr<closestErr){
                        location = [calib.x,calib.y];
                        closestErr = totalErr;
                        //console.log('new best',location)
                    }
//
                });
                //console.log('ready to save')
                //now, save to the server
                var eventID = $scope.m.eventList[$scope.m.cEventIdx]._id;
                console.log(eventID)
                if(!_.has($scope.m.userList[$scope.m.cUserIdx],'positions')){
                    $scope.m.userList[$scope.m.cUserIdx]['positions'] = {};
                }
                //console.log('here')
                $scope.m.userList[$scope.m.cUserIdx].positions[eventID] = [(new Date()).getTime(),location[0],location[1]];

                console.log(JSON.stringify( $scope.m.userList[$scope.m.cUserIdx]))
                $scope.m.userList[$scope.m.cUserIdx].put().then(function(){
                    //console.log('saved ping')
                });


                $scope.$broadcast('update', {} );
             },function(msg){
                //console.log('failed ping:'+msg);  
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
    }, 4500);


});



/*
mapData : {walls:[
                [[0,0],[0,4.34],[8.21,0],[4.85,0],[0,-3.22],[-4.85,0],[0,3.22]],
                [[0,0],[8.21,0],[6.95,0],[0,2.53],[-.95,0],[0,-1.545],[-6,0]],
                [[15.16,0],[0,-1.755],[4.6,0],[0,2.74],[0,2.88],[-4.6,0],[0,-2.88],[4.6,0]]
            ]
        },
        */