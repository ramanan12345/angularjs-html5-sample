'use strict';
/*
* lab bench directive for lab app.
*/
angular.module("labDirectives")
    .directive("labBench" , ["$document" ,function($document){
        return {
            templateUrl : "templates/bench.html",
            restrict : "EA",
            replace : true,
            scope : {
                "labData" : "="
            },
            link : function(scope,element,attrs){
                 //handle tabs clicked event.
                 element.find(".bench-menues a").on("touchstart click" , function(e){
                    e.preventDefault();
                    var tabPanelId = angular.element(this).attr("href");
                    element.find(".bench-menues li.active").removeClass("active");
                    angular.element(this).parent().addClass('active')
                    element.find(".tab-pane").hide();
                    $(tabPanelId).show();
                 });
            }
        }
    }]);