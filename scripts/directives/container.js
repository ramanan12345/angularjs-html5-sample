'use strict';
/*
 * lab container directive for lab app.
 */
angular.module("labDirectives")
    .directive("labContainer" ,[function(){
            return {
                templateUrl : "templates/container.html",
                restrict : "EA",
                replace : true,
                scope : {
                    "conData" : "="
                },
                link : function(scope , element ,attrs){

                }
            }
     }]);