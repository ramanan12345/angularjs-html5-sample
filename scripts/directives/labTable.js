angular.module("labDirectives")
	.directive('tableItem', ['$rootScope', 'LAB_CONSTS', '$timeout', '$interval', 'LAB_TYPE', function ($rootScope, LAB_CONSTS, $timeout, $interval, LAB_TYPE) {
		return {
			templateUrl: 'templates/table-item.html',
			restrict: 'EA',
			replace: false,
			scope: {
				item: "="
			},
			link: function ($scope, element, attrs) {

				$scope.LAB_TYPE = LAB_TYPE;

				var SteamEffect = null;
				var BubbleEffect = null;
				var objLiquid = null;

				//Graphic context for subitem object
				var subItem = element.find('#subItem')[0];

				//console.log("Sub item:", subItem);

				$scope.$on('draggable:start', function (event, data) {
					//console.log(data.data, $scope.item );
					//console.log(angular.equals(data.data, $scope.item.tiedWith.data));
					if (data.data.name === "beaker" &&
						$scope.item.name === 'heater' &&
						$scope.item.hasOwnProperty('tiedWith')) {
						if (angular.isDefined($scope.item.tiedWith) && angular.equals(data.data, $scope.item.tiedWith.data)) {
							$scope.ungroup = true; //un group this item
							$scope.item.tiedWith.data.animate = false; //stop animation (beaker)
							$scope.flame = 'off'; //stop animation flame
							element.find("#audioFire")[0].pause(); //pause audio
							element.find('.tripod-combine').remove();
							if($scope.item.hasOwnProperty('uiData')){
								$scope.item.uiData.withObj = undefined;
								delete $scope.item.uiData.withObj;
							}
						}
					}
				});

				$scope.$on('draggable:end', function (event, data) {
					if ($scope.ungroup) {
						if (angular.isDefined($scope.item.tiedWith) && angular.equals(data.data, $scope.item.tiedWith.data)) {
							matrix = $(".workspace").panzoom("getMatrix");
							$scope.item.tiedWith.data.ungroup = true;
							$scope.ungroup = false;
							$scope.item.y += 120 * matrix[0];
							console.log("Uncombined:", $scope.item);
							delete $scope.item.tiedWith;
							//$scope.item.uiData = undefined;
							console.log((new Date()).toLocaleTimeString()+':hide beaker.....');
							element.find('.sub-top').remove();
						}
					}
				});

				var subItemContext = subItem.getContext('2d');

				var canvas = element.find('#item')[0];
				var context = canvas.getContext('2d');

				var flame_canvas = element.find('.flame');

				var flame_context = null;

				if (flame_canvas.length > 2) {
					console.log(flame_canvas.length);
					flame_canvas = flame_canvas[flame_canvas.length - 1];
				} else {
					flame_canvas = flame_canvas[0];
				}

				flame_context = flame_canvas.getContext('2d');

				var imageObj = new Image();
				var subImage = new Image();
				var moving = 0;
				var start = 0;
				var prev = 0;
				var padding = 25;

				var direction = 1;
				var scale = 1;
				var scale_p = 1;

				var imgWidth = 60;
				var imgHeight = 138;

				var y1, y2;

				var intervalId, a = 0, b = 3; // for flame

				var reduceSpeed = 1;
				//var scale         = 60 / 384;

				var sWidth = 0;
				var sHeight = 0;

				var bWidth = 0;
				var bHeight = 0;

				var fps = {
					startTime: 0,
					frameNumber: 0,
					getFPS: function () {
						this.frameNumber++;
						var d = new Date().getTime(),
							currentTime = ( d - this.startTime ) / 1000,
							result = Math.floor(( this.frameNumber / currentTime ));

						if (currentTime > 1) {
							this.startTime = new Date().getTime();
							this.frameNumber = 0;
						}
						return result;

					}
				};

				//celsius2fahrenheit
				$scope.scales = {};
				var temperature;
				// flame status: off|small|medium|high
				$scope.flame = 'off';


				$scope.convertTemperature = function () {
					if ($scope.scales.current === "C") {
						temperature = parseFloat(temperature) * 9 / 5 + 32;
						$scope.scales.current = "F";
					} else if ($scope.scales.current === "F") {
						$scope.scales.current = "C";
						temperature = (parseFloat(temperature) - 32) * 5 / 9;
					}
					return drawTemperature(subItemContext, temperature);
				};

				$scope.adjustFlame = function (event) {
					// change flame status
					angular.element(event.currentTarget).find('.heater-wheel-smaller').addClass('rotate');


					if ($scope.flame === 'off') {
						$scope.flame = 'low';
						element.find("#audioFire")[0].play();
						if ($scope.item.hasOwnProperty('tiedWith')) {
							$scope.item.tiedWith.data.animate = true;
						}
					} else if ($scope.flame === 'low') {
						$scope.flame = 'medium';
						element.find('#flame-type').val();
						element.find("#audioFire")[0].play();
					} else if ($scope.flame === 'medium') {
						$scope.flame = 'high';
						element.find("#audioFire")[0].play();
					} else if ($scope.flame === 'high') {
						$scope.flame = 'off';
						element.find("#audioFire")[0].pause();
						$scope.item.tiedWith.data.animate = false;
					}

					$timeout(function () {
						angular.element(event.currentTarget).find('.heater-wheel-smaller').removeClass('rotate');
					}, 2000);

					// draw flame
					$interval.cancel(intervalId);

					intervalId = $interval(function () {
						drawFlame(); // update DOM
					}, 100 / 60);

					//call bubbles and steam
					//BUBBLEEFFECT
					//STEAMEFFECT


				}

				element.on('$destroy', function () {
					$interval.cancel(intervalId);
				});

				function drawFlame() {
					// prepare increment step
					a = Math.floor(Math.random() * 18) - 9;
					//a = a + b;
					if (a >= 9) {
						b = -3;
					}
					if (a <= -9) {
						b = 3;
					}

					max = 2;
					min = -2;

					c = Math.floor(Math.random() * (max - min)) + min;

					var flameCanvasWidth = flame_canvas.width;
					var flameCanvasHeight = flame_canvas.height;

					var flameHeight = flameCanvasHeight * 0.85;
					var flameBottom = flameCanvasHeight - 2;


					var halfCanvasWidth = flameCanvasWidth / 2;

					// clear canvas
					flame_context.clearRect(0, 0, flameCanvasWidth, flameCanvasHeight);

					if ($scope.flame === 'low') {
						// coordinates of different layer
						var redLayerWidth = 8, yellowLayerWidth = 6, whiteLayerWidth = 4;
						var halfRedLayerWidth = redLayerWidth / 2, halfYellowLayerWidth = yellowLayerWidth / 2, halfWhiteLayerWidth = whiteLayerWidth / 2;

						// red layer
						var x_left_point_red = halfCanvasWidth - halfRedLayerWidth;
						var x_right_point_red = halfCanvasWidth + halfRedLayerWidth;

						// yellow layer
						var x_left_point_yellow = halfCanvasWidth - halfYellowLayerWidth;
						var x_right_point_yellow = halfCanvasWidth + halfYellowLayerWidth;

						// white layer
						var x_left_point_white = halfCanvasWidth - halfWhiteLayerWidth;
						var x_right_point_white = halfCanvasWidth + halfWhiteLayerWidth;

						// for bottom curve
						var x_left_ctrl_point_1 = halfCanvasWidth;
						var y_left_ctrl_point_1 = flameHeight + 10;

						var x_left_ctrl_point_2 = halfCanvasWidth - 2;
						var y_left_ctrl_point_2 = flameHeight + 3;

						var x_right_ctrl_point_1 = halfCanvasWidth + 5;
						var y_right_ctrl_point_1 = flameHeight + 5;

						var x_right_ctrl_point_2 = halfCanvasWidth;
						var y_right_ctrl_point_2 = flameHeight + 2;

						// red layer
						flame_context.globalAlpha = 0.2;
						flame_context.beginPath();
						flame_context.moveTo(x_left_point_red, flameHeight);
						flame_context.lineTo(halfCanvasWidth, 20);
						flame_context.lineTo(x_right_point_red, flameHeight);

						flame_context.bezierCurveTo(x_right_ctrl_point_1, y_right_ctrl_point_1, x_right_ctrl_point_2, y_right_ctrl_point_2, halfCanvasWidth, flameBottom + c);
						//flame_context.moveTo(x_left_point_red, flameHeight);
						flame_context.bezierCurveTo(x_left_ctrl_point_1, y_left_ctrl_point_1, x_left_ctrl_point_2, y_left_ctrl_point_2, x_left_point_red, flameHeight);

						flame_context.fillStyle = '#eee';
						flame_context.shadowColor = 'orangered';
						flame_context.shadowBlur = 5;
						flame_context.shadowOffsetX = 0;
						flame_context.shadowOffsetY = -5;
						flame_context.fill();

						// yellow layer
						flame_context.globalAlpha = 0.8;
						flame_context.beginPath();
						flame_context.moveTo(x_left_point_yellow, flameHeight);
						flame_context.lineTo(halfCanvasWidth, 50 + a);
						flame_context.lineTo(x_right_point_yellow, flameHeight);

						flame_context.bezierCurveTo(x_right_ctrl_point_1, y_right_ctrl_point_1, x_right_ctrl_point_2, y_right_ctrl_point_2, halfCanvasWidth, flameBottom + c);
						//flame_context.moveTo(x_left_point_yellow, flameHeight);
						flame_context.bezierCurveTo(x_left_ctrl_point_1, y_left_ctrl_point_1, x_left_ctrl_point_2, y_left_ctrl_point_2, x_left_point_yellow, flameHeight);
						flame_context.fillStyle = 'yellow';
						flame_context.fill();

						// white layer
						flame_context.globalAlpha = 0.8;
						flame_context.beginPath();
						flame_context.moveTo(x_left_point_white, flameHeight);
						flame_context.lineTo(halfCanvasWidth, 60 + a);
						flame_context.lineTo(x_right_point_white, flameHeight);

						flame_context.bezierCurveTo(x_right_ctrl_point_1, y_right_ctrl_point_1, x_right_ctrl_point_2, y_right_ctrl_point_2, halfCanvasWidth, flameBottom + c);
						//flame_context.moveTo(x_left_point_white, flameHeight);
						flame_context.bezierCurveTo(x_left_ctrl_point_1, y_left_ctrl_point_1, x_left_ctrl_point_2, y_left_ctrl_point_2, x_left_point_white, flameHeight);
						flame_context.fillStyle = 'white';
						flame_context.fill();

						// outer layer
						flame_context.globalAlpha = 0.2;
						flame_context.beginPath();
						flame_context.moveTo(halfCanvasWidth - 6, flameCanvasHeight);
						flame_context.lineTo(halfCanvasWidth, 20);
						flame_context.lineTo(halfCanvasWidth + 6, flameCanvasHeight);

						flame_context.fillStyle = '#eee';
						flame_context.shadowColor = '#330000';
						flame_context.shadowBlur = 15;
						flame_context.shadowOffsetX = 0;
						flame_context.shadowOffsetY = -5;
						flame_context.fill();
					} else if ($scope.flame === 'medium') {
						// coordinates of different layer
						var cyanLayerWidth = 8;
						var halfCyanLayerWidth = cyanLayerWidth / 2;

						// cyan layer
						var x_left_point_cyan = halfCanvasWidth - halfCyanLayerWidth;
						var x_right_point_cyan = halfCanvasWidth + halfCyanLayerWidth;

						// for bottom curve
						var x_left_ctrl_point_1 = halfCanvasWidth;
						var y_left_ctrl_point_1 = flameHeight + 10;

						var x_left_ctrl_point_2 = halfCanvasWidth - 2;
						var y_left_ctrl_point_2 = flameHeight + 3;

						var x_right_ctrl_point_1 = halfCanvasWidth + 5;
						var y_right_ctrl_point_1 = flameHeight + 5;

						var x_right_ctrl_point_2 = halfCanvasWidth;
						var y_right_ctrl_point_2 = flameHeight + 2;

						// cyan layer
						flame_context.globalAlpha = 0.5;
						flame_context.beginPath();
						flame_context.moveTo(x_left_point_cyan, flameHeight);
						flame_context.lineTo(halfCanvasWidth, 20);
						flame_context.lineTo(x_right_point_cyan, flameHeight);
						//context.quadraticCurveTo(250, 0, 265, flameHeight);
						//context.lineTo(250, flameBottom);
						flame_context.bezierCurveTo(x_right_ctrl_point_1, y_right_ctrl_point_1, x_right_ctrl_point_2, y_right_ctrl_point_2, halfCanvasWidth, flameBottom + c);
						//flame_context.moveTo(x_left_point_cyan, flameHeight);
						flame_context.bezierCurveTo(x_left_ctrl_point_1, y_left_ctrl_point_1, x_left_ctrl_point_2, y_left_ctrl_point_2, x_left_point_cyan, flameHeight);

						flame_context.fillStyle = '#eee';
						flame_context.shadowColor = 'cyan';
						flame_context.shadowBlur = 10;
						flame_context.shadowOffsetX = 0;
						flame_context.shadowOffsetY = 0;
						flame_context.fill();
					} else if ($scope.flame === 'high') {
						flameCanvasHeight - 10;
						// coordinates of different layer
						var blueLayerWidth = 8, light_blueLayerWidth = 6, whiteLayerWidth = 4;
						var halfblueLayerWidth = blueLayerWidth / 2, halfLightBlueLayerWidth = light_blueLayerWidth / 2, halfWhiteLayerWidth = whiteLayerWidth / 2;

						// blue layer
						var x_left_point_blue = halfCanvasWidth - halfblueLayerWidth;
						var x_right_point_blue = halfCanvasWidth + halfblueLayerWidth;

						// light blue layer
						var x_left_point_light_blue = halfCanvasWidth - halfLightBlueLayerWidth;
						var x_right_point_light_blue = halfCanvasWidth + halfLightBlueLayerWidth;

						// white layer
						var x_left_point_white = halfCanvasWidth - halfWhiteLayerWidth;
						var x_right_point_white = halfCanvasWidth + halfWhiteLayerWidth;

						// for bottom curve
						var x_left_ctrl_point_1 = halfCanvasWidth;
						var y_left_ctrl_point_1 = flameHeight + 10;

						var x_left_ctrl_point_2 = halfCanvasWidth - 2;
						var y_left_ctrl_point_2 = flameHeight + 3;

						var x_right_ctrl_point_1 = halfCanvasWidth + 5;
						var y_right_ctrl_point_1 = flameHeight + 5;

						var x_right_ctrl_point_2 = halfCanvasWidth;
						var y_right_ctrl_point_2 = flameHeight + 2;

						// outer layer
						flame_context.globalAlpha = 0.2;
						flame_context.beginPath();
						flame_context.moveTo(halfCanvasWidth - 6, flameCanvasHeight);
						flame_context.lineTo(halfCanvasWidth, 20);
						flame_context.lineTo(halfCanvasWidth + 6, flameCanvasHeight);

						flame_context.fillStyle = '#eee';
						flame_context.shadowColor = 'blue';
						flame_context.shadowBlur = 15;
						flame_context.shadowOffsetX = 0;
						flame_context.shadowOffsetY = -5;
						flame_context.fill();

						// blue layer
						flame_context.globalAlpha = 0.2;
						flame_context.beginPath();
						flame_context.moveTo(x_left_point_blue, flameHeight);
						flame_context.lineTo(halfCanvasWidth, 20);
						flame_context.lineTo(x_right_point_blue, flameHeight);

						flame_context.bezierCurveTo(x_right_ctrl_point_1, y_right_ctrl_point_1, x_right_ctrl_point_2, y_right_ctrl_point_2, halfCanvasWidth, flameBottom + c);
						//flame_context.moveTo(x_left_point_blue, flameHeight);
						flame_context.bezierCurveTo(x_left_ctrl_point_1, y_left_ctrl_point_1, x_left_ctrl_point_2, y_left_ctrl_point_2, x_left_point_blue, flameHeight);

						flame_context.fillStyle = '#eee';
						flame_context.shadowColor = 'blue';
						flame_context.shadowBlur = 10;
						flame_context.shadowOffsetX = 0;
						flame_context.shadowOffsetY = 0;
						flame_context.fill();

						// lightblue layer
						flame_context.globalAlpha = 0.8;
						flame_context.beginPath();
						flame_context.moveTo(x_left_point_light_blue, flameHeight);
						flame_context.lineTo(halfCanvasWidth, 60 + a);
						flame_context.lineTo(x_right_point_light_blue, flameHeight);

						flame_context.bezierCurveTo(x_right_ctrl_point_1, y_right_ctrl_point_1, x_right_ctrl_point_2, y_right_ctrl_point_2, halfCanvasWidth, flameBottom + c);
						//flame_context.moveTo(x_left_point_light_blue, flameHeight);
						flame_context.bezierCurveTo(x_left_ctrl_point_1, y_left_ctrl_point_1, x_left_ctrl_point_2, y_left_ctrl_point_2, x_left_point_light_blue, flameHeight);
						flame_context.fillStyle = 'lightblue';
						flame_context.fill();

						// white layer
						flame_context.globalAlpha = 0.8;
						flame_context.beginPath();
						flame_context.moveTo(x_left_point_white, flameHeight);
						flame_context.lineTo(halfCanvasWidth, 70 + a);
						flame_context.lineTo(x_right_point_white, flameHeight);

						flame_context.bezierCurveTo(x_right_ctrl_point_1, y_right_ctrl_point_1, x_right_ctrl_point_2, y_right_ctrl_point_2, halfCanvasWidth, flameBottom + c);
						//flame_context.moveTo(x_left_point_white, flameHeight);
						flame_context.bezierCurveTo(x_left_ctrl_point_1, y_left_ctrl_point_1, x_left_ctrl_point_2, y_left_ctrl_point_2, x_left_point_white, flameHeight);
						flame_context.fillStyle = 'white';
						flame_context.fill();
					} else if ($scope.flame === 'off') {
						$interval.cancel(intervalId);
					}

					if (angular.element("#flame_fps").length > 0) {
						angular.element("#flame_fps").text("Flame FPS: " + fps.getFPS());
					}
				}

				/// End of flame


				function init() {
					imageObj.onload = function () {
						draw_change_size(imageObj, 138, imageObj.width, imageObj.height);
					};
					imageObj.src = $scope.item.thumbnail;
					if ($scope.item.hasOwnProperty('withObj')) {
						var subItem = $scope.item.withObj;
						if (subItem) {
							if (subItem.type === LAB_CONSTS.MAT_TYPE.ins) {
								drawSubItem(subItem.thumbnail);
							}
						}
					}
				}

				//drawing water starts

				function draw_change_size(image, newHeight, imageWidth, imageHeight) {
					imgHeight = newHeight * 1;
					imgWidth = imgHeight * (imageWidth / imageHeight);

					scale_p = scale;
					scale = imgHeight / imageHeight;

					y1 = y1 * (scale / scale_p);
					y2 = y2 * (scale / scale_p);

					canvas.width = imgWidth;
					canvas.height = imgHeight;

					context.drawImage(image, 0, 0, imgWidth, imgHeight);
				}

				window.requestAnimFrame = (function (callback) {
					return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame ||
					function (callback) {
						window.setTimeout(callback, 1000 / 60);
					};
				})();
				function do_animate(startTime) {
					var time = (new Date()).getTime() - startTime;
					var speed = 50 * scale;

					y1 = imgHeight * 0.42 - time / 1000 * speed * direction - start * scale + padding * scale;
					y2 = imgHeight * 1.30 - time / 1000 * speed * direction - start * scale + padding * scale;

					if (time / 1000 * speed >= moving * scale) {
						start = prev;
						return;
					}

					draw_liquid(y1, y2);

					requestAnimFrame(function () {
						do_animate(startTime);
					});
				};
				function view_animate(total) {
					var time = (new Date()).getTime();
					var nlimit = total * 1;

					if (nlimit < prev)
						direction = -1;
					else
						direction = 1;


					moving = Math.abs(nlimit - prev);
					prev = nlimit;

					do_animate(time);
				}

				function draw_liquid(y1, y2) {

					context.clearRect(0, 0, imgWidth, imgHeight);
					context.beginPath();
					context.arc(imgWidth * 0.55, y1, imgWidth * 0.62, 0, Math.PI * 2, true); // Outer circle

					context.fillStyle = '#95999f';
					context.fill();

					context.globalCompositeOperation = "destination-atop";

					context.beginPath();
					context.arc(imgWidth * 0.55, y2, imgWidth * 0.7, 0, Math.PI * 2, true); // Outer circle

					context.fillStyle = '#a6abb2';
					context.fill();

					context.drawImage(imageObj, 0, 0, imgWidth, imgHeight);
					context.globalCompositeOperation = "destination-atop";
				}

				//$scope.$watch('item.liquidTotal', function (newValue, oldValue) {
				//  var total = parseInt(newValue);
				//  if (total) {
				//    view_animate(total);
				//  }
				//});

				//function drawTemperature( ctx, temperature ){
				//  var temp = parseFloat( temperature ) || 0.0;
				//  if( temp !== undefined ) {
				//    element.find('#temp').text(temp +  $scope.scales.current);
				//  }
				//}


				$scope.$watch('item.tiedWith', function () {
					if ($scope.item.tiedWith && $scope.item.tiedWith.data.name === 'beaker') {
						$scope.item.tiedWith.data.ungroup = false;
						if (flame_canvas) {
							angular.element(flame_canvas)
								.after('<img src="/images/lab/tripod.png" class="tripod-combine"/>')
								.addClass('flame-heating');
							matrix = $(".workspace").panzoom("getMatrix");
							$scope.item.y = $scope.item.y - 120 * matrix[3]; // After combined, the height increase 120, so adjust top pos by substract 120 to keep same pos
							console.log("Combined Position", $scope.item);
						}
					}
				});
				if ($scope.item.name !== 'beaker') {
					init();
				} else {
					//init();
					return; //@todo inititalize beaker
				}

			}
		}
	}])
	.directive("labTable", ["$timeout", "$document", "uuid", "LAB_CONSTS", function ($timeout, $document, uuid, LAB_CONSTS) {
		return {
			templateUrl: "templates/lab-table.html",
			restrict: "EA",
			replace: true,
			scope: {
				tableItems: '=',
				dragTimers: '=',
				matrix: '='
			},
			link: function (scope, element, attrs) {
				var dragAreaElem = angular.element('.lab-table');

				scope.dropTo = {};
				scope.currentDropItem = {};
				scope.$on('draggable:end', function (event, result) {
					var maxBottom = dragAreaElem.offset().top + dragAreaElem.height();
					var maxTop = dragAreaElem.offset().top;

					if (result.y > maxBottom || result.y < maxTop) {

						angular.element(result.element).offset({
							left: result.data.x,
							top: result.data.y + maxTop
						});
						//result.element.offsetTop = result.data.y;
					}
				});
				scope.isPointInPoly = function (poly, pt) {
					for (var c = false, i = -1, l = poly.length, j = l - 1; ++i < l; j = i)
						((poly[i].y <= pt.y && pt.y < poly[j].y) || (poly[j].y <= pt.y && pt.y < poly[i].y))
						&& (pt.x < (poly[j].x - poly[i].x) * (pt.y - poly[i].y) / (poly[j].y - poly[i].y) + poly[i].x)
						&& (c = !c);
					return c;
				};
				scope.onDropComplete = function ($data, event) {

					var canDropToTable = true;
					scope.currentDropItem = $data;

					if (!$data.uuid) {

						if ($data.hasOwnProperty('type') && $data.type === 'timer') {
							return;
						}

						switch ($data.type) {
							case LAB_CONSTS.MAT_TYPE.con:
								break;
							case LAB_CONSTS.MAT_TYPE.ins:

								canDropToTable = false;
								var point = {x: event.x, y: event.y - event.ty};
								dragToContainer = false;

								if ($data.name !== 'termometer') {
									canDropToTable = true;
									break;
								}

								//console.log($data);
								matrix = $(".workspace").panzoom("getMatrix");

								angular.forEach(scope.tableItems, function (obj, index) {
									var points = [
										{x: obj.x - 20 * matrix[0], y: obj.y - 120 * matrix[3]},
										{x: obj.x + 300 * matrix[0], y: obj.y - 120 * matrix[3]},
										{x: obj.x + 300 * matrix[0], y: obj.y + 120 * matrix[3]},
										{x: obj.x - 20 * matrix[0], y: obj.y + 120 * matrix[3]},
										{x: obj.x - 20 * matrix[0], y: obj.y - 120 * matrix[3]}
									];

									// if drag to current container, then remember it and popup modal
									if (scope.isPointInPoly(points, point)) {
										scope.dropTo = obj;
										dragToContainer = true;
										//canDropToTable = true;
										obj.withObj = $data; // Group with object
									}

								});

								if (!dragToContainer) {
									scope.showModalForm('errorModal');
								}
								break;
							case LAB_CONSTS.MAT_TYPE.mat:
								canDropToTable = false;


								point = {x: event.x, y: event.y - event.ty};

								var dragToContainer = false;
								angular.forEach(scope.tableItems, function (obj, index) {
									points = [
										{x: obj.x - 20 * matrix[0], y: obj.y - 120 * matrix[3]},
										{x: obj.x + 300 * matrix[0], y: obj.y - 120 * matrix[3]},
										{x: obj.x + 300 * matrix[0], y: obj.y + 120 * matrix[3]},
										{x: obj.x - 20 * matrix[0], y: obj.y + 120 * matrix[3]},
										{x: obj.x - 20 * matrix[0], y: obj.y - 120 * matrix[3]}
									];


									// if drag to current container, then remember it and popup modal
									if (scope.isPointInPoly(points, point)) {
										//console.log(points);
										//console.log(point);
										//console.log("drag to " + obj.name + ": " + obj.uuid);
										scope.dropTo = obj;

										scope.showModalForm('inputModal');
										dragToContainer = true;
									}
								});

								if (!dragToContainer) {
									scope.showModalForm('errorModal');
								}

								break;
						}

						console.log(canDropToTable);
						// check if object can be put on table
						if (canDropToTable) {
							console.log('Add item to lab table');
							var temp = {};
							angular.copy($data, temp);
							temp.uuid = uuid.new();
							scope.tableItems.push(temp);
						}

						//function checkContainer(){
						//    var flag = false;
						//    angular.forEach(scope.tableItems , function(obj , index){
						//           if(obj.type===LAB_CONSTS.MAT_TYPE.con){
						//                flag =  true;
						//           }
						//    });
						//    return flag;
						//}

						// check if point is in a polygon

					} else {
						$timeout(function () {
							if (canDropToTable) {
								if ($data.type === LAB_CONSTS.MAT_TYPE.con && scope.tableItems.indexOf($data) == -1) {
									console.log('Data: >>>', $data);
									if ($data.ungroup) {
										scope.tableItems.push($data);
									}
								}
							}
						},100)
					}
				};

				// submit modal form
				scope.submit = function () {
					angular.element('#inputModal').addClass('hide').removeClass('show');
					var total = parseFloat(scope.formText);
					//console.log(total);
					//scope.dropTo.liquidTotal = total;
					//console.log("Set total to obj:", scope.dropTo);

					angular.forEach(scope.tableItems, function (item, index) {
						if (angular.equals(item, scope.dropTo)) {
							scope.tableItems[index].liquidTotal = total;
							//Add temperature if not exist set by default 21.5C
							scope.tableItems[index].temperature = scope.currentDropItem.temperature || 21.5;
						}
					});

					console.log(scope.tableItems);
					//scope.tableItems.index
				};

				// show modal form
				scope.showModalForm = function (modal) {
					//console.log("show modal form");
					angular.element("#" + modal).addClass('show').removeClass('hide');
					angular.element("#" + modal + " input[name='text']").focus();
				};

				// close modal
				scope.closeModal = function (modal) {
					angular.element('#' + modal).addClass('hide').removeClass('show');
				};
			}
		}
	}])
	.directive('onlyDigits', function () {
		return {
			require: 'ngModel',
			restrict: 'A',
			link: function (scope, element, attr, ctrl) {
				function inputValue(val) {
					if (val) {
						var digits = val.replace(/[^0-9.]/g, ''),
							max = 200;

						if (digits > max)
							digits = digits.slice(0, -1)

						if (digits !== val) {
							ctrl.$setViewValue(digits);
							ctrl.$render();
						}

						return parseFloat(digits);
					}
					return undefined;
				}

				ctrl.$parsers.push(inputValue);
			}
		}
	});