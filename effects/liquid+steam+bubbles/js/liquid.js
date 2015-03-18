
var LIQUID    = function(heightValue, container)
{
  console.log('Canvas', container.find('#magic')[0]);
  var canvas    = container.find('#magic')[0];
  var context   = canvas.getContext('2d');

  var main      = this;

  main.container = container;

  var imgB_obj  = new Image();
  var imgF_obj  = new Image();

  var moving    = 0;
  var start     = 0;
  var prev      = 0;
  var padding   = 25;

  var direction = 1;
  var scale     = 1;
  var scale_p   = 1;

  var imgWidth  = 335;
  var imgHeight = 384;

  var imgPosY1  = 0;
  var imgPosY2  = 32;
  var y1, y2;
    var fps = {
        startTime : 0,
        frameNumber : 0,
        getFPS : function(){
            this.frameNumber++;
            var d = new Date().getTime(),
                currentTime = ( d - this.startTime ) / 1000,
                result = Math.floor( ( this.frameNumber / currentTime ) );

            if( currentTime > 1 ){
                this.startTime = new Date().getTime();
                this.frameNumber = 0;
            }
            return result;

        }
    };

  main.init           = function()
  {
    main.initImgObj();
    main.initAnim();
  }

  main.initAnim       = function()
  {
    window.requestAnimFrame = (function(callback)
    {
      return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame ||
      
      function(callback) 
      {
        window.setTimeout(callback, 1000 / 60);
      };
    })();
  }

  main.initImgObj     = function() 
  {
    imgB_obj.onload = function() 
    {
      context.drawImage(imgB_obj, 0, imgPosY1, imgWidth, imgHeight);
    };


    imgB_obj.src = 'images/beaker_back.png';
  }

  main.viewAnimate    = function(BoolAudio, total)
  {
    var time    = (new Date()).getTime();
    var nlimit  = (document.getElementById("total") ? document.getElementById("total").value : total) * 1;

    if(nlimit < prev)
      direction = -1;
    else
      direction = 1;


    moving  = Math.abs(nlimit - prev);
    prev    = nlimit;

    if (BoolAudio==true) {
     main.playAudio();
    }

    main.animate(time);
  }

  main.playAudio   = function() {
    container.find("#audioLiquid")[0].play();
      console.log("LIQUID AUDIO PLAY");
  }
  main.pauseAudio   = function() {
    container.find("#audioLiquid")[0].pause();
      console.log("LIQUID AUDIO PAUSE");
  }

  main.changeSize  = function()
  {
    var cover_top = container.position().top;

    console.log("TOP", cover_top);

    imgHeight  = (document.getElementById("height") ? document.getElementById("height").value : heightValue) * 1;
    imgWidth   = imgHeight * (335 / 384);
    
    scale_p    = scale;
    scale      = imgHeight / 384;

    y1         = y1 * (scale / scale_p);
    y2         = y2 * (scale / scale_p);
    imgPosY2   = imgPosY2 * (scale / scale_p);

    cover_top  = cover_top + 34 * scale;

    //console.log(container.find("#magic"));

    container.find("#magic")[0].width = imgWidth;
    container.find("#magic")[0].height = imgHeight;

    container.find("#cover").css("top",    cover_top);
    container.find("#cover").css("width",  imgWidth);
    container.find("#cover").css("height", imgHeight);

    context.drawImage(imgB_obj, 0, imgPosY1, imgWidth, imgHeight);
    main.drawLiquid(y1, y2);
  }

  // Init liquid pos
  main.currentY1 = main.currentY2 = 0;

  main.animate          = function(startTime)
  {
      var time  = (new Date()).getTime() - startTime;
      var speed = 50 * scale;

      main.currentY1 = y1 = imgHeight * 0.42 - time / 1000 * speed * direction - start * scale + padding * scale;
      main.currentY2 = y2 = imgHeight * 1.30 - time / 1000 * speed * direction - start * scale + padding * scale;

      if(time / 1000 * speed >= moving * scale)
      {
        main.pauseAudio();
        start   = prev;
        return;
      }

      main.drawLiquid(y1, y2);

      requestAnimFrame(function() {
        main.animate(startTime);
      });

      if ($("#liquid_fps").length > 0) {
          $("#liquid_fps").text("Liquid FPS: " + fps.getFPS());
      }
  }

  main.drawLiquid      = function(y1, y2)
  {
      context.save();
      context.clearRect(0, 0, imgWidth, imgHeight);
      context.beginPath();
      context.arc(imgWidth * 0.55, y1, imgWidth * 0.62,0,Math.PI*2,true); // Outer circle

      context.fillStyle = '#bbbec2';
      context.fill();

      context.globalCompositeOperation = "destination-atop";

      context.beginPath();
      context.arc(imgWidth * 0.55, y2, imgWidth * 0.7,0,Math.PI*2,true); // Outer circle

      context.fillStyle = '#ffffff';
      context.fill();

      context.drawImage(imgB_obj, 0, imgPosY1, imgWidth, imgHeight);
      context.globalCompositeOperation = "destination-atop";
      context.restore();
  }

    main.drawLiquidFast = function(total)
    {
        var nlimit  = (document.getElementById("total") ? document.getElementById("total").value : total) * 1;

        if(nlimit < prev)
            direction = -1;
        else
            direction = 1;


        moving  = Math.abs(nlimit - prev);
        prev    = nlimit;

        main.currentY1 = y1 = imgHeight * 0.42 - moving * scale * direction - start * scale + padding * scale;
        main.currentY2 = y2 = imgHeight * 1.30 - moving * scale * direction - start * scale + padding * scale;
        main.drawLiquid(y1, y2);
    }
};