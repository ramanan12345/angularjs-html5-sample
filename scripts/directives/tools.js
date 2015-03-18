angular.module('labApp.tools', [])
  .directive('tableTools', function () {
    return {
      restrict: 'EA',
      templateUrl : "templates/tools.html",
      scope: {
        onClearEvent: '=',
        tableItems: '=',
        dragTimers: '='
      },
      link: function ($scope, element, attrs) {
        var resetDashboard = function() {
          angular.element("#liquid_fps").text("");
          angular.element("#steam_fps").text("");
          angular.element("#bubble_fps").text("");
          angular.element("#flame_fps").text("");
        };

        $scope.clearTableItemsClickHandler = function () {
          if (angular.isArray($scope.dragTimers)) {
            $scope.dragTimers = [];
          }
          if (angular.isArray($scope.tableItems)) {
            $scope.tableItems = [];
          }
          if (angular.isFunction($scope.onClearEvent)) {
            $scope.onClearEvent();
          }
          if ($scope.tableItems.length == 0) {
            resetDashboard();
          }
        };
        $scope.$on('clearByItemObject', function($event, itemObj){
          angular.forEach($scope.tableItems, function(item, index){
            if( itemObj  === item ){
              $scope.tableItems.splice(index,1);
            }
            if ($scope.tableItems.length == 0) {
              resetDashboard();
            }
          });
        });
        $scope.$on('clearItems', function() {
          $scope.clearTableItemsClickHandler();
        })
      }
    }
  });