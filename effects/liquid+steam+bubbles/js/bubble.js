var SteamEffect = null;

var BUBBLEEFFECT							= function( w, h, id, scale )
{
	var self								= this;

	self._cycle								=0;

	self._scale 							= scale;
	self._pscale							= scale;

	self._width								= w;
	self._height							= h;
	self._id								= id;

	self._left								=null; 
	self._top								=null; 

	self._canvas							= null;
	self._ctx								= null;

	self._bubbleURL 						= "images/bubble.png";

	self._bubbleImg							= new Image(); 

	self._animationEnd						= false;
	
	self._bubbleObjects						= new Array();
	self._bubbleHeight 						= h;	
	
	self._bubbleStop 						= 1;
	self._bubbleSpeed 						= 0.1;
	self._numbubbles 						= 100;

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
	
	self._initialize						= function(){
		window.requestAnimationFrame = (function (){
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
		self._loadSVG( self._bubbleURL );
	}
	
	self._init_canvas									= function( id ){
		var canvas= document.getElementById(id);
		self._canvas=canvas;
		var ctx=canvas.getContext("2d");
		return ctx;
	}
	
	self._loadSVG						= function( url ) 
	{
	    self._bubbleImg.onload = function() 
	    {
			self._left 		= self._width / 2;
			self._top 		= self._height / 2 - 50;
			var width 		= 150 * self._scale;
			var height 		= 150 * self._scale
			for( var i = 0; i < self._numbubbles; i ++)
			{
				var object = new Object();
				var left = Math.random() * (self._width * 0.6) + ( self._width * 0.2 );
				var top = self._height + Math.random() * (self._height * 2);
				var opacity = Math.random() * 0.2 + 0.8;
				var dTop= Math.random() * (self._height * 1 );

				object={ left: left, top: top, opacity: opacity, width : width,s_op:opacity,scaleX:0.02,scaleY:0.02,d_top:dTop,s_scale:scale };			
				self._bubbleObjects.push( object );
				if (i==(self._numbubbles-1)) 
					self.renderAll();
			}
			self.updateSize(350 * self._scale, 200 * self._scale, scale, self._scale);
			self.gameLoop((new Date()).getTime());
	    };
	    self._bubbleImg.src = self._bubbleURL;
	}

	self.start 								= function()
	{
		self._bubbleStop = 0;
		self.gameLoop((new Date()).getTime());
	}

	self.stop 								= function()
	{
		self._bubbleStop = 1;
		self.pauseAudio();
	}

	self.playAudio							= function() {
		    document.getElementById("audioBubbling").play();
		    console.log("BUBBLE AUDIO START");
	}
	self.pauseAudio							= function() {
		    document.getElementById("audioBubbling").pause();
		    console.log("BUBBLE AUDIO PAUSE");
	}

	self.updateSize 						= function(w, h)
	{
		var magic_h = $("#magic").height();
		var pos_y 	= $("#magic").offset().top + (magic_h - h - 30 * self._scale );
		var pos_x 	= $("#magic").offset().left + 10 * self._scale;

		self._height = h - 20 * self._scale;

		$("#" + id).attr({"width" : w, "height" : h});
		$("#" + id).css({"width" : w, "height" : h});


		$("#" + id).css({"width" : w, "height" : h});
		$("#" + id).css({"top" : pos_y + "px", "left" : pos_x + "px"});
	}

	self.updateScale 						= function(scale)
	{
		var multiple 	= scale / self._pscale;
		
		self._scale 	= scale;
		self._pscale 	= scale;

		for( var i = 0; i < self._bubbleObjects.length; i ++)
		{
			self._bubbleObjects[i].width=self._bubbleObjects[i].width * multiple;
			self._bubbleObjects[i].height=self._bubbleObjects[i].height * multiple;
			self._bubbleObjects[i].left=self._bubbleObjects[i].left * multiple;
		}
	}
	
	self.gameLoop							= function(oldtime)
	{
		self._cycle++;

		var now = (new Date()).getTime();
		var dt = now - oldtime ;
		var dy = dt * self._bubbleSpeed;

		if(self._bubbleStop)
		{
			for( var i = 0; i < self._bubbleObjects.length; i ++)
			{
				self._bubbleObjects[i].opacity=0;
				if (i==(self._bubbleObjects.length-1))
					self.renderAll();
			}

			return;
		}

		if(!self._animationEnd)
		{
			for( var i = 0; i < self._bubbleObjects.length; i ++)
			{
				var top 	= self._bubbleObjects[i].top - dy;
				var s_scale = self._bubbleObjects[i].s_scale;
				var d_top 	= self._bubbleObjects[i].d_top;
				var s_op 	= self._bubbleObjects[i].s_op;
				var scale 	= self._bubbleObjects[i].scaleX + ( 0.0005 * dt );

				if( top < d_top)
				{
					top = self._height + Math.random() * (self._height * 2);
					self._bubbleObjects[i].top =top;
				}
				else{
					if( scale > s_scale)
						scale = s_scale;
					self._bubbleObjects[i].scaleX=scale;
					self._bubbleObjects[i].scaleY=scale;
					self._bubbleObjects[i].top=top;
				}

				if( top * self._scale > self._height * self._scale)
				{
					self._bubbleObjects[i].scaleX=0.02;
					self._bubbleObjects[i].scaleY=0.02;
					self._bubbleObjects[i].opacity=0.0;
				}
				else
				{
					var op = self._bubbleObjects[i].opacity + (0.01 * dt);

					if( op > s_op )
						op = s_op;

					self._bubbleObjects[i].opacity=op;
				}
			}

			self.renderAll();
			requestAnimationFrame(function(){ self.gameLoop(now)} );

			if ($("#bubble_fps").length > 0) {
				$("#bubble_fps").text("Bubble FPS: " + fps.getFPS());
			}
		}
	}

	self.renderAll							= function() 
	{
		if (self._ctx) {
			(self._ctx).clearRect(0,0,(self._canvas).width,(self._canvas).height);
			for (var a=0;a<self._bubbleObjects.length;a++) {
				(function(a) {
					var obj=self._bubbleObjects[a];
					if ((obj.opacity>0)&&(obj.top<self._height)) {
						(self._ctx).globalAlpha=obj.opacity;
						(self._ctx).drawImage((self._bubbleImg),obj.left-((obj.width/2)*obj.scaleX),obj.top-((obj.width/2)*obj.scaleY), obj.width*obj.scaleX,obj.width*obj.scaleY);
						(self._ctx).globalAlpha=1;
					}
				})(a);
			}
		}		
	}

	{
		self._initialize();
	}
}