var SteamTimer    = 10;
var SteamEffect   = null;
var BubbleEffect  = null;
var WaterTimer    = null;
var objLiquid     = null;
var reduceSpeed   = 1;
var scale         = 60 / 384;

var sWidth        = 0;
var sHeight       = 0;

var bWidth        = 0;
var bHeight       = 0;

jQuery(document).ready(function($)
{
  objLiquid  = new LIQUID()
  objLiquid.init();
  SteamEffect     = new STEAMEFFECT( 300 , 500, "steam", scale );
  BubbleEffect    = new BUBBLEEFFECT( 350 * scale, 200 * scale , "bubble", scale );

  objLiquid.changeSize();

  $("#btn_view").click(function()
  {
  	objLiquid.viewAnimate(true);

    $("#steam_speed") .attr({"disabled" : false});
    $("#btn_speed")   .attr({"disabled" : false});
  });

  $("#btn_height").click(function()
  {
    scale = document.getElementById("height").value * 1 / 384;

  	objLiquid.changeSize();

    SteamEffect   .updateSize(300 * scale, 500 * scale, scale);
    BubbleEffect  .updateScale(scale);
    BubbleEffect  .updateSize(350 * scale, 200 * scale);
  });

  $("#btn_speed").click(function()
  {
    SteamEffect.stop();
    BubbleEffect.stop();

    if(WaterTimer)
      clearInterval(WaterTimer);

    switch($("#steam_speed").val())
    {
      case "low" :
        SteamTimer  = 3;
        reduceSpeed = 1;

        SteamEffect._steamSpeed   = 0.1;
        BubbleEffect._bubbleSpeed = 0.1;
        break;
      case "medium" :
        SteamTimer  = 5;
        reduceSpeed = 2;

        SteamEffect._steamSpeed   = 0.15;
        BubbleEffect._bubbleSpeed = 0.15;
        break;
      case "high" :
        SteamTimer  = 10;
        reduceSpeed = 3;

        SteamEffect._steamSpeed   = 0.2;
        BubbleEffect._bubbleSpeed = 0.2;
        break;
    }

    //Need to handle audio this way to accomodate fact that audio will only preload on mobile devices from an onclick event directly
    BubbleEffect.playAudio(SteamTimer);
    setTimeout(function(){  BubbleEffect.pauseAudio(SteamTimer); }, 5);
    setTimeout(function(){  BubbleEffect.playAudio(SteamTimer); }, SteamTimer*1000);


    $("#timer").html(SteamTimer);
    $("#timer").css({"display" : "block"});

    setTimeout(chk_timeout, 1000);
  });
});

function chk_timeout()
{
  SteamTimer --;

  if(SteamTimer == 0)
  {
    SteamEffect.start();
    BubbleEffect.start();

    $("#timer").css({"display" : "none"});
    WaterTimer = setInterval(chk_amount_water, 1000);
  }
  else
  {
    setTimeout(chk_timeout, 1000);

    $("#timer").html(SteamTimer);
    $("#timer").css({"display" : "block"});
  }
}

function chk_amount_water()
{
  var total = $("#total").val() * 1 - reduceSpeed;

  $("#total").val(Math.max(total,0));

  if(total <= 0)
  {
    clearInterval(WaterTimer);

    SteamEffect.stop();
    BubbleEffect.stop();
  }

  objLiquid.viewAnimate(false);
  BubbleEffect.updateSize(300 * scale, total * scale);
}