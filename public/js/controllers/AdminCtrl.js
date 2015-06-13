var app = angular.module("EOP");

app.controller('AdminCtrl', function ($scope,$http,$window,$timeout,$routeParams,$location,Restangular,Globals) {

    $scope.m = {
        userInput:'',
        adminPage:0,
        newUser: {name:'',email:'',isAdmin:false,reviewGroup:'associates'},

        //fucntions

    };
    $scope.g = Globals;



    if(_.has($routeParams,'id')){
        Globals.userID = $routeParams.id;
    }


    Globals.loadData();



    $scope.setSection = function(idx){
        $scope.m.adminPage = idx;
        $scope.saveSettings();
    }


    $scope.newQuestion = function(type){
        if(type=='project'){
            if(!_.has($scope.g.settings.gOptions,'projectQuestions')){
                $scope.g.settings.gOptions.projectQuestions=[];
            }
            $scope.g.settings.gOptions.projectQuestions.push({question: '',answer:'',charLimit:500});
        }else{
            if(!_.has($scope.g.settings.gOptions,'summaryQuestions')){
                $scope.g.settings.gOptions.summaryQuestions=[];
            }
            $scope.g.settings.gOptions.summaryQuestions.push({question: '',answer:'',charLimit:500});
        }
    }



    $scope.deleteQuestion = function(type,idx){
        if(type=='project'){
            $scope.g.settings.gOptions.projectQuestions.splice(idx,1);
        }else{
            $scope.g.settings.gOptions.summaryQuestions.splice(idx,1);
        }
    }
    $scope.moveQuestion = function(type,idx,dir){
        if(type=='project'){
            var q = $scope.g.settings.gOptions.projectQuestions.splice(idx,1)[0];
            $scope.g.settings.gOptions.projectQuestions.splice(idx+dir,0,q);
        }else{
            var q = $scope.g.settings.gOptions.summaryQuestions.splice(idx,1)[0];
            $scope.g.settings.gOptions.summaryQuestions.splice(idx+dir,0,q);
        }
        console.log($scope.g.settings.gOptions)
    }

    $scope.saveSettings = function(notify){
        //first, validate the dates are correct
        //console.log($scope.g.settings.gOptions)
        var shouldReturn = false;
        _.each(Globals.settings.gOptions.dates,function(dString){
            if(shouldReturn){return;}
            var dt = new Date(dString[1]);
            if ( isNaN( dt.getTime() ) ) {  
                alert(dString[1] + ' is not a valid date, please change it to mm/dd/yyyy and try again.')
                shouldReturn = true;
            }
        })

        if(shouldReturn){return;}

        $scope.g.settings.put().then(function(){
            if(notify){alert('Saved!');}
        });
    }
    $scope.userPage = function(user){
        $location.path('/home');
    }
    $scope.saveUser = function(user){
        console.log(user)
        user.put().then(function(){
            console.log('saved user');
            confirm('saved!')
        });
    }
    $scope.gotoUserPage = function(user){
       // $routeParams.id = user._id;
        $location.path('/home').search({id: user._id});
    }

    $scope.deleteUser = function(user){
        user.remove().then(function(msg){
            if(_.has(msg,'error')){
                console.log('User not removed:',msg.error);
                alert('User not removed: '+msg.error)
            }else{
                $scope.g.userList = _.filter($scope.g.userList, function(u){return u._id != user._id;});
            }

            
        });
    }




    $scope.addUser = function(){

    console.log($scope.m.newUser)
       Globals.usersBase.post($scope.m.newUser).then(function(user){
            //posted user
            console.log('posted user',user)
            $scope.g.userList.push(user);

        },function(error){
            //posted user
            console.log('error posting'+error)
        });

       $scope.m.newUser = {name:'',email:'',isAdmin:false,reviewGroup:'associates'};
    }

    $scope.testEmail = function(emailIdx){

        $scope.saveSettings();
        Globals.email(Globals.selectedUser,Globals.reviewList[0],Globals.settings.gOptions.emails[emailIdx][1]);


    }



    $scope.welcomeEmail = function(user){
        Globals.email(user,{},Globals.settings.gOptions.emails[0][1]);
    }

    $scope.emailAll = function(emailType){
        //send welcome emails to everyone
        var numReviews;
        _.each(Globals.userList,function(user){
            //first, count up all reviews that are ready
            
            if(emailType=='welcome'){
                numReviews = _.reduce(user.reviews, function(num, r) {
                    if(r.reviewerID==user._id && r.type=='project' && r.status!='approved'){
                        return num+1;
                    }
                    return num;
                },0); 
                if(numReviews>0){
                    Globals.email(user,{},Globals.settings.gOptions.emails[1][1],
                        {numberOfReviews:numReviews});
                }else{
                    Globals.email(user,{},Globals.settings.gOptions.emails[0][1]);
                }
            }else if(emailType=='remindProject'){
                numReviews = _.reduce(user.reviews, function(num, r) {
                    if(r.reviewerID==user._id && r.type=='project' && !_.contains(['submitted','approved','completed'],r.status)){
                        return num+1;
                    }
                    return num;
                },0); 
                if(numReviews>0){
                    Globals.email(user,{},Globals.settings.gOptions.emails[1][1],
                        {numberOfReviews:numReviews});
                }
            }else if(emailType=='remindCoach'){
                numReviews = _.reduce(user.reviews, function(num, r) {
                    if(r.reviewerID==user._id && r.type=='summary' && !_.contains(['submitted','approved','completed'],r.status)){
                        return num+1;
                    }
                    return num;
                },0); 
                if(numReviews>0){
                    Globals.email(user,{},Globals.settings.gOptions.emails[1][1],
                        {numberOfReviews:numReviews});
                }
            }
            
        })
    }

    $scope.downloadAll = function(){
        //send welcome emails to everyone
        _.each(Globals.userList,function(user){
            //first, count up all reviews that are ready
            Globals.downloadPDF(user);
        })
    }




    $scope.clearReviews = function(){
        var response = confirm("Are you sure you want to delete all reviews?")
        if(response){
            alert('Please wait for us to remove all reviews. The page will refresh with complete.')
            _.each($scope.g.reviewList,function(review,idx){
                $timeout(function(){
                    review.remove().then(function(){
                        console.log('removed')
                    });
                },500*idx);
            });
            $timeout(function(){
                $window.location.reload();
            },500*$scope.g.reviewList.length+1000)
            
        }
        
    }


    $scope.deleteReview = function(reviewID,user){
        console.log(reviewID)
        Restangular.one("reviews", reviewID).remove().then(function(){
            user.get().then(function(usr){
                console.log('got user',user)
                user.reviews = usr.reviews;
            });
        },function(error){
            //posted review
            console.log('error deleting'+JSON.stringify(error));
        });
    }

    $scope.addReviews = function(user,type){
        var inputs = user.userInput.toLowerCase().split(',');
        //console.log(inputs);
        
        _.each(inputs,function(input,idx){
            var matches =  _.filter($scope.g.userList,function(u){
                return _.contains(u.name,_.trim(input));
            });
            if(matches.length==1){
                //now we add the review
                $timeout(function(){
                    var questions = $scope.g.settings.gOptions.summaryQuestions;
                    if(type=='project'){
                        questions = $scope.g.settings.gOptions.projectQuestions;
                    }
                    var review = {
                            type: type,
                            revieweeID:user._id,
                            reviewerID:matches[0]._id,
                            questions: questions,
                            status:'pending',
                    };

                    Globals.reviewsBase.post(review).then(function(review){
                        //posted review
                        //console.log('posted')
                        user.get().then(function(usr){
                            //console.log('got user',user)
                            user.reviews = usr.reviews;
                        });
                    },function(error){
                        //posted review
                        console.log('error posting'+error)
                    });
                    //console.log('got it:'+matches[0].name)
                },idx*500);
            }
        },this);

        user.userInput = '';
        
    }
    
});