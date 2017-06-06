(function() {

  'use strict';
  /* global d3 */

    /**
     * Angular directive to display information as a colored calendar.
     * Inspired from: http://bl.ocks.org/mbostock/4063318
     */

     angular.module('d3calendar', [])
     .directive('d3calendar', [

      function() {
        return {
          restrict: 'E',
          scope: {
            cellSize: '=?', // the cell size (defaults to 17)
            data: '=', // the data to display. Must be an array of objects 
            dateAccessor: '=', // function to extract the date, defaults to function(el){ return el.date; }
            colorAccessor: '=', // function to extract the color [required]
            eventAccessor: '=',
          },
          link: function(scope, element, attrs) {

            var cellSize = (scope.cellSize >= 0) ? scope.cellSize : 23;
            var m = { // The horizontal and vertical margins (# of cells).
              hor: 4,
              ver: 2
            };
            var width = (54 + 3) * cellSize + 2;
            var height = (7) * cellSize + 2;

            var dateAccessor = scope.dateAccessor ? scope.dateAccessor : function(el){ return el.date; };
            var eventAccessor = scope.eventAccessor ? scope.eventAccessor : function(el){ return el.events; };
            var colorAccessor = scope.colorAccessor ? scope.colorAccessor : function(el){ return "white"; };

            var data = scope.data;

            // 1 - Scan the data to determine the year range.
            var yearRange = d3.range(
              d3.min(data.map(function(d) {
                return dateAccessor(d).getFullYear();
              })),
              d3.max(data.map(function(d) {
                return dateAccessor(d).getFullYear();
              }))
              );

            // 2 - Format the dates.
            var percent = d3.format(".1%"),
            format = d3.time.format("%Y-%m-%d");
            var dayAccessor = function(d) { return format(d3.time.day(dateAccessor(d))); };

            // 3 - Append a separate SVG for each year.
            var svg = d3.select(element[0]).selectAll("svg")
              .data(yearRange)
              .enter().append("svg")
              .attr("width", width)
              .attr("height", height)
              .style("margin-top", (m.ver * cellSize) / 2)
              .style("margin-left", (m.hor * cellSize) / 2)
              .style("margin-bottom", (m.ver * cellSize) / 2)
              .style("margin-right", (m.hor * cellSize) / 2)
              .attr("class", "RdYlGn")
              .append("g")
              .attr("transform", "translate(" + ((width - cellSize * 53) / 2) + "," +
                (height - cellSize * 7 - 1) + ")");

            // 4 - Label the years.
            svg.append("text")
              .attr("text-anchor", "middle")
              .attr("dominant-baseline", "central")
              .attr("transform", "rotate(-90)")
              .attr("x", -height / 2)
              .attr("y", -cellSize / 4)
              .style("font-size", cellSize)
              .text(function(d) {
                return d;
              });

            // 5 - Draw the individual day cells.
            var rect = svg.selectAll(".day")
              .data(function(d) {
                return d3.time.days(new Date(d, 0, 1), new Date(d + 1, 0, 1));
              })
              .enter().append("rect")
              .attr("class", "day")
              .attr("width", cellSize)
              .attr("height", cellSize)
              .attr("x", function(d) {
                      // Incorporates the horizontal margins.
                      return (d3.time.weekOfYear(d) + 1) * cellSize;
                    })
              .attr("y", function(d) {
                      // Vertical margins already set between SVG's.
                      return d.getDay() * cellSize;
                    })
              .datum(format);

            // 6 - Create a tooltip for each day.
            rect.append("title");

            // 7 - Outline the months.
            svg.selectAll(".month")
              .data(function(d) {
                return d3.time.months(new Date(d, 0, 1), new Date(d + 1, 0, 1));
              })
              .enter().append("path")
              .attr("class", "month")
              .attr("d", monthPath);

            // 8 - Group days.
            var days = d3.nest()
              .key(dayAccessor)
              .rollup(function(d) {
                return {
                  c: colorAccessor(d[0]),
                  e: eventAccessor(d[0])
                }
              })
              .map(data);

            // 9 - Color and label days based on events.
            rect.filter(function(d) { return d in days; })
              .style("fill", function(d) {
                return days[d].c;
              })
              .select("title")
              .text(function(d) {
                var t = d;+ days[d].e;
                days[d].e.forEach(function(d) {
                  t += '\n' + d;
                });
                return t;
              });

            // 10 - Outline the months.
            function monthPath(t0) {
              var t1 = new Date(t0.getFullYear(), t0.getMonth() + 1, 0),
              d0 = t0.getDay(),
              w0 = d3.time.weekOfYear(t0),
              d1 = t1.getDay(),
              w1 = d3.time.weekOfYear(t1),
              sh = 1; // Horizontal shift (to make room for year labels).

              return "M" + (w0 + 1 + sh) * cellSize + "," + d0 * cellSize +
                "H" + (w0 + sh) * cellSize +
                "V" + 7 * cellSize +
                "H" + (w1 + sh) * cellSize +
                "V" + (d1 + 1) * cellSize +
                "H" + (w1 + 1 + sh) * cellSize +
                "V" + 0 +
                "H" + (w0 + 1 + sh) * cellSize +
                "Z"; // End the path.
            }
          }
        };
      }
    ]);
})();