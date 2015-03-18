angular.module("labDirectives")
  .directive('ngBiowasteBin', ['$rootScope', function ($rootScope) {
    return {
      restrict: 'AE',
      templateUrl: 'templates/biowaste_bin.html',
      scope: {},
      link: function ($scope, element, attrs) {

        var lastTime = 0;
        var vendors = ['ms', 'moz', 'webkit', 'o'];
        var biowaste,
          biowaste_bin,
          canvas, animationId;

        for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
          window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
          window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame']
          || window[vendors[x] + 'CancelRequestAnimationFrame'];
        }

        if (!window.requestAnimationFrame)
          window.requestAnimationFrame = function (callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function () {
                callback(currTime + timeToCall);
              },
              timeToCall);
            lastTime = currTime + timeToCall;
            return id;
          };

        if (!window.cancelAnimationFrame)
          window.cancelAnimationFrame = function (id) {
            clearTimeout(id);
          };

        function runAnimation() {

          animationId = window.requestAnimationFrame(runAnimation);

          $("#audioTrash")[0].play();
          biowaste.update();
          biowaste.render();
        }

        function sprite(options) {

          var that = {},
            frameIndex = 0,
            tickCount = 0,
            ticksPerFrame = options.ticksPerFrame || 0,
            numberOfFrames = options.numberOfFrames || 1;

          that.context = options.context;
          that.width = options.width;
          that.height = options.height;
          that.image = options.image;

          that.update = function () {

            tickCount += 1;

            if (tickCount > ticksPerFrame) {

              tickCount = 0;

              // If the current frame index is in range
              if (frameIndex < numberOfFrames - 1) {
                // Go to the next frame
                frameIndex += 1;
              } else if(frameIndex >= numberOfFrames-1) {
                window.cancelAnimationFrame(animationId);
              } else {
                frameIndex = 0;
              }
            }
          };

          that.render = function () {

            // Clear the canvas
            that.context.clearRect(0, 0, that.width, that.height);

            // Draw the animation
            that.context.drawImage(
              that.image,
              frameIndex * that.width / numberOfFrames,
              0,
              that.width / numberOfFrames,
              that.height,
              0,
              0,
              that.width / numberOfFrames,
              that.height);
          };

          return that;
        }

        function action() {
          // Get canvas
          canvas = angular.element(element).find('#canvas')[0];
          canvas.width = 206;
          canvas.height = 381;

          // Create sprite sheet
          biowaste_bin = new Image();

          // Load sprite sheet
          biowaste_bin.addEventListener("load", function(){
            // Create sprite
            //console.log('create sprite', canvas);
            biowaste = sprite({
              context: canvas.getContext("2d"),
              width: 3296,
              height: 381,
              image: biowaste_bin,
              numberOfFrames: 16,
              ticksPerFrame: 2
            });

            biowaste.render();
          });

          biowaste_bin.src = "images/sprites/biowaste_bin_sprites.png";
        };

        action();

        $scope.onDropComplete = function($data, $event){
          $rootScope.$broadcast('clearByItemObject',$data);
          action();
          runAnimation();
        }
      }
    }
  }]);
