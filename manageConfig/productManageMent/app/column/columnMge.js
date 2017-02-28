/*
 Create by smg  2015-12-23
 */
"use strict";
angular.module("productManageMentAppColumnModule", [
        'mangeAppProColumnCtrlModule',
        'productManageMentAppColumnRecycleBinModule',
        'productManageMentAppColumnRouterModule'
    ])
    .controller("productManageMentAppColumnCtrl", ['$scope', '$rootScope', '$q', '$state', '$modal', '$stateParams', 'trsHttpService', "websiteService", "trsconfirm", "productMangageMentAppService", "localStorageService", function($scope, $rootScope, $q, $state, $modal, $stateParams, trsHttpService, websiteService, trsconfirm, productMangageMentAppService, localStorageService) {
        initStatus();
        initData();
        /**
         * [getChannelPath description]获得栏目的全路径
         * @return {[type]} [description]
         */
        function getChannelPath() {
            var params = {
                "serviceid": "mlf_mediasite",
                "methodname": "getChannelIdPath",
                "ChannelId": $stateParams.channel,
                "Burster": ">"
            };
            trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), params, "get").then(function(data) {
                $scope.data.channelPath = data;
                if (data.length > 0) {
                    $scope.data.siteName = data[0].SITENAME;
                    $scope.data.siteId = data[0].SITEID;
                }
            });
        }
        /**
         * [positionToChannel description]定位到站点
         * @return {[type]} [description]
         */
        $scope.positionToSite = function() {
            $state.go("manageconfig.productmanage.app.channel", { site: $scope.data.siteId }, { reload: true });
        };
        /**
         * [positionToChannel description]定位到频道
         * @return {[type]} [description]
         */
        $scope.positionToChannel = function(chnnel) {
            $state.go("manageconfig.productmanage.app.column", { site: $scope.data.siteId, channel: chnnel.CHANNELID }, { reload: true });
        };
        //初始化数据
        //获取栏目操作权限开始
        function getChnlRights() {
            productMangageMentAppService.getRight("", $stateParams.parentchnl, "appsetchannel.channel").then(function(data) {
                $scope.status.right = data;
            });
        }
        /**
         * [clickSiteDirected description]点击站点重定向开始
         * @return null [description]
         */
        $scope.clickChnlDirected = function(item) {
            productMangageMentAppService.getCloumnAccessAuthority($stateParams.parentchnl).then(function(data) {
                //將权限信息存入缓存，用于底部路由区加载使用开始
                localStorageService.set("appRightOperType", {
                    type: data.router,
                    data: data.data
                });
                $rootScope.$broadcast("expandAppLeftTree", "column");
                //將权限信息存入缓存，用于底部路由区加载使用结束
                $state.go("manageconfig.productmanage.app.column", {
                    channel: item.CHANNELID,
                    parentchnl: $stateParams.parentchnl
                });
            });
            $rootScope.$broadcast("expandAppLeftTree", "column");
            //將权限信息存入缓存，用于底部路由区加载使用结束
            // $state.go("manageconfig.productmanage.app.column", {
            //     channel: item.CHANNELID,
            //     parentchnl: $stateParams.parentchnl
            // });
        };
        //获取栏目操作权限结束
        function initData() {
            requestData().then(function(data) {
                $scope.appItems = data;
                $scope.appItems !== "" ? $scope.selectedColumn = $scope.appItems[0] : "";
                initChannel();
            });
            getChannelPath();
        }
        //数据请求函数
        function requestData() {
            var defferd = $q.defer();
            trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), $scope.params, "get").then(function(data) {
                defferd.resolve(data);
            });
            return defferd.promise;
        }
        $scope.enderInColumn = function(appItem) {
            $scope.selectedColumn = appItem;
        };
        //搜索栏目
        $scope.searchColumn = function(ev) {
            if ((angular.isDefined(ev) && ev.keyCode == 13) || angular.isUndefined(ev)) {
                $scope.params.serviceid = "mlf_appconfig";
                $scope.params.methodname = "queryChannelsByChannel";
                $scope.params.ChannelId = $stateParams.channel;
                $scope.params.ChnlDesc = $scope.searchColumnByName;
                requestData().then(function(data) {
                    $scope.appItems = data;
                });
            }
        };
        //鼠标移入
        $scope.getInSelectedChl = function(appItem) {
            $scope.selectedColumn = appItem;
        };

        function initStatus() {
            $scope.status = {
                PmmAppChnlSelected: $stateParams.appselect,
                right: {}
            };
            $scope.params = {
                serviceid: "mlf_appconfig",
                methodname: "queryChannelsByChannel",
                ChannelId: $stateParams.channel
            };
            $scope.data = {
                channelPath: "",
            };
            $scope.superiorChn = $stateParams.channel;
            getChnlRights();
        }

        // function initChannel() {
        //     $scope.params.serviceid = "mlf_mediasite";
        //     $scope.params.methodname = "getBroChannels";
        //     $scope.params.ChannelId = $stateParams.channel;
        //     requestData().then(function(data) {
        //         $scope.channels = data;
        //         var array = $scope.channels.pop();
        //         $scope.channels.unshift(array);
        //     });
        // };

        function initChannel() {
            var params = {
                serviceid: 'mlf_mediasite',
                methodname: "getBroChannels",
                ChannelId: $stateParams.channel
            };
            trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), params, 'get').then(function(data) {
                $scope.channels = data;
                var array = $scope.channels.pop();
                $scope.channels.unshift(array);
            });
        }
        //栏目移动弹窗
        // $scope.moveViews = function() {
        //     productMangageMentAppService.singleChooseChnl("移动栏目", $stateParams.site, $scope.selectedColumn.CHANNELID, function(data) {
        //         delete $scope.params.ChannelId;
        //         if (angular.isDefined(data.CHANNELID)) {
        //             $scope.params.ChannelId = data.CHANNELID;
        //             $scope.targetDesc = data.CHNLDESC;
        //         } else {
        //             $scope.targetDesc = data.SITEDESC;
        //         }
        //         $scope.params.SiteId = $stateParams.site;
        //         $scope.params.serviceid = "mlf_appconfig";
        //         $scope.params.methodname = "moveToBaseChannel";
        //         $scope.params.FromChnlId = $scope.selectedColumn.CHANNELID;
        //         $scope.params.TopChannelId = $stateParams.parentchnl;
        //         requestData().then(function(data) {
        //             $rootScope.$broadcast("leftAddAppColum", true);
        //             trsconfirm.alertType("栏目移动成功", "该栏目成功移动到" + $scope.targetDesc, "success", false, function() {
        //                 $scope.params.serviceid = "mlf_appconfig";
        //                 $scope.params.methodname = "queryChannelsByChannel";
        //                 $scope.params.ChannelId = $stateParams.channel;
        //                 requestData().then(function(data) {
        //                     $scope.appItems = data;
        //                 });
        //             });
        //         });
        //     });
        // };
        //删除弹窗
        $scope.delete = function(appColumn) {
            var deleteParams = {
                serviceid: "mlf_appconfig",
                methodname: "deleteChannel",
                ChannelId: appColumn.CHANNELID,
                TopChannelId: $stateParams.parentchnl
            };
            trsconfirm.inputModel("确认删除此栏目", "输入删除的理由，可选填", function(data) {
                productMangageMentAppService.inputPassword(function(password) {
                    LazyLoad.js(["./lib/js-base64/base64.js"], function() {
                        deleteParams.PassWord = "__encoded__" + Base64.encode(angular.copy(password));
                        trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), deleteParams, "post")
                            .then(function(data) {
                                trsconfirm.alertType("删除成功", "删除栏目成功", "success", false, function() {
                                    $rootScope.$broadcast("leftAddAppColum", appColumn);
                                    requestData().then(function(data) {
                                        $scope.appItems = data;
                                        $scope.selectedColumn = $scope.appItems[0];
                                    });
                                });
                            });
                    });
                });
            });
        };
        //修改弹窗
        $scope.modify = function(appChannel) {
            var column = {
                title: "修改栏目",
                isColumn: true
            };
            modifyViews(column, function(data) {}, appChannel);
        };
        //新增弹窗
        $scope.add = function() {
            var column = {
                title: "新增栏目",
                isColumn: true
            };
            modifyViews(column, function(data) {}, "");
        };
        //发布频道
        $scope.publish = function(appItem) {
            websiteService.websitePublish(appItem.CHANNELID, "101");
        };
        //删除弹窗方法
        $scope.deleteViews = function(item, successFn) {
            var modalInstance = $modal.open({
                templateUrl: "./manageConfig/productManageMent/app/column/template/column_delete_tpl.html",
                windowClass: 'productManageMent-app-column-delete',
                backdrop: false,
                controller: "appcolumnDeleteCtrl",
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
        //         controller: "appcolumnModifyCtrl",
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
        //         $scope.params = result;
        //         $scope.params.serviceid = "mlf_appconfig";
        //         $scope.params.methodname = "saveNewChnl";
        //         $scope.params.TopChannelId = $stateParams.parentchnl;
        //         $scope.params.CHNLDATAPATH = result.DATAPATH;
        //         requestData().then(function(data) {
        //             $rootScope.$broadcast("leftAddAppColum", appChannel);
        //             $scope.params = {
        //                 serviceid: "mlf_appconfig",
        //                 methodname: "queryChannelsByChannel",
        //                 ChannelId: $stateParams.channel
        //             };
        //             requestData().then(function(data) {
        //                 $scope.appItems = data;
        //                 $scope.appItems !== "" ? $scope.selectedChannel = $scope.appItems[0] : "";
        //                 trsconfirm.alertType(column.title, column.title + '成功', "success", false, function() {});
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
                    channelObj: function() {
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
                    var title = appChannel ? "修改栏目成功" : "新增栏目成功";
                    $scope.appItems = data;
                    $scope.selectedColumn = $scope.appItems !== "" ? $scope.appItems[0] : ""; //刷新页面选中第一个频道
                    trsconfirm.alertType(title, "", "success", false);
                });
            }, function() {});
        }
        //频道预览
        $scope.preview = function(appItem) {
            websiteService.websiteChannelPreview(appItem);
        };
    }]);
