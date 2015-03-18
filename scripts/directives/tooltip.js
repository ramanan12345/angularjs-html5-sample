angular.module("labDirectives")
.directive("labTooltip" , [function($scope){
	return {
		restrict : "EA",
		link : function(scope , element ,attrs){
			element.append("<div class='lab-tooltip'><span>"+attrs.labTooltip+"</span></div>");
			element.on("mouseover" , function(){
                if(element.css("position") == "absolute"){
                    element.find(".lab-tooltip").css({
                        top: -element.find(".lab-tooltip").height() * 2,
                        left: 0
                    }).show();
                }else{
                    element.find(".lab-tooltip").show();
                }
					console.log("----Show");
			}).on("mouseout" ,function(event) {
					console.log("----Hide");
				element.find(".lab-tooltip").hide();
			});
		}
	}
}]);