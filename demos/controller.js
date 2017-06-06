angular.module('demoapp', ['d3calendar'])
			.controller('DemoCtrl', [ '$scope', function($scope){

				// Generate an event list for a day.
				function genEvents() {
					var arr = [];

					if(Math.random() > 0.5)
						arr.push("Edited file.");
					if(Math.random() > 0.5)
						arr.push("Pushed project.");
					if(Math.random() > 0.5)
						arr.push("Updated wiki.");

					return arr;
				}

				// Generates colors.
				var palette = d3.scale.category20b().range();
				var set = 2; // 1-4.

				// Generates random data for every day in the given range.
				$scope.data = d3.time.day.range(new Date(2000, 0, 1), new Date(2016, 0, 1))
					.map(function(day){
						return { 
							date: day,
							events: genEvents()
						};
					});

				$scope.dateAccessor = function(el) { return el.date; };
				$scope.eventAccessor = function(el) { return el.events; };
				$scope.colorAccessor = function(el) {
					var numEvents = $scope.eventAccessor(el).length;

					// The more events in a day, the redder it gets.
					var redScale = d3.scale.linear()
						.domain([0, 3])
						.range([0, 255]);

					// The fewer events in a day, the greener it is.
					var greenScale = d3.scale.linear()
						.domain([0, 3])
						.range([255, 0]);

					var red = redScale(numEvents);
					var green = 255 - red

					return "rgb(" + red + "," + green + ", 0)";
				};

			}]);