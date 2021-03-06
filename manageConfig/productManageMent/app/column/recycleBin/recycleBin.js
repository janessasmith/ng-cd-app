/**
 * Created by MRQ on 2016/1/5.
 */
"use strict";
angular.module("productManageMentAppColumnRecycleBinModule", [])
    .controller("productManageMentAppColumnRecycleBinCtrl", ["$scope", "$q", "$stateParams", "$state", "$rootScope", "trsHttpService", "productMangageMentAppService", "trsconfirm", "localStorageService", function($scope, $q, $stateParams, $state, $rootScope, trsHttpService, productMangageMentAppService, trsconfirm, localStorageService) {
        initStatus();
        initData();
        //获取栏目操作权限开始
        function getChnlRights() {
            productMangageMentAppService.getRight("", $stateParams.channel, "appsetchannel.channel").then(function(data) {
                $scope.status.right = data;
            });
        }

        function initStatus() {
            $scope.params = {
                serviceid: "mlf_appconfig",
                methodname: "queryRecycleChnlByChnlId",
                SiteId: $stateParams.site,
                ChannelId: $stateParams.channel,
                TopChannelId: $stateParams.parentchnl
            };
            $scope.status = {
                right: ""
            };
            getChnlRights();
        }

        function initData() {
            requestData().then(function(data) {
                $scope.items = data.DATA;
                angular.isDefined($scope.items) ? $scope.selectedColumn = $scope.items[0] : "";
            });
        }

        function requestData() {
            var deffered = $q.defer();
            trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), $scope.params, "get").then(function(data) {
                deffered.resolve(data);
            });
            return deffered.promise;
        }
        $scope.goBack = function() {
            $state.go("manageconfig.productmanage.app.column");
        };
        $scope.selectedItem = function(item) {
            $scope.selectedColumn = item;
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
                    TopChannelId : $stateParams.parentchnl
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
                content: "您确定要还原此站点"
            }, function(data) {
                var reSiteParams = {
                    serviceid: "mlf_appconfig",
                    methodname: "restoreChannels",
                    ObjectIds: item.CHANNELID,
                    SiteId: $stateParams.site,
                    TopChannelId: $stateParams.parentChnl,
                    RestoreAll: false
                };
                trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), reSiteParams, "post")
                    .then(function(data) {
                        $rootScope.$broadcast("leftAddAppColum", item);
                        trsconfirm.alertType("还原成功", "还原成功", "success", false, function() {
                            initData();
                        });
                    });
            });
        };
    }]);
