/*
 * Define a controller for lab.
 */
var labServices = angular.module("labApp")
    .controller("labController", ["$scope", "$rootScope", "virtualLab", function ($scope, $rootScope, virtualLab) {
        // Init table items
        $scope.tableItems = [];

        $scope.labData = {};

        $scope.hittest = false;
        $scope.fullScreen = false;

        //Initialize draggable times list
        $scope.dragTimers = [];
        $scope.$on('stop-timer-event', function (event, data) {
            var index = $scope.dragTimers.indexOf(data);
            $scope.dragTimers.splice(index, 1);
        });
        //if introComplete is true, then show the lab.
        $rootScope.introComplete = false;

        //get lab data by labId.
        $scope.getLabData = function () {
            virtualLab.getLabData({labId: 'labData.txt'})
                .$promise.then(function (data) {
                    $scope.labData = data.labData;
                });
        };

        $scope.initItem = function (item) {
            console.log('init item', item);
        };

        // current zoom pan matrix
        $scope.matrix = [1, 0, 0, 1, 0, 0];

        // update table items coordinates based on zoom
        $scope.$watchCollection('matrix', function(newMatrix, oldMatrix) {
            for (var i = 0; i < $scope.tableItems.length; i++) {
                $scope.tableItems[i].x = $scope.tableItems[i].x * newMatrix[0] / oldMatrix[0];
                $scope.tableItems[i].y = $scope.tableItems[i].y * newMatrix[3] / oldMatrix[3];
            }
        });

        $(".workspace").panzoom({
            contain: 'invert',
            minScale: 1,
            maxScale: 2,
            increment: 0.1
        });

        // prevent panzom to receive the event for forms and links
        $(".workspace form, .workspace a, .workspace .light-switch img").on('mousedown touchstart', function(e) {
            e.stopImmediatePropagation();
        });

        $(window).on('resize', function() {
            $(".workspace").panzoom('resetDimensions');
        });

        // track matrix change
        $(".workspace").on('panzoomchange', function(e, panzoom, matrix) {
            $scope.matrix = matrix;
        });

        $scope.zoom = function () {
            var currZoom = 1;

            $(".zoomIn").click(function () {
                $(".workspace").panzoom("zoom");
            });

            $(".zoomOff").click(function () {
                $(".workspace").panzoom("reset");
            });
            $(".zoomOut").click(function () {
                $(".workspace").panzoom("zoom", true);
            });
        }

        $scope.launchFullscreen = function () {
            if (document.documentElement.requestFullscreen) {
                document.documentElement.requestFullscreen();
            } else if (document.documentElement.mozRequestFullScreen) {
                document.documentElement.mozRequestFullScreen();
            } else if (document.documentElement.webkitRequestFullscreen) {
                document.documentElement.webkitRequestFullscreen();
            } else if (document.documentElement.msRequestFullscreen) {
                document.documentElement.msRequestFullscreen();
            }

            $scope.fullScreen = true;
        }


        $scope.exitFullscreen = function () {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            }

            $scope.fullScreen = false;
        }

    }]);