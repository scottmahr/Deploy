//This is for all the configuration we need
var app = angular.module("deploy");




app.service('Globals', function($rootScope,$timeout,$location,$http, Restangular) {
    
    this.shots = [];

    this.FORM_SERVICE = '7a6f0000-40bd-4b77-b7b4-de8a2c3048b7';
    this.ACCELEROMETER_SERVICE = '7a6f0000-40bd-4b77-b7b4-de8a2c3048b7';
    this.ACCELEROMETER_DATA = '7a6f0001-40bd-4b77-b7b4-de8a2c3048b7';
    this.ACCELEROMETER_NOTIFICATION = '00002902-0000-1000-8000-00805f9b34fb';

    this.STATUS_SERVICE = '7a6f0000-40bd-4b77-b7b4-de8a2c3048b7';
    this.STATUS_DATA = '7a6f0004-40bd-4b77-b7b4-de8a2c3048b7';
    this.STATUS_NOTIFICATION = '00002902-0000-1000-8000-00805f9b34fb';


    this.BATTERY_SERVICE = '0000180f-0000-1000-8000-00805f9b34fb';
    this.BATTERY_DATA = '00002a19-0000-1000-8000-00805f9b34fb';
    this.BATTERY_NOTIFICATION = '00002902-0000-1000-8000-00805f9b34fb';
    

    this.COMMAND_UUID = '7a6f0002-40bd-4b77-b7b4-de8a2c3048b7';


    this.LED_UUID = '7a6f0003-40bd-4b77-b7b4-de8a2c3048b7';
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


    this.roundSigFigs = function(num, n) {
        if(num == 0) {
            return 0;
        }
        if(num<1 && num>-1){n = n-1;}

        var d = Math.ceil(Math.log10(num < 0 ? -num: num));
        var power = n - d;
        var magnitude = Math.pow(10, power);
        var shifted = Math.round(num*magnitude);
        return shifted/magnitude;
    }

    //this will take some data and smooth it 
    this.mySmooth = function(data,filt){
        if(filt==undefined){filt = [0.1,0.2,0.4,0.6,0.4,0.2,0.1];}
        var len = filt.length;
        var sumFilt = _.reduce(filt,function(m, f){ return m+f;},0);
        var normFilt = _.map(filt,function(f){return f/sumFilt});
        return _.map(data,function(v,idx){
            if(idx<parseInt(len/2)){
              idx = parseInt(len/2);
            }else if(idx>=data.length-parseInt(len/2)){
              idx = data.length-parseInt(len/2)-1;
            }
            return _.reduce(_.range(filt.length), function(memo, i){ return memo + normFilt[i]*data[idx+i-parseInt(len/2)]; }, 0);
        });
    }

   this.bufferToHexStr = function(buffer, offset, numBytes){
        var hex = ''
        for (var i = 0; i < numBytes; ++i){
            hex += byteToHexStr(buffer[offset + i])
        }
        return hex
    }

    /**
     * Convert byte number to hex string.
     */
    this.byteToHexStr = function(d){
        if (d < 0) { d = 0xFF + d + 1 }
        var hex = Number(d).toString(16)
        var padding = 2
        while (hex.length < padding){
            hex = '0' + hex
        }
        return hex
    }

    this.fixMetricUnits = function(val, metric, weight){
        var units = metric.units;
        if(units=='m/s2'){
            //lets change this to lbs for now
            val = (val/9.8+1)*weight;
            units = 'lbs';
        }
        if(units=='ratio'){
            units = '';
        }

        val = this.roundSigFigs(val,3);
        return [val, units];
    }

    this.myAverage = function(a) {
        var r = {mean: 0, variance: 0, deviation: 0,avgErr:0}, t = a.length;
        for(var m, s = 0, l = t; l--; s += a[l]);
        for(m = r.mean = s / t, l = t, s = 0; l--; s += Math.pow(a[l] - m, 2));
        for(var e=0,l = t; l--; e += Math.abs(a[l]-m));
        return r.deviation = Math.sqrt(r.variance = s / t),r.avgErr=e/t, r;
    }

   
});