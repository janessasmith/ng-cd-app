/**
 * Created by MRQ on 2016/1/6.
 */
"use strict";
angular.module("productManageMentAppModifyViewsModule", [
    'productManageMentAppModifyServiceModule'
])
    .controller("productManageMentAppChannelModifyViewsCtrl", ["$scope", "$modalInstance", "title","successFn",'productMangageMentAppModifyService', function ($scope, $modalInstance, title,successFn,productMangageMentAppModifyService) {
        initStatus();
        $scope.cancel = function () {
           $modalInstance.dismiss("cancel");
        };
        $scope.confirm = function () {
            $modalInstance.close($scope.newsite);
        };
        function initStatus() { 
             $scope.newsite  = {
                "ObjectId": "0",
                "SITENAME": "",
                "SiteDesc": "test",
                "DATAPATH": "",
                "RootDoMain": "www.baidu.com",
                "SiteOrder": "",
            };
            $scope.title = title;
        }
        //栏目模板弹窗
        $scope.channlViews = function() {
            productMangageMentAppModifyService.channlViews();
        };
        //栏目其他模板弹窗
        $scope.channlOtherViews = function() {
            productMangageMentAppModifyService.channlOtherViews();
        };
        //默认文章弹窗
        $scope.defaultArticleViews = function() {
            productMangageMentAppModifyService.defaultArticleViews();
        };
    }]);
