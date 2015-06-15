//This is for all the configuration we need
var app = angular.module("deploy");




app.service('BTData', function($rootScope,$timeout,Globals) {
    
    this.altitude = 0;

    this.fallDistance = -.75;
    this.lastDataTime = 0;

    this.height = .1;
    this.velocity = 0;
    this.accelCount = 0;
    this.accelRaw = _.range(0,1600,0);  //x,y,z,mag
    this.elevCount = 0;
    this.elevOffset = 0;
    this.elevRaw = _.range(0,400,0);  //x,y,z,mag

    this.isFallen = false;

    this.mac = 'not connected';

    var self = this;



  this.loadData = function(){
    this.shotsBase = Restangular.all('shots');
    this.shotsList = this.shotsBase.getList();
    this.shotsList.then(function(shotsResult) {
        //console.log(JSON.stringify(shotsResult))
        self.shots = shotsResult[0];
        console.log(self.shots)

    });

  }



    this.updateReviews = function(reviews){
        if(reviews==undefined){
            reviews = this.reviewList;
        }
        $rootScope.$broadcast('updateReviews',{dates:this.settings.gOptions.dates});
    }


    this.rawData = function(data,update){
        this.lastDataTime = (new Date()).getTime();
        if(data.length==2){
            this.accelCount++;
            //this is an accel reading
            this.accelRaw[this.accelCount%1600] = ((data[0]+256*data[1])/16384-1)*9.807;   //change to 0 for gravity
            //maybe capture it
            if(this.manualCapturing || this.liftProgress>1){
                this.capturedData[0].push(this.accelRaw[this.accelCount%1600]);
            }
            //console.log('loading accel')
        }else if(data.length==1){
             this.elevCount++;
            //console.log('elevation');
            if(data[0] > 127){data[0] -= 256;}

            if( this.elevCount==1){
                this.elevOffset = (data[0]/10);
            }

            //change it to meters and offset it
            this.elevRaw[this.elevCount%400] = (data[0]/10)-this.elevOffset;

            //we need to make sure the value is not really wrong
            //if(Math.abs(this.elevRaw[this.elevCount%400]-this.elevRaw[(this.elevCount+399)%400]) > 5){
            //    console.log('we see a bad elevation point');
            //    this.elevRaw[this.elevCount%400] = this.elevRaw[(this.elevCount+399)%400];
           // }


            this.height = parseInt(Globals.myAverage(this.elevRaw.wSlice(this.elevCount-50,this.elevCount)).mean*10)/10;
            $rootScope.$apply()
            //temporary stuff to drive the icon
            if(this.height<this.fallDistance){this.isFallen=true;}
            else {this.isFallen=false;}


            //Every little while, lets update
            if(this.elevCount%50==0){
                 $rootScope.$broadcast('newPosition',{fallen:this.isFallen});
            }

        }


    }




   
});