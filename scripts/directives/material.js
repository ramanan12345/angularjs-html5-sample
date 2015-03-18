'use strict';
/*
 * lab material directive for lab app.
 */
angular.module("labDirectives")
    .directive("labMaterial" ,[function(){
            return {
                templateUrl : "templates/material.html",
                restrict : "EA",
                replace : false,
                scope : {
                    "matData" : "="
                },
                link : function(scope , element ,attrs){

                }
            }
     }]);