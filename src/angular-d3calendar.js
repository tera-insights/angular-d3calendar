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
                        "cell-size": '=?', // the cell size (defaults to 17)
                        data: '=', // the data to display. Must be an array of objects 
                        "date-accessor": '&', // function to extract the date, defaults to function(el){ return el.date; }
                        "color-accessor": '&', // function to extract the color [required]
                    },
                    link: function(scope, element, attrs) {
                        var cellSize = (scope["cell-size"] >= 0) ? scope["cell-size"] : 17;
                        var width = (53 + 4) * cellSize; // 2 cell margin on either size
                        var height = (7 + 2) * cellSize;
                        var dateAccessor = scope.dateAccessor ? scope.dateAccessor : function(el) {
                            return el.date;
                        };
                        var colorAccessor = scope.colorAccessor ? scope.colorAccessor : function(el){ return el.color; };
                        var data = scope.data;

                        // 1. Scan the data to determine the year range
                        var yearRange = d3.range(
                            d3.min(data.map(function(d) {
                                return dateAccessor(d).getFullYear();
                            })),
                            d3.max(data.map(function(d) {
                                return dateAccessor(d).getFullYear();
                            }))
                        );

                        var percent = d3.format(".1%"),
                            format = d3.time.format("%Y-%m-%d");

                        var svg = d3.select(element[0]).selectAll("svg")
                            .data(yearRange)
                            .enter().append("svg")
                            .attr("width", width)
                            .attr("height", height)
                            .attr("class", "RdYlGn")
                            .append("g")
                            .attr("transform", "translate(" + ((width - scope.cellSize * 53) / 2) + "," + (height - scope.cellSize * 7 - 1) + ")");

                        svg.append("text")
                            .attr("transform", "translate(-6," + cellSize * 3.5 + ")rotate(-90)")
                            .style("text-anchor", "middle")
                            .text(function(d) {
                                return d;
                            });

                        var rect = svg.selectAll(".day")
                            .data(function(d) {
                                return d3.time.days(new Date(d, 0, 1), new Date(d + 1, 0, 1));
                            })
                            .enter().append("rect")
                            .attr("class", "day")
                            .attr("width", cellSize)
                            .attr("height", cellSize)
                            .attr("x", function(d) {
                                return d3.time.weekOfYear(d) * cellSize;
                            })
                            .attr("y", function(d) {
                                return d.getDay() * cellSize;
                            })
                            .datum(format);

                        rect.append("title")
                            .text(function(d) {
                                return d;
                            });

                        svg.selectAll(".month")
                            .data(function(d) {
                                return d3.time.months(new Date(d, 0, 1), new Date(d + 1, 0, 1));
                            })
                            .enter().append("path")
                            .attr("class", "month")
                            .attr("d", monthPath);

                        var days = d3.nest()
                            .key(dateAccessor)
                            .rollup(function(d) {
                                // group color is the color of the first element
                                var day = {
                                    v: dateAccessor(d[0]),
                                    c: colorAccessor(d[0])
                                };
                                return day;
                            })
                            .map(data);

                        rect.filter(function(d) {
                            return d in days;
                        })
                            .attr("class", function(d) {
                                return d.c;
                            })
                            .select("title")
                            .text(function(d) {
                                return d + ": " + percent(data[d]);
                            });

                        function monthPath(t0) {
                            var t1 = new Date(t0.getFullYear(), t0.getMonth() + 1, 0),
                                d0 = t0.getDay(),
                                w0 = d3.time.weekOfYear(t0),
                                d1 = t1.getDay(),
                                w1 = d3.time.weekOfYear(t1);
                            return "M" + (w0 + 1) * cellSize + "," + d0 * cellSize + "H" + w0 * cellSize + "V" + 7 * cellSize + "H" + w1 * cellSize + "V" + (d1 + 1) * cellSize + "H" + (w1 + 1) * cellSize + "V" + 0 + "H" + (w0 + 1) * cellSize + "Z";
                        }
                    }
                };
            }
        ]);

})();