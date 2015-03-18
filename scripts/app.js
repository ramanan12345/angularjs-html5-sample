//new a angular module named labapp and inject specified dependencies.
var labApp = angular.module("labApp",
  [
    'labDirectives',
    'labServices' ,
    'ngDraggable',
    'labApp.tools',
    'app.ui',
    'ctrlnav',
    'dragTimer',
    'ngHitTest',
    'ngTouch'
  ]);

//config the labapp route.
labApp.config([function(){

}])
  .run(['$rootScope', 'LAB_TYPE', function($rootScope, LAB_TYPE){
    $rootScope.LAB_TYPE = LAB_TYPE;
  }])
.constant("LAB_CONSTS",{
	"MAT_TYPE" : {"con" : 1, "mat" : 2, "ins" : 3}
})
  .constant('LAB_TYPE',{
    "CONTAINER" : 1,
    "MATERIAL"  : 2,
    "INSTRUMENT": 3
  });


