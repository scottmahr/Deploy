//This is for all the configuration we need
var app = angular.module("deploy");




app.service('BTLE', function($q,$timeout,FormCollar,Globals,BTData) {

    this.accelmag = 0.1;
    this.count = 0;
    this.testing = 'btle';
    var testing = 'btlevar';
    var self = this;



    this.ping = function(){
        FormCollar.ping().then(
            function(devices){
                console.log('got devices');
                BTData.devices = devices;
             },function(msg){
                console.log('failed ping:'+msg);  
            }
        );
    }


    this.initFormCollar = function(){
        //resetting status flags
        //FormState.connectedToCollar = false;
        //FormState.foundCollar=false;
        //FormState.collarMac = "";


        var self = this;
        //Finding the closest collar
        FormCollar.connectToClosestDevice().then(
        function(msg) {
            console.log('discover succeeded:'+msg);
            //FormState.foundCollar=true;
            //Connecting to the collar
            FormCollar.connectToDevice().then(
                function(response) {
                    //FormState.connectedToCollar = true;
                    //FormState.collarMac = response.mac;
                    console.log('connect succeeded:'+response.mac);
                    BTData.mac = response.mac;
                    //Reading services
                    FormCollar.readServices().then(
                        function(services) {

                            $timeout(function(){
                                self.resetTouch();
                            },900);
                            $timeout(function(){
                                FormCollar.sensorOn(
                                    Globals.STATUS_DATA,
                                    Globals.STATUS_NOTIFICATION,
                                    self.statusHandler
                                );
                            },600);
                            //Turning on the accelerometer
                            FormCollar.sensorOn(
                                Globals.ACCELEROMETER_DATA,
                                Globals.ACCELEROMETER_NOTIFICATION,
                                self.accelHandler
                            ).then(
                                function(msg){
                                    console.log('starting to stream');
                                    //start data streaming
                                    FormCollar.sendCommand(2,[1, 0, 1, 0]);
                                },function(msg){
                                    console.log(msg);
                                }
                            );
                        }, function(msg){
                            console.log('could not read services: '+msg);
                        }
                    );
                }, function(msg){
                    console.log('failed connect: '+msg);
                }
            );
        }, function(msg){
            console.log('failed discover:'+msg);
            
        });//


    }

    this.resetTouch = function(){
        FormCollar.sendCommand(4,[0, 8, 3, 3,0,0,0]); 
    }


    this.setLED = function(r,g,b){
        console.log('led stuff')
        //FormCollar.setLED();

        FormCollar.setLED(r,g,b);
    }

    this.setDataStream = function(accel, aFilt, elev, eFilt){
        FormCollar.sendCommand(2, [accel, aFilt, elev, eFilt]);
    }

    this.zeroElevation = function(){
        FormCollar.sendCommand(1, []);
        //FormState.elevOffset = 0;
    }

    this.accelHandler = function(data){
        //console.log("data"+data.length)//
        // Calculate the x,y,z accelerometer values from raw data.
        //console.log(data.length)
        BTData.lastDataTime = (new Date()).getTime();

        BTData.rawData(_.slice(data,0,2),false);
        BTData.rawData(_.slice(data,2,4),false);
        BTData.rawData(_.slice(data,4,6),false);
        BTData.rawData(_.slice(data,6,8),false);
        BTData.rawData(_.slice(data,8,9));
    }

    this.batteryHandler = function(data){
        console.log('battery'+JSON.stringify(data))
        //FormState.setBattery(data[0]);
    }
    this.statusHandler = function(data){
        console.log('status'+JSON.stringify(data))
        if(data[0]==5){
            //FormState.liftProgress = 0;
            $timeout(function(){
                console.log('zeroing elevation');
                self.zeroElevation();
            },500)
            $timeout(function(){
                //FormState.captureData = true;
            },1000)
        }else if(data[0]==0){
            //FormState.captureData = false;
            //FormState.liftProgress = 0;
        }
        //FormState.setBattery(data[0]);//
    }
//

});





