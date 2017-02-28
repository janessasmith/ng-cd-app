/*
    Create By LiuJs 2015-11-13
*/
"use strict";
angular.module("cDMainModule", ["ckmModule", "classficationModule", "cDMainRouterMoudle", "classificationServiceModule", "politicalcommSenseModule"])
    .controller("cDMainCtrl", ["$scope", "$timeout", "$state", "classificationService", function($scope, $timeout, $state, classificationService) {
        $scope.optionSelected = "classification";
        classificationService.queryClassification().then(function(data) {
            $scope.classificationDatas = data;
            $scope.classificationDatas.push({
                fullName: "图片库",
                name: "图片库",
                type: "picture"
            },{
                fullName: "视频库",
                name: "视频库",
                type: "video"
            }); //新增图片库、视频库分类管理
            $scope.optionSelected = data[0].type;
            $scope.chooseType = function(type) {
                $scope.optionSelected = type;
            };
            $state.go("manageconfig.sysmanage.classifieddictionary.classification", {
                "type": data[0].type,
                "name": data[0].name,
            });
        });
        /**
         * [gotoClassfication description点击分类词典各分类类型，切换右侧详细信息（政治常识单独配置路由）]
         * @param  {[type]} item [description]
         * @return {[type]}      [description]
         */
        $scope.gotoClassfication = function(item) {
            var url = "";
            if (item.fullName == "政治常识校对") {
                url = 'manageconfig.sysmanage.classifieddictionary.politicalcommSense';
            } else {
                url = 'manageconfig.sysmanage.classifieddictionary.classification';
            }
            $state.go(url, { type: item.type, name: item.name });
        };

    }]);
