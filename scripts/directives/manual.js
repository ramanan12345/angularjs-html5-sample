'use strict';

angular.module("labDirectives")
  .directive('uiDraggable', function(){
    return {
      restrict: 'A',
      scope: {
        uiDragOptions: '='
      },
      link: function(scope, element, attrs){
        element.draggable(scope.uiDragOptions || {});
        scope.$on('$maximize', function(){
          console.log('maximize');
          element.offset({left:0, top:0});
        });
      }
    }
  })
  .directive('resizable', function(){
    return {
      restrict: 'A',
      scope: {
        options: "="
      },
      link: function(scope, element, attrs){
        var options = scope.options;
        element.resizable(options);
        if( options.minHeight ){
          element.css({"height": options.minHeight + 'px'});
        }
      }
    }
  })
  .directive('manual', ['$http', '$rootScope', function($http, $rootScope){
    return {
      restrict: 'EA',
      templateUrl: 'templates/manual.html',
      link: function(scope, element, attrs){
        scope.showManual = false;
        scope.showManualClick = function() {
          scope.showManual = true;
        };
        scope.loadContent = function(data) {
          $http.get('/labData/' + data + '.json').then(function(res){
            var content = angular.fromJson(res.data);
            element.find('#content').html(content.content);
          });
        };
        scope.maximize = function(){
          if( element.hasClass('maximize') ){
            element.removeClass('maximize');
          }else{
            element.addClass('maximize');
            $rootScope.$broadcast('$maximize');
          }
        };
        scope.close = function(){
          element.addClass('close-manual');
        };
        scope.show = function(){
          element.removeClass('close-manual');
        };
        scope.loadContent('background');
      }
    }
  }]);
