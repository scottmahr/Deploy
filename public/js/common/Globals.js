//This is for all the configuration we need
var app = angular.module("swish");




app.service('Globals', function($rootScope,$timeout,$location,$http, Restangular) {
    
    this.shots = [];


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

   
});