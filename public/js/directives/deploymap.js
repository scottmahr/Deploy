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


        function makePath(pathInfo) {
            var txt = '';
            var pos = [0,0];
            _.each(pathInfo,function(pt,idx){
                //console.log(pt)
                //console.log(parseInt(xScale(pt[0])),parseInt(yScale(pt[1])))
                if(idx==0){
                    pos = pt;
                    txt += 'M'+parseInt(xScale(pt[0]))+','+parseInt(yScale(pt[1]));
                }else{
                    pos[0] += pt[0];
                    pos[1] += pt[1];
                    txt += 'L'+parseInt(xScale(pos[0]))+','+parseInt(yScale(pos[1]));
                }



            })
            console.log(txt)
            return txt;
        }


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

        _.each(scope.m.mapData.walls,function(wall){
            svg.append("path")
            .attr("d", makePath(wall))
            .attr("fill","none")
            .attr("stroke-width", 4)
            .attr("stroke","#293543");
        });
 







        scope.myClick = function(event) {
            console.log('clicked')
        }


        scope.update = function(){
            svg.selectAll("circle").remove();
            _.each(scope.m.calibData,function(calib){
                svg.append("circle")
                .attr("cx", xScale(calib.x))
                .attr("cy", yScale(calib.y))
                .attr("r", 3)
                .attr("fill","#ff9f1c");
            });

            if(scope.m.location[0] && scope.m.location[1]){
                svg.append("circle")
                .attr("cx", xScale(scope.m.location[0]))
                .attr("cy", yScale(scope.m.location[1]))
                .attr("r", 5)
                .attr("fill","#78BC61");
            }
            

       }
       scope.update();

        scope.$on('update', function (event, data) {
            scope.update();
        });

    }


  }
});