//This file have all the information about lifts in it

var app = angular.module("form");




app.factory('Lift', function() {
    return function(data) {
        this.initialize = function(data){
            this.cDate = null;             //date lift was created
            this.ID = null;                //ID from database
            this.lifterID = null;          //id of lifter from database
            this.hardwareVer = null;       //version of hardware
            this.collarMac = null;         //MAC of collar to collect lift
            this.liftType = null;          //int of liftTypeID
            this.subLiftType = null;       //int of subliftindex
            this.weight = null;            //weight in lbs
            this.score = null;             // int of score
            this.notes = null;             //notes
            this.videoURL= null;          //url of where video is stored
            this.altitude = [];     //msec,value
            this.acceleration = []; //msec,mag,x,y,z
            this.kalman = [];       //msec,accel,vel,pos
            this.dmpData = [];      //msec,zaccel,orientation
            this.metrics = {};      //object of all metrics

            if(data!=undefined){this.loadData(data);}
        };
        this.loadData = function(data){
            var properties = ['cDate','ID','lifterID','liftName','hardwareVer',
                        'collarMac','liftType','subLiftType','weight','score',
                        'notes','videoURL','altitude','acceleration','kalman',
                        'dmpData','metrics'];

            _.each(properties,function(p){
                if(data[p]!=undefined){
                    this[p] = data[p];
                }
            },this);
        };

        this.initialize(data);
      };
});




