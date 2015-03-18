'use strict';
/*
 * lab instrument directive for lab app.
 */
angular.module("labDirectives")
    .directive("lightSwitch" ,[function(){
        return {
            templateUrl : "templates/light-switch.html",
            restrict : "E",
            replace : false,
            scope : {
                "status" : "@"
            },
            link : function(scope , element ,attrs){
                scope.status = 'on';
                scope.changeSwitchStatus = function() {

                    if (scope.status === 'on') {
                        scope.status = 'off';
                        angular.element('html').addClass('light-switch-off');
                        $('#audioSwitch')[0].currentTime = 0;
                        $('#audioSwitch')[0].play();
                    } else {
                        scope.status = 'on';
                        angular.element('html').removeClass('light-switch-off');
                        $('#audioSwitch')[0].currentTime = 0;
                        $('#audioSwitch')[0].play();
                    }
                }
            }
        }
    }]);