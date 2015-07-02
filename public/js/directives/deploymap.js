var app = angular.module("deploy");


app.directive('deploymap',  function($window) {
  return {
    restrict: 'A',
    replace:false,
    template: '<div></div>',
    link: function(scope, ele, attrs) {
        var svg;
        var vh=.01*$window.innerHeight;
        var vw = .01*$window.innerWidth;
        var w = 100*vw;
        var h = 40*vh;

        var xScale;

        var yScale; 
        var myRect;





        svg = d3.select(ele[0]).append('svg')
           .attr('width', w)
           .attr('height', h)
           .append("g");
           

        



        scope.makePath = function(pathInfo) {
            var txt = '';
            var pos = [0,0];

            _.each(pathInfo,function(pt,idx){
                //console.log(pt)
                //console.log(parseInt(xScale(pt[0])),parseInt(yScale(pt[1])))
                if(idx==0){
                    pos = [pt[0],pt[1]];
                    txt += 'M'+parseInt(xScale(pt[0]))+','+parseInt(yScale(pt[1]));
                }else{
                    pos[0] += pt[0];
                    pos[1] += pt[1];
                    txt += 'L'+parseInt(xScale(pos[0]))+','+parseInt(yScale(pos[1]));
                }
            })
            //console.log(txt)
            return txt;
        }







        scope.update = function(){
            if(scope.m.eventList[scope.m.cEventIdx]==undefined){return;}
            var event = scope.m.eventList[scope.m.cEventIdx];

            var absPos = _.map(event.mapData.walls,function(wall){
                var pos;
                return _.map(wall,function(pt,idx){
                    if(idx==0){
                        pos = [pt[0],pt[1]];
                    }else{
                        pos[0] += pt[0];
                        pos[1] += pt[1];
                    }
                    return [pos[0],pos[1]];
                });
            })

            //first, set the extents
            var xAndYs = _.zip.apply(this, _.flatten(absPos));

            xScale = d3.scale.linear()
                .domain(d3.extent(xAndYs[0]))
                .range([.05*w,.95*w]);

            yScale = d3.scale.linear()
                .domain(d3.extent(xAndYs[1]))
                .range([.05*h,.95*h]);

            svg.selectAll("rect").remove();
            myRect = svg.append("rect")
                .attr("x", 0)
                .attr("y", 0)
                .attr("width", w)
                .attr("height", h)
                .attr("fill","#D0CD94")
                .on('click', function(d,i){
                    //check to see if anything happened then
                  var pos = d3.mouse(this);
                  var loc = [xScale.invert(pos[0]),yScale.invert(pos[1])];
                  scope.calibPoint(loc)
                });

            svg.selectAll("path").remove();
            _.each(event.mapData.walls,function(wall){
                //console.log('drawing path',JSON.stringify(wall))
                svg.append("path")
                .attr("d", scope.makePath(wall))
                .attr("fill","none")
                .attr("stroke-width", 4)
                .attr("stroke","#293543");
            });




            svg.selectAll("circle").remove();
            _.each(event.calibData,function(calib){
                svg.append("circle")
                .attr("cx", xScale(calib.x))
                .attr("cy", yScale(calib.y))
                .attr("r", 2)
                .attr("fill","#ff9f1c");
            });

            svg.selectAll("text").remove();
            _.each(event.taskData,function(task){
                 var color = _.findWhere(scope.m.userList,{'_id':task.userID}).color;

                 svg.append('text')
                    .attr('text-anchor', 'middle')
                    .attr('dominant-baseline', 'central')
                    .attr('font-family', 'deploy')
                    .attr('font-size', '20px')
                    .attr('stroke', color)//'#e71d36'
                    .attr('fill', color)
                    .attr("transform", "translate("+xScale(task.x)+","+yScale(task.y)+")")

                    .text(function(d) { return task.icon; })
                    .on('click', function(d,i){
                        var pos = d3.mouse(myRect.node());
                        var loc = [xScale.invert(pos[0]),yScale.invert(pos[1])];
                        scope.removeTask(loc)
                    });

            });

            //draw in all the users that have a position
             _.each(scope.m.userList,function(user){
                if(_.has(user.positions,event._id)){
                    svg.append("circle")
                      .attr("cx", xScale(user.positions[event._id][1]))
                      .attr("cy", yScale(user.positions[event._id][2]))
                      .attr("r", 5)
                      .attr("fill",user.color);
                }
            });




            

       }



       scope.update();

        scope.$on('update', function (event, data) {
            scope.update();
        });

    }


  }
});