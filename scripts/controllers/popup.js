'use strict';

angular.module('app.ui', [])
  .service('$popup', ['$http', '$compile', '$rootScope', '$controller',
    function ($http, $compile, $rootScope, $controller) {

    this.close = function() {
      if( this.element )
        this.element.remove();
    }

    this.show = function (options) {
      var settings = {}, body = angular.element('body'), self = this;

      angular.extend(settings, options);

      if (settings.hasOwnProperty('templateUrl')) {

        $http.get(settings.templateUrl).success(
          function (template) {
            self.element = angular.element(template);

            var $scope = $rootScope.$new();
            var locals = {}, ctrlInstance;

            locals.$scope = $scope;
            locals.$popup = self;
            locals.$rootScope = $rootScope;

            if( settings.hasOwnProperty('controller') ){
              ctrlInstance = $controller(settings.controller, locals);
            }

            $compile(self.element)($scope);
            self.element.appendTo(body);
          }
        )
      }
    }
  }]);