'use strict';

/**
 * Beaker
 */
angular.module('labDirectives')
  .directive('beaker', ['LAB_CONSTS', '$interval', '$timeout', function(LAB_CONSTS, $interval, $timeout){
    return {
      restrict: 'AE',
      templateUrl: 'templates/beaker.html',
	    transclude: true,
	    scope: {
        uiData: '='
      },
      link: function(scope, element, attrs){
        //init beaker
        var SteamTimer    = 10;
        var SteamEffect   = null;
        var BubbleEffect  = null;
        var WaterTimer    = null;
        var objLiquid     = null;
        var reduceSpeed   = 1;
        var scale         = 110 / 384;
	      var subItemScale  = scale;
        var sWidth        = 0;
        var sHeight       = 0;

        var bWidth        = 0;
        var bHeight       = 0;

        var scale_p = 0;
				var subItemScaleP = scale_p;

        var subImage = new Image();

        var y1, y2, subItemY1, subItemY2;

        scope.scales = {};
        //scope.scales.current = "C";

        //var temperature;
				scope.canDrag = false;
	      //element.find('cover').bind('mousedown', function($event){
		     // console.log('click>>>');
	      //});
	      scope.canDragMouseDownHandler = function(){
		      scope.canDrag = true;
	      };

	      scope.canDragMouseUpHandler = function(){
		      $timeout(function(){scope.canDrag = false},200);
	      };

        var subItem = element.find('#subItem')[0];
        var subItemContext = subItem.getContext('2d');

        /**
         * Render beaker if item name 'beaker' and
         * draw temperature if attached
         */
        if( scope.uiData && scope.uiData.name == 'beaker') {

          objLiquid = new LIQUID(120, element);
          objLiquid.init();
          objLiquid.changeSize();

          $timeout(function(){
            SteamEffect = new STEAMEFFECT(300, 500, "steam_" + scope.uiData.uuid, scale);
            BubbleEffect = new BUBBLEEFFECT(350 * scale, 200 * scale, "bubble_" + scope.uiData.uuid, scale);
          }, 10);

          /**
           * draw temp
           */
          if( scope.uiData.hasOwnProperty('withObj')){
            drawSubItem(scope.uiData.withObj.thumbnail);
          }
        }

	      scope.$watch('uiData.withObj', function(newVal, oldVal){
		      console.log('draw temometer.....', newVal, oldVal);
		      var subItem = newVal;
		      if( newVal ){
			      if( subItem.type === LAB_CONSTS.MAT_TYPE.ins){
				      console.log("draw termometr");
				      //$timeout(function(){
					     //scope.$apply(function(){
						      drawSubItem(subItem.thumbnail);
					     //})
				      //});
			      }
		      }
	      });

	      scope.$watch('hideTermometer', function(newVal){
		      if( newVal) {
			      console.log('hide termometer');
			      if(subImageWidth > 0 && subImageHeight > 0) {
				      subItemContext.clearRect(0, 0, subImageWidth, subImageHeight);
				      element.find('#temp').text('');
			      }
		      }
	      });

        // When liquid total add from window dialog
        scope.$watch('uiData.liquidTotal', function (newValue, oldValue) {
          var total = parseInt(newValue);
          if (angular.isDefined(newValue)) {
            if (attrs.uiData === 'item.uiData' || (newValue == oldValue && newValue!=0)) { // attached to heater, draw liquid faster
              objLiquid.drawLiquidFast(total);
            } else {
	            //console.log('view animate', newValue, oldValue);
              objLiquid.viewAnimate(true, total);
            }
            element.find('#total-liquid').val(total);
          }
        });

        var increase;
        var startIncreaseTemperature = function(){
          increase = $interval(function(){
            //if(scope.uiData.temperature < 100)
            //  scope.uiData.temperature += 0.65;
            temperature = temperature + 0.65;
            drawTemperature( temperature );
          }, 2000);
        };

        var stopIncreaseTemperature = function(){
          $interval.cancel(increase);
          increase = undefined;
        };

        //When adjustFlame
        scope.$watch('uiData.animate', function(newVal, oldVal){
          if( scope.uiData && scope.uiData.animate && newVal == true && !angular.isDefined(increase)) {
            //SteamEffect.start();
            //BubbleEffect.start();
            startIncreaseTemperature();
          } else if( newVal == false &&  angular.isDefined(increase)){
            console.log('stop animation');
            SteamEffect.stop();
            BubbleEffect.stop();
            stopIncreaseTemperature();
          }
        }, true);

	      var subImageWidth, subImageHeight;
        function drawSubItem(src) {

          subImage.onload = function() {

            var imageWidth = subImage.width;
            var imageHeight = subImage.height;
            var newHeight = 120;

            var imgHeight = newHeight * 1;
            var imgWidth = imgHeight * (imageWidth / imageHeight);

            subItemScaleP = subItemScale;
            subItemScale = imgHeight / imageHeight;

	          subItemY1 = subItemY1 * (subItemScale / subItemScaleP);
	          subItemY2 = subItemY2 * (subItemScale / subItemScaleP);

            subItem.width = imgWidth;
            subItem.height = imgHeight;

	          //console.log('load and draw image', subImage.width, subImage.height);
	          subImageWidth = imgWidth;
	          subImageHeight = imgHeight;

            subItemContext.drawImage(this, 0, 0, imgWidth, imgHeight);

	          //console.log(element.find('#subItem')[0]);
	          //element.find('#subItem').css({'display':'block !important','background':'black'});

	          drawTemperature( convertTemperature() );

          };
	        console.log("Load image", src);
          subImage.src = src;
        };

        //celsius2fahrenheit

        // flame status: off|small|medium|high
        //$scope.flame = 'off';
        var temperature = 0;
        var convertTemperature = function(){
          if( scope.scales.current === "C") {
            temperature = parseFloat(temperature) * 9/5 + 32;
          } else if( scope.scales.current === "F") {
            temperature = (parseFloat(temperature)  - 32)  * 5/9;
          } else {
            temperature = parseFloat(temperature);
          }
          return temperature;
        };

        scope.$watch('uiData.withObj', function(newVal, oldVal){
          var subItem = newVal;
          if( subItem && !oldVal ){
            if( subItem.type === LAB_CONSTS.MAT_TYPE.ins){
	            //scope.$parent.$apply();
	            //scope.uiData
              drawSubItem(subItem.thumbnail);
	            element.addClass('beakerWithInstrument');
            }
          }

        });

        /**
         * Click handler change temperature
         */
        scope.changeTemperature = function(){
          scope.scales.current = scope.scales.current === 'C' ? 'F' : 'C';
          drawTemperature( convertTemperature( temperature ) );
        };

        scope.$watch('uiData.temperature', function(newVal, oldVal){
          temperature = scope.uiData.temperature;
          console.log("uiData.temperature", scope.uiData.temperature);
          drawTemperature( convertTemperature() );
        });

        function drawTemperature( temperature ){
          var temp = temperature.toFixed(1) || 0.0;
          console.log("Draw temp: ", temperature, temp);
          setTimeout(chk_timeout, 1000);
          
          if( !isNaN(temp) ) {
            element.find('#temp').text(temp + (scope.scales.current === 'C' ? 'F' : 'C' ));
          } else {
            element.find('#temp').text(0 + (scope.scales.current === 'C' ? 'F' : 'C' ));
          }
        }


        // switch( scope.flame ) {
        //   case "low" :
        //     SteamTimer  = 3;
        //     reduceSpeed = 1;

        //     SteamEffect._steamSpeed   = 0.1;
        //     BubbleEffect._bubbleSpeed = 0.1;
        //     break;
        //   case "medium" :
        //     SteamTimer  = 5;
        //     reduceSpeed = 2;

        //     SteamEffect._steamSpeed   = 0.15;
        //     BubbleEffect._bubbleSpeed = 0.15;
        //     break;
        //   case "high" :
        //     SteamTimer  = 10;
        //     reduceSpeed = 3;

        //     SteamEffect._steamSpeed   = 0.2;
        //     BubbleEffect._bubbleSpeed = 0.2;
        //     break;
        // }


        function chk_timeout() {
          SteamTimer --;

          if(SteamTimer == 0) {
            SteamEffect.start();
            BubbleEffect.start();

            //Need to handle audio this way to accomodate fact that audio will only preload on mobile devices from an onclick event directly
            //BubbleEffect.playAudio(SteamTimer);
            //setTimeout(function(){  BubbleEffect.pauseAudio(SteamTimer); }, 5);
            //setTimeout(function(){  BubbleEffect.playAudio(SteamTimer); }, SteamTimer*1000);

            WaterTimer = setInterval(chk_amount_water, 1000);
            setTimeout(function(){  BubbleEffect.playAudio(SteamTimer); }, SteamTimer*1000);

          } else {
            //setTimeout(chk_timeout, 1000);
          }
        }

        function chk_amount_water() {
          var totalC = element.find("#total-liquid").val() * 1 - reduceSpeed;

          element.find("#total-liquid").val(Math.max(totalC,0));

          // console.log('Math.max(totalC,0)');
          // console.log(Math.max(totalC,0));
          // console.log('/////////////');

          if(totalC <= 0) {
            clearInterval(WaterTimer);

            SteamEffect.stop();
            BubbleEffect.stop();
            setTimeout(function(){  BubbleEffect.pauseAudio(SteamTimer); }, SteamTimer*1000);
          }

          objLiquid.viewAnimate(false, totalC);
        }

        //setTimeout(function(){
        //  SteamEffect.start();
        //  BubbleEffect.start();
        //},2000);
      }
    }
  }]);

