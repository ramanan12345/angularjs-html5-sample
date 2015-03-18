angular.module('ctrlnav', [])
  .directive('exitPopup', ['$popup', function ($popup) {
    return {
      restrict: 'AE',
      template: '<button ng-click="showExitPopUp()" type="button" class="btn-exit-popup">Exit</button>',
      link: function($scope, element, attrs) {
        $scope.showExitPopUp = function() {
          var modalInstance = $popup.show({
            templateUrl: 'templates/exit-popup.html',
            controller: 'ExitDialog'
          });
        }
      }
    }
  }])