angular.module("labApp")
  .controller('introController', ['$scope', '$rootScope', '$window', function ($scope, $rootScope, window) {
    var BACKGROUND_WIDTH = 3278,
      BACKGROUND_HEIGHT = 2139,
      INTRO_WIDTH = 1019,
      INTRO_HEIGHT = 665,
      LNL = null;

    // When user click ok on popup box animate revers animation
    $scope.$on('labExit', function () {
      window.onresize = ScaleContentToDevice;
      ScaleContentToDevice();
    });

    /* handler for browser load and resize event */
    window.onload = ScaleContentToDevice;
    window.onresize = ScaleContentToDevice;

    function ScaleContentToDevice() {
      var width = window.innerWidth,
        height = window.innerHeight;

      /* get canvas div item */
      var introContain = document.getElementById('canvas_contain'),
        introStage = document.getElementById('intro_stage');

      /* set every items style( width, height, margine-top ...)*/
      try {
        introContain.style.height = height + 'px';
        introContain.style.width = width + 'px';
        introStage.style.height = height + 'px';
        introStage.style.width = width + 'px';
      } catch (e) {
        introContain.setAttribute('style', "height:" + height + ";");
        introContain.setAttribute('style', "width:" + width + ";");
        introStage.setAttribute('style', "height:" + height + ";");
        introStage.setAttribute('style', "width:" + width + ";");
      }

      if (LNL == null) {
        /* Class object create for animation */
        LNL = new INTRO_ANI(width, height);
      }
    }

    function updatePercents(percent){
      angular.element('#percent').css({width: percent + '%'});
      if( percent >= 100 ){
        hideWelcomeLayer();
      }

    };
    function hideWelcomeLayer(){
      angular.element('#welcomeLayer').hide();
    };

    var INTRO_ANI = function (w, h) {
      var self = this;

      self._canvas = null;
      self._context = null;

      /* canvas width and height */
      self._width = w;
      self._height = h;

      /* canvas tag id */
      self._canvas_id = "intro_stage";

      /* intro image ojbect */
      self._imageSrc = "images/intro/intro.jpg";
      self._introObject = null;

      /* canvas image objects array for splite image */
      self._spriteObject = new Array();

      /* image path prefix  */
      self._spriteSrc = "images/intro/sprite/chemistry_INTRO";

      /* total resource count */
      self._total = 77;

      /* loaded resource count */
      self._loaded = 0;
      self._anitime = 0;


      /* init function */

      if (window.complete) {
        _showCanvasElement();
      }

      self.initalize = function (from, to) {


        /* window frame set */
        window.requestAnimationFrame = (function () {
          return window.requestAnimationFrame ||
          window.webkitRequestAnimationFrame ||
          window.mozRequestAnimationFrame ||
          window.oRequestAnimationFrame ||
          window.msRequestAnimationFrame ||
          function (callback) {
            window.setTimeout(callback, 1000 / 60);
          }
        })();

        /* init canvas items */
        self._canvas = document.getElementById(self._canvas_id);
        self._canvas.width = self._width;
        self._canvas.height = self._height;
        self._context = self._canvas.getContext('2d');

        /* load intro image to canvas */
        self._introObject = new Image();
        self._introObject.onload = function () {
          /* load image to canvas */
          self.drawIntroImage(0, 0, INTRO_WIDTH, INTRO_HEIGHT);
          /* loaded resource check */
          self._startDrawAnimation();
        };
        self._introObject.onerror = function () {
          alert("Image loading error( image path : )" + self._imageSrc);
        };
        self._introObject.src = self._imageSrc;

        /* load frame image to canvas */
        var step = 1;
        if (window.exit && window.exit === true) {
          for (var i = 75; i >= 0; i--) {
            /* get split frame file path
             prefix + number format + jpg
             ex : resources/img/sprite/chemistry_INTRO + 0001 + .jpg
             */
            var iformat = i.toString();
            var namesuffex = String("0000" + iformat).slice(-4);
            var filename = self._spriteSrc + namesuffex + ".jpg";
            var imageObj = new Image();

            /* resource load */
            imageObj.onload = function () {
              //console.log('load');
              /* load image to canvas */
              self.drawFramImage(this, 0, 0, INTRO_WIDTH, INTRO_HEIGHT);
              /* loaded resource check */
              self._startDrawAnimation();
            }

            imageObj.onerror = function (err) {
              alert("Image loading error( image path : )" + self._spriteSrc);
            }

            imageObj.src = filename
            self._spriteObject.push(imageObj);

          }
        } else {
          for (var i = 0; i < 76; i++) {
            /* get split frame file path
             prefix + number format + jpg
             ex : resources/img/sprite/chemistry_INTRO + 0001 + .jpg
             */
            var iformat = i.toString();
            var namesuffex = String("0000" + iformat).slice(-4);
            var filename = self._spriteSrc + namesuffex + ".jpg";
            var imageObj = new Image();

            /* resource load */
            imageObj.onload = function () {
              /* load image to canvas */
              self.drawFramImage(this, 0, 0, INTRO_WIDTH, INTRO_HEIGHT);
              /* loaded resource check */
              self._startDrawAnimation();
            }

            imageObj.onerror = function (err) {
              alert("Image loading error( image path : )" + self._spriteSrc);
            }

            imageObj.src = filename
            self._spriteObject.push(imageObj);

          }
        }


      }

      /* draw intro image on canvas */
      self.drawIntroImage = function (sx, sy, width, height) {
        self._context.drawImage(self._introObject, sx, sy, width, height, 0, 0, self._width, self._height);
      }

      /* draw frame image on canvas */
      self.drawFramImage = function (frameObj, sx, sy, width, height) {
        self._context.drawImage(frameObj, sx, sy, width, height, 0, 0, self._width, self._height);
      }

      /* loop function for animation */
      self._loopAnimation = function (oldtime) {
        /* get delta time */
        var now = (new Date()).getTime();
        var dt = now - oldtime;
        /* set animation step by delta time
         when animation is not ended.. call loop function.
         not.. remove canvas element
         */
        if (!self._stepAnimation(dt)) {
          requestAnimationFrame(function () {
            self._loopAnimation(now)
          });
        } else {
          //self._removeCanvasElement();
          if (!window.exit)
            self._hideCanvasElement();
        }
      }

      /* step function for animation */
      self._stepAnimation = function (dt) {
        /* get played animation time */
        self._anitime += dt;
        var v01, delta, period, t_period = 500;
        {
          /* get speed by animation time, */
          t_period = 3000;
          period = 3000;
          delta = self._anitime;

          if (delta >= 0 && delta <= period) {
            var frameCount = self._spriteObject.length;
            var curIndex = parseInt(frameCount / period * delta);
            /* frame image draw on canvas */
            self.drawFramImage(self._spriteObject[curIndex], 0, 0, INTRO_WIDTH, INTRO_HEIGHT);
          }

          if (self._anitime == dt) {
            /* before animation.. remove door image element */
            var tempDiv = document.getElementById('temp_image');
            if (tempDiv && tempDiv.parentNode != null)
              tempDiv.parentNode.removeChild(tempDiv);
          }
        }

        /* if played animation time is big more than 3s, animation ended */
        if (self._anitime > 3000)
          return true;
        return false;
      }

      /* loaded resouce check */
      self._startDrawAnimation = function () {
        self._loaded++;
        updatePercents( Math.floor( self._loaded / self._total * 100 ) )
        if (self._loaded < self._total) {
          return;
        }
        /* if all resources are loaded.. animation start */
        self._loopAnimation((new Date()).getTime());
      }

      /* remove canvas element */
      self._removeCanvasElement = function () {
        var div = document.getElementById("canvas_container");
        div.parentNode.removeChild(div);

        // remove resize event binding
        window.onload = null;
        window.onresize = null;

        $rootScope.introComplete = true;
        $scope.$emit("intro-complete");
        $scope.$apply();

      };

      self._hideCanvasElement = function () {
        var div = document.getElementById("canvas_container");
        div.style.display = 'none';

        window.onload = null;
        window.onresize = null;

        //$window.labExit = false;
        $rootScope.introComplete = true;
        window.complete = true;
        $scope.$emit("intro-complete");
        $scope.$apply();

        LNL = null;

      };

      _showCanvasElement = function () {
        var div = document.getElementById("canvas_container");
        div.style.display = 'block';

        $rootScope.introComplete = false;
        window.complete = false;
        //$scope.$emit("intro-complete");
        //$scope.$apply();

      };

      /* start function */
      if (window.exit) {
        self.initalize(76, 0);
      } else {
        self.initalize();
      }
    }
  }]);