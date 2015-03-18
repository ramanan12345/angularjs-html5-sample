'use strict';
/*
 * lab trash directive for lab app.
 */
angular.module("labDirectives")
    .directive("labTrash" ,["$rootScope", function($rootScope){
        return {
            templateUrl : "templates/trash.html",
            restrict : "EA",
            replace : true,
            link : function(scope , element ,attrs){
                scope.trash = {
                   image : 'images/trash-close.png'
                };
                //handle drop completed event.
                scope.onDropToTrashComplete = function($data, event) {
                    // emit remove event
                    $rootScope.$broadcast('removeEvent', $data);
                };
            }
        }
    }]);