'use strict';

angular.module('ngHitTest', [])
	.directive('ngHitTest', ['$interval', 'LAB_TYPE', '$rootScope', '$compile', function ($interval, LAB_TYPE, $rootScope, $compile) {
		return {
			restrict: 'EA',
			scope: {
				hitTest: '=',
				hitData: '='
			},
			link: function (scope, element, attrs) {
				var hitIntervalID = -1;
				scope.currentConnector = undefined;
				scope.connectorScope = null;
				scope.element = null;
				scope.dragend = false;
				var content = null;
				var data = null;
				var connectorScope;

				element.on('mousedown touchstart', function () {
					if (angular.isObject(scope.hitData)) {
						hitIntervalID = $interval(function () {
							var connectTo = scope.hitData.hasOwnProperty('connectTo');
							if (connectTo) {
								var connectors = angular.element(scope.hitData.connectTo);
								if (connectors.length > 0) {
									angular.forEach(connectors, function (connector) {
										//if( angular.isUndefined(scope.currentConnector) ) {
										//	console.log('select new current connector');
										//
										//}
										var $el = angular.element(connector);
										if (element.objectHitTest({"object": $el})) {
											scope.currentConnector = angular.element(connector);
											connectorScope = scope.currentConnector.scope();
											if (connectorScope && (connectorScope.hasOwnProperty('item') || connectorScope.hasOwnProperty('uiData'))) {
												data = connectorScope.item || connectorScope.uiData;
												scope.element = element;
												content = $(element).parent();
												//console.log("Content",content[0]);
												scope.connectorScope = connectorScope;
											};
											scope.currentConnector.addClass('hit');
										} else {
											if ( $el.hasClass('hit') ) {
												$el.removeClass('hit');
												scope.currentConnector = undefined;
												console.log('not hint....');
												//scope.hitData.data.ungroup = false;
											}
										}
									});
								}
							}
						}, 300);
					}
				});
				scope.$on('draggable:move', function () {
					//console
				});
				element.on('mouseup', function () {
					$interval.cancel(hitIntervalID);
				});
				scope.$on('draggable:end', function () {
						$interval.cancel(hitIntervalID);
						if (scope.currentConnector) {
							scope.currentConnector.removeClass('hit');
						}
						if (scope.connectorScope) {
							if( scope.connectorScope.hasOwnProperty('uiData') ) {
								scope.connectorScope.item = scope.connectorScope.uiData;
							}
							if (scope.connectorScope.item.type === LAB_TYPE.INSTRUMENT && scope.connectorScope.item.tiedWith == null) {
								if (scope.hitData.hasOwnProperty('data')) {
									var cScope = element.scope();
									console.log("HitTest: (tiedWith)", scope.hitData.data);
									scope.connectorScope.item.uiData = scope.hitData.data || scope.hitData.uiData;
									//scope.connectorScope.item.uiData.canDrag = true;
									content.addClass('sub-top');

									angular.element(content).removeAttr('ui-data');
									angular.element(content).removeAttr('ng-show');
									angular.element(content).attr('ui-data', 'item.uiData');

									$compile(angular.element(content)[0])(scope.connectorScope);
									scope.currentConnector.removeClass('hit');
									console.log(scope.currentConnector);
									scope.currentConnector.parent().prepend(angular.element(content)[0]);

									scope.connectorScope.item.tiedWith = {data: scope.hitData.data};
									$rootScope.$broadcast('clearByItemObject', scope.hitData.data || scope.hitData.uiData);

								}
							}

							if (scope.connectorScope.item.type === LAB_TYPE.CONTAINER && scope.hitData.data.type === LAB_TYPE.INSTRUMENT){
								console.log('Connection with instrument and container', hitIntervalID);
								//scope.hitData.data.connected = false;
								scope.connectorScope.item.withObj = scope.hitData.data;
								scope.connectorScope.$apply();
								$interval.cancel(hitIntervalID);
								angular.element('.hit').removeClass('hit');
							}
							scope.connectorScope = null;
							scope.currentConnector = null; //Temp fix
							scope.element = null;
						}

				});
			}
		}
	}]);