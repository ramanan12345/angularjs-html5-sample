'use strict';
/*
 * lab instrument directive for lab app.
 */
angular.module("labDirectives")
    .directive("labInstrument" ,[function(){
        return {
            templateUrl : "templates/instrument.html",
            restrict : "EA",
            replace : false,
            scope : {
                "insData" : "="
            },
            link : function(scope , element ,attrs){

            }
        }
    }]);