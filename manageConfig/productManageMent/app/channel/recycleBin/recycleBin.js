/**
 * Created by MRQ on 2016/1/5.
 */
"use strict";
angular.module("productManageMentAppChannelRecycleBinModule", [

    ])
    .controller("productManageMentAppChannelRecycleBinCtrl", ["$scope", "$q", "productMangageMentAppService", "$stateParams", "$state", "$rootScope", "trsHttpService", "trsconfirm", function($scope, $q, productMangageMentAppService, $stateParams, $state, $rootScope, trsHttpService, trsconfirm) {
        initStatus();
        initData();
        //获取栏目操作权限开始
        function getChnlRights() {
            productMangageMentAppService.getRight($stateParams.site, "", "appsetsite.channel").then(function(data) {
                $scope.status.right = data;
            });
        }
        //获取栏目操作权限结束
        //初始化状态
        function initStatus() {

            $scope.params = {
                serviceid: "mlf_appconfig",
                methodname: "queryRecycleChnlBySiteId",
                SiteId: $stateParams.site,
                TopChannelId: '0'
            };
            $scope.status = {
                right: {}
            };
            $scope.selectedArray = [];
            $scope.batchOperateBtn = {
                "hoverStatus": "",
                "clickStatus": ""
            };
            $scope.click_btn = "";
            getChnlRights();
        }
        //初始化数据
        function initData() {
            requestData().then(function(data) {
                $scope.items = data.DATA;
                angular.isDefined($scope.items) ? $scope.selectChannel = $scope.items[0] : "";
            });

        }
        $scope.selectItem = function(item) {
            $scope.selectChannel = item;
        };
        //数据请求函数
        function requestData() {
            var defferd = $q.defer();
            trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), $scope.params, "get").then(function(data) {
                defferd.resolve(data);
            });
            return defferd.promise;
        }
        //返回上一页
        $scope.goBack = function() {
            $state.go("manageconfig.productmanage.app.channel");
        };
        //删除弹窗
        $scope.deleteViews = function(chnldesc, chnlId) {
            productMangageMentAppService.recycleDeleteViews({
                title: "删除",
                content: "您确定要彻底删除此栏目"
            }, function(data) {
                var deleteParams = {
                    serviceid: "mlf_appconfig",
                    methodname: "RemoveChannels",
                    ChannelIds: chnlId,
                    TopChannelId: '0'
                };
                trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), deleteParams, "post")
                    .then(function(data) {
                        trsconfirm.alertType("删除成功", "删除成功", "success", false, function() {
                            initData();
                        });
                    });
            });
        };
        //还原弹窗
        $scope.reductionViews = function(item) {
            productMangageMentAppService.recycleReductionViews({
                content: "您确定要还原此栏目"
            }, function(data) {
                var reSiteParams = {
                    serviceid: "mlf_appconfig",
                    methodname: "restoreChannels",
                    ObjectIds: item.CHANNELID,
                    SiteId: $stateParams.site,
                    TopChannelId : '0',
                    RestoreAll: false
                };
                trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), reSiteParams, "post")
                    .then(function(data) {
                        $rootScope.$broadcast("leftAddAppChannel", item);
                        trsconfirm.alertType("还原成功", "还原成功", "success", false, function() {
                            initData();
                        });
                    });
            });
        };
    }]);
