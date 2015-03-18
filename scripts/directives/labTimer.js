'use strict';
/*
 * lab material directive for lab app.
 */
angular.module("labDirectives")
.directive("labTimer" , ["$interval","$rootScope" ,"dateFilter" ,"$timeout" , function($interval ,$rootScope ,dateFilter ,$timeout){
	return {
		replace : true,
		restrict : "EA",
		scope : {},
		templateUrl : "templates/lab-timer.html",
		link : function(scope , element , attrs){
            scope.started = false;
            var format,  // date format
                stopTime, // so that we can cancel the time updates
                current,
                time = (new Date("2014-12-03T00:00:00Z")).getTime();//new a specified date with starting time at 00:00:00

            // used to update the UI
            function updateTime() {
                time = time + 1000;
                current = new Date(time);
                element.find(".show-timer").text(dateFilter(new Date(current.getUTCFullYear(), current.getUTCMonth(), current.getUTCDate(), current.getUTCHours(), current.getUTCMinutes(), current.getUTCSeconds()), "HH:mm:ss"));
            }

            // listen on DOM destroy (removal) event, and cancel the next UI update
            // to prevent updating time after the DOM element was removed.
            element.on('$destroy', function() {
                $interval.cancel(stopTime);
            });

            //after intro complete, will trigger the event.
            $rootScope.$on("intro-complete" ,function(){
                stopTime = $interval(updateTime, 1000);
                $timeout(function(){
                    scope.started = true;
                },1000)
            });

		}
	}
}]);