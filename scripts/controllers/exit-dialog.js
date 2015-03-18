angular.module("labApp")
  .controller('ExitDialog', ['$scope','$popup', '$rootScope', '$window',
    function($scope, $popup, $rootScope, $window) {

    $scope.ok = function() {
      window.exit = true;
      $rootScope.$broadcast('clearItems');
      $rootScope.$broadcast('labExit');
      $popup.close();
    };

    $scope.close = function() {
      $popup.close();
    };
  }]);