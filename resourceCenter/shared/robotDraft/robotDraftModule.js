/*create by bai.zhiming 2016-8-12*/
'use strict';
angular.module("resourceCenterSharedRobotDraftModule", [])
    .controller("resourceCenterSharedRobotDraftCtrl", ["$scope", "$stateParams", "$sce", function($scope, $stateParams, $sce) {
        var urlMap;
        initStatus();

        function initStatus() {
            urlMap = {
                "56": "数据解读",
                "57": "台风快讯",
                "58": "地震快讯",
                "59": "NBA快讯"
            };
            $scope.status = {
                iframeSrc: $sce.trustAsResourceUrl("http://xiaosi.trs.cn/robotnews/news/mlf/category?category="+urlMap[$stateParams.nodeid])
            };
        }
        /*$("#iframe_resourceCentrRobotDraft").load(function() {
            var iframe_resourceCentrRobotDraft_height = $(window).height() - 260;
            $(this).height(iframe_resourceCentrRobotDraft_height);
        });*/
    }]);
