angular.module("ngDraggable", [])
        .directive('ngDrag', ['$rootScope', '$parse', function ($rootScope, $parse) {
            return {
                restrict: 'A',
                link: function (scope, element, attrs) {
                    scope.value = attrs.ngDrag;
                    $rootScope.moved = false;
                    //return;
                    var offset,_centerAnchor=false,_mx,_my,_tx,_ty,_mrx,_mry,
                        _hasTouch = ('ontouchstart' in document.documentElement),
                        _pressEvents = 'touchstart mousedown',
                        _moveEvents = 'touchmove mousemove',
                        _releaseEvents = 'touchend mouseup',
                        $document = $(document),
                        $window = $(window),
                        _data = null,
                        _dragEnabled = false,
                        _pressTimer = null,
                        onDragSuccessCallback = $parse(attrs.ngDragSuccess) || null;

                    var initialize = function () {
                        element.attr('draggable', 'false'); // prevent native drag
                        toggleListeners(scope.value || true);
                    };

                    scope.$watch('value', function (newVal, oldVal) {
                        toggleListeners(newVal || false);
                    });

                    var toggleListeners = function (enable) {
                        // remove listeners
                        if (!enable)return;
                        // add listeners.

                        scope.$on('$destroy', onDestroy);
                        //attrs.$observe("ngDrag", onEnableChange);
                        scope.$watch(attrs.ngDrag, onEnableChange);
                        //attrs.$observe('ngCenterAnchor', onCenterAnchor);
                        scope.$watch(attrs.ngCenterAnchor, onCenterAnchor);
                        scope.$watch(attrs.ngDragData, onDragDataChange);
                        element.on(_pressEvents, onpress);
                        if(! _hasTouch){
                            element.on('mousedown', function(){ return false;}); // prevent native drag
                        }
                    };
                    var onDestroy = function (enable) {
                        toggleListeners(false);
                    };
                    var onDragDataChange = function (newVal, oldVal) {
                        _data = newVal;
                    };
                    var onEnableChange = function (newVal, oldVal) {
                        _dragEnabled = (newVal);
                    };
                    var onCenterAnchor = function (newVal, oldVal) {
                        //if(angular.isDefined(newVal))
                        //_centerAnchor = (newVal || 'false');
                    };
                    /*
                     * When the element is clicked start the drag behaviour
                     * On touch devices as a small delay so as not to prevent native window scrolling
                     */
                    var onpress = function(evt) {
                        if(! _dragEnabled)return;
                        if(_hasTouch){
                            cancelPress();
                            _pressTimer = setTimeout(function(){
                                cancelPress();
                                onlongpress(evt);
                            },100);
                            $document.on(_moveEvents, cancelPress);
                            $document.on(_releaseEvents, cancelPress);
                        }else{
                            onlongpress(evt);
                        }

                    };

                    var cancelPress = function() {
                        //console.log(element, scope, attrs);
                        clearTimeout(_pressTimer);
                        $document.off(_moveEvents, cancelPress);
                        $document.off(_releaseEvents, cancelPress);
                    };

                    var onlongpress = function(evt) {
                        if(! _dragEnabled)return;
                        evt.preventDefault();
                        $(".workspace").panzoom("resetDimensions");
                        matrix = $(".workspace").panzoom("getMatrix");
                        container_offset = $(".workspace").offset();
                        offset = element.offset();
                        element.centerX = (element.width()/2);
                        element.centerY = (element.height()/2);
                        element.addClass('dragging');
                        _mx = (evt.pageX || evt.originalEvent.touches[0].pageX);
                        _my = (evt.pageY || evt.originalEvent.touches[0].pageY);

                        _mrx = _mx - offset.left;
                        _mry = _my - offset.top;

                        if (_centerAnchor) {
                            //console.log('center anchor');
                            _tx = _mx - element.centerX - $window.scrollLeft() - container_offset.left;
                            _ty = _my - element.centerY - $window.scrollTop() - container_offset.top;
                        } else {
                            _tx = offset.left - $window.scrollLeft() - container_offset.left;
                            _ty = offset.top - $window.scrollTop() - container_offset.top;
                        }

                        _tx = _tx * (1 / matrix[0]);
                        _ty = _ty * (1 / matrix[3]);

                        if (element.hasClass('drop-item')){
                            _tx = element.css('left');
                            _ty = element.css('top');
                        }

                        //moveElement(_tx, _ty);
                        $document.on(_moveEvents, onmove);
                        $document.on(_releaseEvents, onrelease);
                        $rootScope.$broadcast('draggable:start', {x:_mx, y:_my, tx:_tx, ty:_ty, event:evt, element:element, data:_data});
                    };

                    var onmove = function(evt) {
                        if(! _dragEnabled) return;
                        evt.preventDefault();
                        matrix = $(".workspace").panzoom("getMatrix");
                        container_offset = $(".workspace").offset();
                        $rootScope.moved  = true;

                        _mx = (evt.pageX || evt.originalEvent.touches[0].pageX);
                        _my = (evt.pageY || evt.originalEvent.touches[0].pageY);

                        if (_centerAnchor) {
                            _tx = _mx - element.centerX - $window.scrollLeft() - container_offset.left;
                            _ty = _my - element.centerY - $window.scrollTop() - container_offset.top;
                        } else {
                            _tx = _mx - _mrx - $window.scrollLeft() - container_offset.left;
                            _ty = _my - _mry - $window.scrollTop() - container_offset.top;
                        }

                        if(element.hasClass('drop-item')){
                            var offset = element.closest(".lab-table").offset();
                            _tx = _mx - offset.left-element.centerX-20;
                            _ty = _my - offset.top-element.centerY-9;
                        }

                        _tx = _tx * (1 / matrix[0]);
                        _ty = _ty * (1 / matrix[3]);

                        moveElement(_tx, _ty);
                        $rootScope.$broadcast('draggable:move', {x:_mx, y:_my, tx:_tx, ty:_ty, event:evt, element:element, data:_data});
                    };

                    var onrelease = function(evt) {
                        if(! _dragEnabled)return;
                        evt.preventDefault();

                        if($rootScope.moved){
                            reset();
                        }

                        $rootScope.$broadcast('draggable:end', {x:_mx, y:_my, tx:_tx, ty:_ty, event:evt, element:element, data:_data, callback:onDragComplete});
                        element.removeClass('dragging');

                        $document.off(_moveEvents, onmove);
                        $document.off(_releaseEvents, onrelease);

                        $rootScope.moved = false;
                        var myNumber = parseInt(evt.pageY),
                            tableTop = Math.ceil($('.lab-table').offset().top),
                            tableBottom = tableTop + $('.lab-table').height();

                        if (myNumber < tableTop)
                            reset();

                        // if (myNumber < tableTop)
                        //     reset();
                    };

                    var onDragComplete = function(evt) {
                        if(! onDragSuccessCallback)return;

                        scope.$apply(function () {
                            onDragSuccessCallback(scope, {$data: _data, $event: evt});
                        });
                    };

                    var reset = function() {
                        element.css({left:'',top:'', position:'', 'z-index':'', margin: ''});
                    };

                    var moveElement = function(x,y) {
                        element.css({left:x, top:y, position:'fixed', 'z-index':99999, margin: '0'});
                    };

                    initialize();
                }
            }
        }])
        .directive('ngDrop', ['$parse', '$timeout','$rootScope', function ($parse, $timeout , $rootScope) {
            return {
                restrict: 'A',
                link: function (scope, element, attrs) {
                    scope.value = attrs.ngDrop;

                    var _dropEnabled=false;

                    var onDropCallback = $parse(attrs.ngDropSuccess);// || function(){};
                    var initialize = function () {
                        toggleListeners(true);
                    };

                    var toggleListeners = function (enable) {
                        // remove listeners

                        if (!enable)return;
                        // add listeners.
                        attrs.$observe("ngDrop", onEnableChange);
                        scope.$on('$destroy', onDestroy);
                        //scope.$watch(attrs.uiDraggable, onDraggableChange);
                        scope.$on('draggable:start', onDragStart);
                        scope.$on('draggable:move', onDragMove);
                        scope.$on('draggable:end', onDragEnd);
                    };
                    var onDestroy = function (enable) {
                        toggleListeners(false);
                    };
                    var onEnableChange = function (newVal, oldVal) {
                        _dropEnabled=scope.$eval(newVal);
                    }
                    var onDragStart = function(evt, obj) {
                        if(! _dropEnabled)return;
                        isTouching(obj.x,obj.y,obj.element);
                    }
                    var onDragMove = function(evt, obj) {
                        if(! _dropEnabled)return;
                        isTouching(obj.x,obj.y,obj.element);
                    }
                    var onDragEnd = function(evt, obj) {
                        if(! _dropEnabled)return;
                        if(isTouching(obj.x,obj.y,obj.element)){
                            // call the ngDraggable ngDragSuccess element callback
                            if(obj.callback){
                               obj.callback(obj);
                            }

                            // call the ngDrop element callback
                            //   scope.$apply(function () {
                            //       onDropCallback(scope, {$data: obj.data, $event: evt});
                            //   });
                            if($rootScope.moved){
                                $timeout(function(){
                                    var offset = element.offset();
                                    obj.data.x = obj.x - offset.left-obj.element.centerX-20;
                                    obj.data.y = obj.y - offset.top-obj.element.centerY-30;

									if (element.hasClass("side-table"))
									{
										if (element.attr("id") == "triangle-topright")
										{
											obj.data.x += offset.left;
										}
										obj.data.y += $(".lab-table").height();
									}

									if (element.attr("id") == "triangle-topleft")
									{
										if (obj.data.x + obj.element.centerX < element[0].offsetWidth && 
											obj.data.y + obj.element.centerY >= element[0].offsetHeight)
										{
											var ratio = ((obj.data.x + obj.element.centerX) / element[0].offsetWidth);

											obj.data.y = obj.data.y - (element[0].offsetHeight * ratio);
										} else if (obj.data.x + obj.element.centerX >= element[0].offsetWidth && 
											obj.data.y + obj.element.centerY < element[0].offsetHeight) {
											var ratio = ((obj.data.y + obj.element.centerY) / element[0].offsetHeight);
											obj.data.x = obj.data.x - (element[0].offsetWidth * ratio);
										}
									} else if (element.attr("id") == "triangle-topright")
									{
										var tWidth = obj.data.x - offset.left;
										if (tWidth > 0 && tWidth < element[0].offsetWidth && 
											obj.data.y + obj.element.centerY >= element[0].offsetHeight)
										{
											var ratio = ((tWidth) / element[0].offsetWidth);

											obj.data.y = obj.data.y - (element[0].offsetHeight * ratio);
										} else {
											var ratio = (obj.y - $(".lab-table").height() - $(".lab-table").offset().top) / element[0].offsetHeight;
											obj.data.x = obj.data.x + (element[0].offsetWidth * ratio);
										}
									}

                                    onDropCallback(scope, {$data: obj.data, $event: obj});
                                });
                            }
                        }
                        updateDragStyles(false, obj.element);
                    };
                    var isTouching = function(mouseX, mouseY, dragElement) {
                        var touching= hitTest(mouseX, mouseY);
                        updateDragStyles(touching, dragElement);
                        return touching;
                    }
                    var updateDragStyles = function(touching, dragElement) {
                        if(touching){
                            element.addClass('drag-enter');
                            dragElement.addClass('drag-over');
                        }else{
                            element.removeClass('drag-enter');
                            dragElement.removeClass('drag-over');
                        }
                    }
                    var hitTest = function(x, y) {
                        var bounds = element.offset();
                        bounds.right = bounds.left + element.outerWidth();
                        bounds.bottom = bounds.top + element.outerHeight();
                        return x >= bounds.left
                                && x <= bounds.right
                                && y <= bounds.bottom
                                && y >= bounds.top;
                    }

                    initialize();
                }
            }
        }])
        .directive('ngDragClone', ['$parse', '$timeout', function ($parse, $timeout) {
            return {
                restrict: 'A',
                link: function (scope, element, attrs) {
                    var img, _allowClone=true;
                    element = $(element[0]);
                    scope.clonedData = {};
                    var initialize = function () {

                        img = $(element.find('img'));
                        element.attr('draggable', 'false');
                        img.attr('draggable', 'false');
                        reset();
                        toggleListeners(true);
                    };


                    var toggleListeners = function (enable) {
                        // remove listeners

                        if (!enable)return;
                        // add listeners.
                        scope.$on('draggable:start', onDragStart);
                        scope.$on('draggable:move', onDragMove);
                        scope.$on('draggable:end', onDragEnd);
                        preventContextMenu();

                    };
                    var preventContextMenu = function() {
                      //  element.off('mousedown touchstart touchmove touchend touchcancel', absorbEvent_);
                        img.off('mousedown touchstart touchmove touchend touchcancel', absorbEvent_);
                      //  element.on('mousedown touchstart touchmove touchend touchcancel', absorbEvent_);
                        img.on('mousedown touchstart touchmove touchend touchcancel', absorbEvent_);
                    }
                    var onDragStart = function(evt, obj, elm) {
                        _allowClone=true
                        if(angular.isDefined(obj.data.allowClone)){
                            _allowClone=obj.data.allowClone;
                        }
                        if(_allowClone) {
                            scope.$apply(function () {
                                scope.clonedData = obj.data;
                            });
                            element.css('width', obj.element.width());
                            element.css('height', obj.element.height());

                            moveElement(obj.tx, obj.ty);
                        }
                    }
                    var onDragMove = function(evt, obj) {
                        if(_allowClone) {
                            moveElement(obj.tx, obj.ty);
                        }
                    }
                    var onDragEnd = function(evt, obj) {
                        //moveElement(obj.tx,obj.ty);
                        if(_allowClone) {
                            reset();
                        }
                    }

                    var reset = function() {
                        element.css({left:0,top:0, position:'fixed', 'z-index':-1, visibility:'hidden'});
                    }
                    var moveElement = function(x,y) {
                        element.css({left:x,top:y, position:'fixed', 'z-index':99999, visibility:'visible'});
                    }

                    var absorbEvent_ = function (event) {
                        var e = event.originalEvent;
                        e.preventDefault && e.preventDefault();
                        e.stopPropagation && e.stopPropagation();
                        e.cancelBubble = true;
                        e.returnValue = false;
                        return false;
                    }

                    initialize();
                }
            }
        }])
        .directive('ngDropOver', ['$interal', function($interal){
          return {
            restrict: 'A',
            link: function($scope, element, attrs){

            }
          }
        }])
        .directive('ngPreventDrag', ['$parse', '$timeout', function ($parse, $timeout) {
            return {
                restrict: 'A',
                link: function (scope, element, attrs) {
                    var initialize = function () {

                        element.attr('draggable', 'false');
                        toggleListeners(true);
                    };


                    var toggleListeners = function (enable) {
                        // remove listeners

                        if (!enable)return;
                        // add listeners.
                        element.on('mousedown touchstart touchmove touchend touchcancel', absorbEvent_);
                    };


                    var absorbEvent_ = function (event) {
                        var e = event.originalEvent;
                        e.preventDefault && e.preventDefault();
                        e.stopPropagation && e.stopPropagation();
                        e.cancelBubble = true;
                        e.returnValue = false;
                        return false;
                    }

                    initialize();
                }
            }
        }]);