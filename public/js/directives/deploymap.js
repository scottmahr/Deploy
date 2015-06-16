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

        var xScale = d3.scale.linear()
                .domain([0,20])
                .range([.05*w,.95*w]);

        var yScale = d3.scale.linear()
                .domain([-1.8,4.34])
                .range([.05*h,.95*h]);





        svg = d3.select(ele[0]).append('svg')
           .attr('width', w)
           .attr('height', h)
           .append("g");
           

        var rectangle = svg.append("rect")
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
                .attr("r", 1)
                .attr("fill","#ff9f1c");
            });

            svg.selectAll("text").remove();
            _.each(event.taskData,function(task){
                 svg.append('text')
                    .attr('text-anchor', 'middle')
                    .attr('dominant-baseline', 'central')
                    .attr('font-family', 'deploy')
                    .attr('font-size', '20px')
                    .attr('stroke', '#e71d36')
                    .attr('fill', '#e71d36')
                    .attr("transform", "translate("+xScale(task.x)+","+yScale(task.y)+")")

                    .text(function(d) { return task.icon; });

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