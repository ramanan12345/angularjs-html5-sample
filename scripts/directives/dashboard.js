'use strict';
/*
 * lab instrument directive for lab app.
 */
angular.module("labDirectives")
    .directive("dashboard", ['$interval', function($interval){
        return {
            templateUrl : "templates/dashboard.html",
            restrict : "E",
            replace : false,
            scope : {},
            link : function(scope , element ,attrs){
                var perfData = window.performance.timing;

                var pageLoadTime, connectTime, intervalId;

                var initialObjects = 0;

                function refreshDashboard() {
                    // Calculate the total time required to load a page:
                    pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;

                    // Calculate request response times:
                    connectTime = perfData.responseEnd - perfData.requestStart;

                    // only chrome support memory monitoring
                    if (performance.memory && performance.memory.usedJSHeapSize) {
                        element.find("#memory").text("Memory: " + Math.round(performance.memory.usedJSHeapSize / 10000, 2) / 100 + ' MB');
                    }
                    element.find("#response-time").text("Response Time: " + connectTime + "ms");
                    element.find("#load-time").text("Load Time: " + pageLoadTime + "ms");

                    if (initialObjects == 0) {
                        initialObjects = angular.element.find(".ng-isolate-scope").length;
                    }
                    element.find("#objects").text("Objects: " + (initialObjects + angular.element.find("table-item").length));
                }

                intervalId = $interval(function() {
                    refreshDashboard();
                }, 1000);

                element.on('$destroy', function() {
                    $interval.cancel(intervalId);
                });


            }
        }
    }]);