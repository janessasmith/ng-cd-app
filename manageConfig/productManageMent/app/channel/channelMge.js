'use strict';
angular.module('productManageMentAppChannelModule', [
    'mangeProAppChannelCtrlModule',
    'productManageMentAppChannelRouterModule',
    'productManageMentAppChannelRecycleBinModule'
]).
controller('productManageMentAppChannelCtrl', ['$scope', '$rootScope', '$q', '$state', '$modal', '$stateParams', 'trsHttpService', 'trsconfirm', 'productMangageMentAppService', 'localStorageService', "globleParamsSet", "websiteService", "editingCenterService", function($scope, $rootScope, $q, $state, $modal, $stateParams, trsHttpService, trsconfirm, productMangageMentAppService, localStorageService, globleParamsSet, websiteService, editingCenterService) {
    initStatus();
    initData();
    //获取栏目操作权限开始
    function getChnlRights() {
        productMangageMentAppService.getRight($stateParams.site, "", "appsetsite.channel").then(function(data) {
            $scope.status.right = data;
        });
    }
    //获取栏目操作权限结束 
    /**
     * [positionToChannel description]定位到栏目
     * @return null [description]
     */
    $scope.positionToSite = function(siteMsg) {
        $state.go("manageconfig.productmanage.app.channel", { site: siteMsg.SITEID }, { reload: true });
    };
    /**
     * [clickSiteDirected description]点击站点重定向开始
     * @return null [description]
     */
    $scope.clickChnlDirected = function(item) {
        productMangageMentAppService.getCloumnAccessAuthority(item.CHANNELID).then(function(data) {
            //將权限信息存入缓存，用于底部路由区加载使用开始
            localStorageService.remove("appRightOperType_channel"); //初始化缓存
            localStorageService.set("appRightOperType_channel", {
                type: data.router,
                data: data.data
            });
            $rootScope.$broadcast("expandAppLeftTree", "channel");
            //將权限信息存入缓存，用于底部路由区加载使用结束
            $state.go("manageconfig.productmanage.app." + data.router, {
                channel: item.CHANNELID,
                parentchnl: item.CHANNELID
            });
        });
        $rootScope.$broadcast("expandAppLeftTree", "channel");
        //將权限信息存入缓存，用于底部路由区加载使用结束
        // $state.go("manageconfig.productmanage.app." + "column", {
        //     channel: item.CHANNELID,
        //     parentchnl: item.CHANNELID
        // });
    };
    //初始化数据
    function initData() {
        requestData().then(function(data) {
            $scope.appItems = data;
            $scope.appItems !== "" ? $scope.selectedChannel = $scope.appItems[0] : "";
        });
        editingCenterService.getSiteInfo($stateParams.site).then(function(data) {
            $scope.data.siteMsg = data;
        });
    }
    //数据请求函数
    function requestData() {
        var defferd = $q.defer();
        trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), $scope.params, 'get').then(function(data) {
            defferd.resolve(data);
        });
        return defferd.promise;
    }
    $scope.btnClick = function(item) {
        $scope.click_btn = item;
    };
    //鼠标移入
    $scope.getInSelectedChl = function(appItem) {
        $scope.selectedChannel = appItem;
    };
    //搜索
    $scope.searchChannelByName = function(ev) {
        if ((angular.isDefined(ev) && ev.keyCode == 13) || angular.isUndefined(ev)) {
            $scope.params.methodname = "queryChannelsBySite";
            $scope.params.ChnlDesc = $scope.searchChlName;
            requestData().then(function(data) {
                $scope.appItems = data;
            });
        }
    };

    function initStatus() {
        $scope.params = {
            serviceid: "mlf_appconfig",
            methodname: "queryChannelsBySite",
            SiteId: $stateParams.site
        };
        $scope.status = {
            PmmAppChnlSelected: $stateParams.appselect,
            right: {}, //栏目列表操作权限
        };
        $scope.data = {
            siteMsg: "",
        };
        $scope.selectedChannel = "";
        getChnlRights();
    }
    //删除弹窗
    $scope.delete = function(appItem) {
        var deleteParams = {
            serviceid: "mlf_appconfig",
            methodname: "deleteChannel",
            ChannelId: appItem.CHANNELID,
            TopChannelId: '0'
        };
        trsconfirm.inputModel("确认删除此频道", "输入删除的理由，可选填", function(data) {
            productMangageMentAppService.inputPassword(function(password) {
                LazyLoad.js(["./lib/js-base64/base64.js"], function() {
                    deleteParams.PassWord = "__encoded__" + Base64.encode(angular.copy(password));
                    trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), deleteParams, "post")
                        .then(function(data) {
                            $rootScope.$broadcast("leftAddAppChannel", appItem);
                            trsconfirm.alertType("删除频道成功", "", "success", false, function() {
                                requestData().then(function(data) {
                                    $scope.appItems = data;
                                    $scope.appItems !== "" ? $scope.selectedChannel = $scope.appItems[0] : "";
                                });
                            });
                        });
                });
            });
        });
    };
    //修改弹窗
    $scope.modify = function(appItem) {
        var column = {
            title: "修改频道",
            isColumn: false
        };
        modifyViews(column, function(data) {

        }, appItem);
    };
    //新增弹窗
    $scope.add = function() {
        var column = {
            title: "新建频道",
            isColumn: false
        };
        modifyViews(column, function(data) {

        }, "");
    };
    //发布栏目
    $scope.publish = function(appItem) {
        websiteService.websitePublish(appItem.CHANNELID, "101");
    };
    //删除弹窗方法
    $scope.deleteViews = function(item, successFn) {
        var modalInstance = $modal.open({
            templateUrl: "./manageConfig/productManageMent/app/channel/template/channel_delete_tpl.html",
            windowClass: 'productManageMent-app-channel-delete',
            backdrop: false,
            controller: "appchannelDeleteCtrl",
            resolve: {
                item: function() {
                    return item;
                },
                successFn: function() {
                    return successFn;
                }
            }
        });
        return modalInstance.result.then(function(result) {});
    };
    //修改弹窗方法
    // $scope.modifyViews = function(column, successFn, appChannel) {
    //     var modalInstance = $modal.open({
    //         templateUrl: "./manageConfig/productManageMent/app/channel/template/channel_modify_tpl.html",
    //         windowClass: 'productManageMent-app-channel-modify',
    //         backdrop: false,
    //         controller: "appchannelModifyCtrl",
    //         resolve: {
    //             column: function() {
    //                 return column;
    //             },
    //             successFn: function() {
    //                 return successFn;
    //             },
    //             appChannel: function() {
    //                 return appChannel;
    //             }
    //         }
    //     });
    //     return modalInstance.result.then(function(result) {
    //         $rootScope.$broadcast("leftAddAppChannel", appChannel);
    //         $scope.params = result;
    //         $scope.params.serviceid = "mlf_appconfig";
    //         $scope.params.methodname = "saveNewChnl";
    //         $scope.params.TopChannelId = '0';
    //         $scope.params.CHNLDATAPATH = result.DATAPATH;
    //         requestData().then(function() {
    //             $scope.params = {
    //                 serviceid: "mlf_appconfig",
    //                 methodname: "queryChannelsBySite",
    //                 SiteId: $stateParams.site
    //             };
    //             requestData().then(function(data) {
    //                 $scope.appItems = data;
    //                 $scope.appItems !== "" ? $scope.selectedChannel = $scope.appItems[0] : "";
    //                 trsconfirm.alertType(column.title + '成功', "", "success", false, function() {});
    //             });
    //         });
    //     });
    // };
    /**
     * [modifyViews description] 
     * @param  {[type]} column     [description] 模态框名称
     * @param  {[type]} successFn  [description] 
     * @param  {[type]} appChannel [description] 选中的频道
     * @return {[type]}            [description] null
     */
    function modifyViews(column, successFn, appChannel) {
        var modalInstance = $modal.open({
            templateUrl: "./manageConfig/productManageMent/app/channel/template/channel_modify_tpl.html",
            windowClass: 'productManageMent-app-channel-modify',
            backdrop: false,
            controller: "appchannelModifyCtrl",
            resolve: {
                channelObj: function(){
                    var channelObj = {};
                    channelObj.column = column;
                    channelObj.appItems = $scope.appItems;
                    channelObj.appChannelIndex = $scope.appItems.indexOf(appChannel);
                    return channelObj;
                }
            }
        });
        modalInstance.result.then(function(result) {
            requestData().then(function(data) {
                var title = appChannel ? "修改频道成功" : "新增频道成功";
                $scope.appItems = data;
                $scope.selectedChannel = $scope.appItems !== "" ? $scope.appItems[0] : ""; //刷新页面选中第一个频道
                trsconfirm.alertType(title, "", "success", false);
            });
        }, function() {});
    }
    //栏目预览
    $scope.preview = function(appItem) {
        websiteService.websiteChannelPreview(appItem);
    };
}]);
