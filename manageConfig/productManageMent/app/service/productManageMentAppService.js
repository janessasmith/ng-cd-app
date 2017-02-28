/**
 * Created by MRQ on 2016/1/6.
 */
"use strict";
angular.module("productManageMentAppServiceModule", [
        'productManageMentAppServiceCtrlModule',
        'productManageMentAppDeleteViewsModule',
        'productManageMentAppModifyViewsModule',
        "appBindTemplateModule",
        "appInputPasswordModule",
        "manageConfigSingleChooseChnlModule",
        "manageConfigBatChooseChnlModule"
    ])
    .factory("productMangageMentAppService", ["$q", "$modal", "localStorageService", "trsHttpService", "globleParamsSet", "trsconfirm", function($q, $modal, localStorageService, trsHttpService, globleParamsSet, trsconfirm) {
        return {
            //删除弹窗
            deleteViews: function(successFn) {
                var modalInstance = $modal.open({
                    templateUrl: "./manageConfig/productManageMent/app/service/delete/app_delete_tpl.html",
                    windowClass: 'productManageMent-app-delete-view',
                    backdrop: false,
                    controller: "productManageMentAppDeleteViewsCtrl",
                    resolve: {
                        successFn: function() {
                            return successFn;
                        }
                    }
                });
                return modalInstance.result.then(function(result) {
                    //success(result);
                });
            },
            //修改弹窗
            modifyViews: function(title, successFn) {
                var modalInstance = $modal.open({
                    templateUrl: "./manageConfig/productManageMent/app/service/modify/app_modify_tpl.html",
                    windowClass: 'productManageMent-app-modify-view',
                    backdrop: false,
                    controller: "productManageMentAppChannelModifyViewsCtrl",
                    resolve: {
                        title: function() {
                            return title;
                        },
                        successFn: function() {
                            return successFn;
                        }
                    }
                });
                return modalInstance.result.then(function(result) {
                    // success(result);
                });
            },
            //回收站删除弹窗
            recycleDeleteViews: function(params, success) {
                var modalInstance = $modal.open({
                    templateUrl: "./manageConfig/productManageMent/app/service/template/recycle_bin_delete_view.html",
                    windowClass: 'productManageMent-app-recycle-delete',
                    backdrop: false,
                    controller: "productManageMentAppRecycleDeleteCtrl",
                    resolve: {
                        params: function() {
                            return params;
                        }
                    }
                });
                return modalInstance.result.then(function(result) {
                    success();
                });
            },
            //回收站还原弹窗
            recycleReductionViews: function(params, success) {
                var modalInstance = $modal.open({
                    templateUrl: "./manageConfig/productManageMent/app/service/template/recycle_bin_reduction_view.html",
                    windowClass: 'productManageMent-app-recycle-reduction',
                    backdrop: false,
                    controller: "productManageMentAppRecycleReductionCtrl",
                    resolve: {
                        params: function() {
                            return params;
                        }
                    }
                });
                return modalInstance.result.then(function(result) {
                    success();
                });
            },
            bindTemplate: function(params, success) {
                var modalInstance = $modal.open({
                    templateUrl: "./manageConfig/productManageMent/app/service/bindTemplate/channl_tpl.html",
                    windowClass: 'pmm-app-column-modify-channl-other',
                    backdrop: false,
                    resolve: {
                        params: function() {
                            return params;
                        }
                    },
                    controller: "columnChannelOtherViewsCtrl"
                });
                modalInstance.result.then(function(result) {
                    success(result);
                });
            },
            /**
             * [bindViewTemplate description] 绑定视图弹窗
             * @return {[type]}  [description] null
             */
            bindViewTemplate: function(params, title, success) {
                var modalInstance = $modal.open({
                    templateUrl: "./manageConfig/productManageMent/app/service/bindTemplate/channel_view_tpl.html",
                    windowClass: 'pmm-app-column-modify-channl-other',
                    backdrop: false,
                    resolve: {
                        title: function() {
                            return title;
                        },
                        params: function() {
                            return params;
                        }
                    },
                    controller: 'columnChannelBindViewCtrl'
                });
                modalInstance.result.then(function(result) {
                    success(result);
                });
            },
            inputPassword: function(success) {
                var modalInstance = $modal.open({
                    templateUrl: "./manageConfig/productManageMent/app/service/inputPassword/inputPassword_tpl.html",
                    windowClass: 'productManageMent-app-channel-delete',
                    backdrop: false,
                    controller: "inputPasswordCtrl"
                });
                modalInstance.result.then(function(result) {
                    success(result);
                });
            },
            singleChooseChnl: function(modalTitle, siteid, channelid, success) {
                var modalInstance = $modal.open({
                    templateUrl: "./manageConfig/productManageMent/app/service/singleChooseChnl/singleChooseChnl_tpl.html",
                    windowClass: 'app-move-window',
                    backdrop: false,
                    controller: "manageConfigsingleChooseChnlCtrl",
                    resolve: {
                        draftParams: function() {
                            return {
                                "siteid": siteid,
                                "channelid": channelid,
                                "modalTitle": modalTitle
                            };
                        }
                    }
                });
                modalInstance.result.then(function(result) {
                    success(result);
                });
            },
            /**
             * [getRight description]获取栏目或站点的操作权限
             * @return object [description]
             */
            getRight: function(siteId, channelId, classify) {
                var deffer = $q.defer();
                var params = {
                    serviceid: "mlf_metadataright",
                    methodname: "queryOperKeyById",
                    SiteId: siteId,
                    ChannelId: channelId,
                    Classify: classify
                };
                if (siteId === "") {
                    delete params.SiteId;
                } else {
                    delete params.ChannelId;
                }
                trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), params, "post")
                    .then(function(data) {
                        deffer.resolve(globleParamsSet.handlePermissionData(data));
                    });
                return deffer.promise;
            },
            /**
             * [getOperType description]获取可以看到或操作的底部标签 如：频道管理，碎片化管理，模板管理，分发配置
             * @return object [description]
             */
            getOperType: function(siteId, channelId) {
                var deffer = $q.defer();
                var params = {
                    serviceid: "mlf_metadataright",
                    methodname: "queryOperTypesByAppBaseChnlId",
                    ChannelId: channelId,
                    SiteId: siteId
                };
                if (siteId === "") {
                    delete params.SiteId;
                } else {
                    delete params.ChannelId;
                }
                trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), params, "post")
                    .then(function(data) {
                        deffer.resolve(globleParamsSet.handlePermissionData(data));
                    });
                return deffer.promise;
            },
            /**
             * [getOperType description]获取可以看到或操作的底部标签 如：频道管理，碎片化管理，模板管理，分发配置
             * @return object [description]
             */
            getChannelAccessAuthority: function(siteId) {
                var deffer = $q.defer();
                this.getOperType(siteId, "").then(function(data) {
                    var router = "";
                    for (var key in data) {
                        switch (key) {
                            case "channel":
                                router += "channel";
                                break;
                            case "template":
                                router += "template";
                                break;
                        }
                        break;
                    }
                    if (router === "") {
                        trsconfirm.alertType("您无权查看该站点下的频道", "您无权查看该站点下的频道", "error", false);
                    } else {
                        deffer.resolve({ data: data, router: router });
                    }
                });
                return deffer.promise;
            },
            /**
             * [getOperType description]获取可以看到或操作的底部标签 如：栏目管理，碎片化管理，模板管理
             * @return object [description]
             */
            getCloumnAccessAuthority: function(channelId) {
                var deffer = $q.defer();
                this.getOperType("", channelId).then(function(data) {
                    var router = "";
                    for (var key in data) {
                        switch (key) {
                            case "channel":
                                router += "column";
                                break;
                            case "template":
                                router += "template";
                                break;
                        }
                        break;
                    }
                    if (router === "") {
                        trsconfirm.alertType("您无权查看该頻道下的栏目", "", "error", false);
                    } else {
                        deffer.resolve({ "data": data, "router": router });
                    }
                });
                return deffer.promise;
            },
            batChooseChnl: function(modalTitle, siteid, success, radio) {
                var modalInstance = $modal.open({
                    templateUrl: "./manageConfig/productManageMent/app/service/batChooseChnl/batChooseChnl_tpl.html",
                    windowClass: 'app-batChooseChnl-window',
                    backdrop: false,
                    controller: "manageConfigBatChooseChnlCtrl",
                    resolve: {
                        chnlParams: function() {
                            return {
                                "siteid": siteid,
                                "modalTitle": modalTitle,
                                "radio": radio
                                    /*"channelid": channelid,
                                    "METADATAIDS": METADATAIDS,
                                    "methodname": methodname*/
                            };
                        }
                    }
                });
                modalInstance.result.then(function(result) {
                    success(result);
                });
            }
        };
    }]);
