var app = angular.module("swish");


app.directive('shotchart',  function($window) {
  return {
    restrict: 'A',
    replace:false,
    template: '<div></div>',
    link: function(scope, ele, attrs) {
        var svg,titleTxt,valTxt,courtImg;
        var vh=.01*$window.innerHeight;
        var vw = .01*$window.innerWidth;
        var w = 100*vw;
        var h = 93*vh;

        svg = d3.select(ele[0]).append('svg')
           .attr('width', w)
           .attr('height', h)
           .style("z-index", '500')
           .append("g");

        courtImg = svg.append("svg:image")
           .attr('x',0)
           .attr('y',0)
           .attr('width', w)
           .attr('height', h)
           .attr("preserveAspectRatio", "xMinYMin slice")
           .attr("xlink:href","css/img/court2.png")


        scope.update = function(){
            //now, draw the shots
            svg.selectAll("text").remove();
            _.each(scope.m.shotsEnt.shots,function(shot){
                if(shot[2]){
                    svg.append("text")
                      .attr("text-anchor", "middle")
                      .text(function(d) {
                       return  "O";
                      })
                      .attr("font-size", vh*3)
                      .attr("fill", '#5fad41')
                      .attr("font-weight", '800')

                      .attr("transform", "translate("+(shot[0]*w/100)+","+(shot[1]*h/100)+")");
                }else{
                    svg.append("text")
                      .attr("text-anchor", "middle")
                      .text(function(d) {
                       return  "X";
                      })
                      .attr("font-size", vh*3)
                      .attr("fill", '#ea2b1f')
                      .attr("font-weight", '800')
                      .attr("transform", "translate("+(shot[0]*w/100)+","+(shot[1]*h/100)+")");
                }
            })
       }
       scope.update();

        scope.$on('update', function (event, data) {
            scope.update();
        });

    }


  }
});