var SteamEffect = null;

var STEAMEFFECT								= function( w, h, id, scale )
{
	var self								= this;
	self._width								= w;
	self._height							= h;
	self._id								= id;

	self._left								=null; 
	self._top								=null; 

	
	self._ctx								= null; 
	self._canvas							= null;

	self._steamImg							= new Image(); 
	
	self._steamURL							= "images/steam.png";
	self._animationEnd						= false;

	self._steamSpeed 						= 0.2;
	self._steamObjects						= new Array();
	self._steamStop 						= 1;
	self._scale 							= scale;
	self._pscale 							= scale;
	console.log(self._scale);

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

	self._initialize						= function()
	{

		window.requestAnimationFrame = (function ()
		{
			return  window.requestAnimationFrame       ||
					window.webkitRequestAnimationFrame ||
					window.mozRequestAnimationFrame    ||
					window.oRequestAnimationFrame      ||
					window.msRequestAnimationFrame     ||
					function(callback){
						window.setTimeout(callback, 1000 / 60 );
					}
		})();
		
		self._ctx = self._init_canvas( self._id );
		self._loadImage( self._steamURL );
	}
	
	self._init_canvas									= function( id )
	{
		var canvas= document.getElementById(id);
		self._canvas=canvas;
		var ctx=canvas.getContext("2d");
		return ctx;
	}
	
	self._loadImage						= function( url )
	{
		console.log(self._scale);
	    self._steamImg.onload = function() 
	    {
			self._left 		= self._width / 2;
			self._top 		= self._height / 2 - 50;
			var width 		= self._width / 3 * 2;
			for( var i = 0; i < 50; i ++)
			{
				var object = new Object();
				var left = (Math.random() * (self._width - 200 ) + 80);
				var top = self._height * self._scale + Math.random() * 1000;
				var opacity = Math.random() * 0.2 + 0.8;
				
				object={ left: left, top: top, opacity: opacity, width : width,s_op:opacity };			
				self._steamObjects.push( object );
				self.renderAll();
			}
			self.updateSize(300 * self._scale, 500 * self._scale);
			self.gameLoop((new Date()).getTime());
	    };
	    self._steamImg.src = self._steamURL;
	}

	self.updateSize 						= function(w, h, scale)
	{
		var magic_h = $("#magic").height();
		var pos_y 	= $("#magic").offset().top	+ (magic_h - h - 30 );
		var pos_x 	= $("#magic").offset().left + 53;
		var multi 	= self._scale;

		if(scale)
		{
			self._scale 	= scale;
			multi 			= self._scale / self._pscale;
			self._pscale 	= scale;
		}
		// multi = 0.5;
		console.log(multi);
		pos_x 	= $("#magic").offset().left + 53 * self._scale;

		$("#" + self._id).attr({"width" : w, "height" : h});
		$("#" + self._id).css({"width" : w, "height" : h});

		$("#" + self._id).css({"left" : pos_x + "px"});
		$("#" + self._id).css({"top" : pos_y + "px"});

		for( var i = 0; i < self._steamObjects.length; i ++)
		{
			self._steamObjects[i].width=self._steamObjects[i].width * multi;
			self._steamObjects[i].left=self._steamObjects[i].left * multi;
		}

	}

	self.start 								= function()
	{
		self._steamStop = 0;
		self.gameLoop((new Date()).getTime());
	}

	self.stop 								= function()
	{
		self._steamStop = 1;
	}
	
	self.gameLoop							= function(oldtime)
	{
		var now = (new Date()).getTime();
		var dt = now - oldtime ;
		var dy = dt * self._steamSpeed;

		if(self._steamStop)
		{
			for( var i = 0; i < self._steamObjects.length; i ++)
			{
				self._steamObjects[i].opacity=0;
				self.renderAll();
			}

			return;
		}

		if(!self._animationEnd)
		{
			for( var i = 0; i < self._steamObjects.length; i ++)
			{
				var top = self._steamObjects[i].top - dy;

				if( top < -200 )
					top = self._height + Math.random() * 1000;
					
				var temp = top;
				
				if( temp > self._height - 80 )
					temp = self._height - 80;
				else if( temp < 0 )
					temp = 0;
					
				if( temp > self._height * 2 / 3 )
				{
					temp = (self._height - 80) - temp;

					opacity = self._steamObjects[i].s_op * ( temp * 3 / (self._height - 80) );
					
					self._steamObjects[i].opacity=opacity;
				}
				else 
				{
					opacity = Math.max(self._steamObjects[i].top / 300 / self._scale, 0);
					self._steamObjects[i].opacity=opacity;
				}
				self._steamObjects[i].top=top;
			}
			
			self.renderAll();
			requestAnimationFrame(function(){ self.gameLoop(now)} );

			if ($("#steam_fps").length > 0) {
				$("#steam_fps").text("Steam FPS: " + fps.getFPS());
			}
		}
	}


	self.renderAll							= function() 
	{
		if (self._ctx) {
			(self._ctx).clearRect(0,0,(self._canvas).width,(self._canvas).height);
			for (var a=0;a<self._steamObjects.length;a++) {
				(function(a) {
					var obj=self._steamObjects[a];
					(self._ctx).globalAlpha=obj.opacity;
					(self._ctx).drawImage((self._steamImg),obj.left-(obj.width/2),obj.top-(obj.width/2), obj.width,obj.width);
					(self._ctx).globalAlpha=1;
				})(a);
			}
		}
	}

	{
		self._initialize();
	}
}


