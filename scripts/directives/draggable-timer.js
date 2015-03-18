angular.module('dragTimer', [])
  .directive('addDragTimer', function () {
    return {
      restrict: 'AE',
      template: '<a href="#" ng-click="add()" class="add-new-timer">&times;</a>',
      scope: {
        timers: '='
      },
      link: function ($scope, element, attrs) {
        $scope.add = function () {
          if (angular.isDefined($scope.timers) && angular.isArray($scope.timers)) {
            var labTable = angular.element('.lab-table');
            var timer = {
              hours: 0,
              seconds: 0,
              minutes: 0,
              //y: 0,
              x: labTable.width() / 2 - 100,
              type: 'timer',
              timestamp: new Date().getTime()
            };
            $scope.timers.push(timer);
          }
        }
      }
    }
  })
  .directive('dragTimer', ['$interval', '$rootScope', function ($interval, $rootScope) {
    return {
      restrict: 'AE',
      templateUrl: 'templates/draggable-timer.html',
      replace: true,
      scope: {
        timerData: "=",
        onTimerStopEvent: "="
      },
      link: function ($scope, element, attrs) {
        // Set interval for timer
        $scope.draggable = false;
        $scope.centerAnchor = false;

        $scope.mouseUp = function() {
          //Set timeout for parent events
          setTimeout(function() {
            $scope.draggable = false
          }, 100);
        };

        $scope.timerData.tStop = $interval(function () {
          if ($scope.timerData.seconds++ === 60) {
            $scope.timerData.seconds = 0;
            if ($scope.timerData.minutes++ === 60) {
              $scope.timerData.minutes = 0;
              $scope.timerData.hours++;
            }
          }
        }, 1000);

        $scope.stopTimer = function () {
          if (angular.isDefined($scope.timerData.tStop)) {
            $interval.cancel($scope.timerData.tStop);
            $rootScope.$broadcast('stop-timer-event', $scope.timerData);
            if (angular.isFunction($scope.onTimerStopEvent)) {
              $scope.onTimerStopEvent($scope.timerData);
            }
          }
        }
      }

    }
  }]);
