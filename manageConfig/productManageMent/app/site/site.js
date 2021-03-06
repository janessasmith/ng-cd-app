"use strict";
angular.module('manageProAppSiteModule', [
    "mangeProAppSiteServiceModule",
    'productManageMentAppSiteRouterModule',
    'productManageMentAppSiteRecycleBinModule'
]).
controller('manageAppSiteController', ['$scope', '$rootScope', '$modal', '$timeout', "$location", "$state", "$stateParams", "$q", "trsHttpService", "localStorageService", "trsconfirm", "productMangageMentAppService", "permissionService", "websiteService", function($scope, $rootScope, $modal, $timeout, $location, $state, $stateParams, $q, trsHttpService, localStorageService, trsconfirm, productMangageMentAppService, permissionService, websiteService) {
    initStatus();
    initData();
    /**
     * [getSiteRights description]获取每个站点的操作权限
     * @return null [description]
     */
    $scope.getSiteRights = function(item) {
        productMangageMentAppService.getRight(item.SITEID, "", "appsetsite.site").then(function(data) {
            $scope.status.rights[item.SITEID] = data;
        });
    };
    //获取站点操作权限结束
    $scope.addViews = function() {
        saveSite("站点管理-新增站点", "", $scope.status.data.sites);
    };
    /**
     * [clickSiteDirected description]点击站点重定向开始
     * @return null [description]
     */
    $scope.clickSiteDirected = function(item) {
        productMangageMentAppService.getChannelAccessAuthority(item.SITEID).then(
            function(data) {
                //將权限信息存入缓存，用于底部路由区加载使用开始
                localStorageService.remove("appRightOperType_site"); //初始化缓存
                localStorageService.set("appRightOperType_site", {
                    type: data.router,
                    data: data.data
                });
                //將权限信息存入缓存，用于底部路由区加载使用结束
                $state.go("manageconfig.productmanage.app." + data.router);
                //联动展开左边树
                $rootScope.$broadcast("expandAppLeftTree", "site");
            }
        );
        /*productMangageMentWebsiteService.getOperType(item.SITEID, "").then(function(data) {
            var router = "";
            for (var key in data) {
                switch (key) {
                    case "channel":
                        router += "channel";
                        break;
                    case "template":
                        router += "template";
                        break;
                    case "widget":
                        router += "fragment";
                        break;
                    case "publishdistribution":
                        router += "distributeconfig";
                        break;
                }
                break;
            }
            if (router === "") {
                trsconfirm.alertType("您无权查看该站点下的频道", "您无权查看该站点下的频道", "error", false);
            } else {
                //將权限信息存入缓存，用于底部路由区加载使用开始
                localStorageService.remove("appRightOperType_site"); //初始化缓存
                localStorageService.set("appRightOperType_site", { type: router, data: data });
                //將权限信息存入缓存，用于底部路由区加载使用结束
                $state.go("manageconfig.productmanage.website." + router);
            }
        });*/
    };
    $scope.modifyViews = function(item) {
        var modParams = {
            serviceid: "mlf_appconfig",
            methodname: "findAppSiteById",
            SiteId: item.SITEID
        };
        trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), modParams, "post")
            .then(function(data) {
                $rootScope.$broadcast("leftAddAppSite", true);
                var siteInfo = {
                    ObjectId: item.SITEID,
                    repeatUseTime: data.REPEATUSETIME,
                    SiteName: data.SITEDESC,
                    SiteDesc: data.SITEDESC,
                    DataPath: data.DATAPATH,
                    SiteOrder: data.SITEORDER,
                    RootDoMain: data.ROOTDOMAIN,
                    CheckFgdAttribute: parseInt(data.CHECKFGDATTRIBUTE),
                    temp: {},
                    otherTemp: {},
                    xilanTemp: {},
                    picsize: data.PICSIZE,
                };
                //编辑时默认绑定模板数据转换开始
                siteInfo.temp.TEMPID = angular.isDefined(data.GAILANTEMP[0]) ? data.GAILANTEMP[0].TEMPID : "0";
                siteInfo.otherTemp.TEMPID = angular.isDefined(data.OTHERTEMP[0]) ? data.OTHERTEMP[0].TEMPID : "0";
                siteInfo.xilanTemp.TEMPID = angular.isDefined(data.DOCTEMP[0]) ? data.DOCTEMP[0].TEMPID : "0";
                siteInfo.temp.TEMPNAME = angular.isDefined(data.GAILANTEMP[0]) ? data.GAILANTEMP[0].TEMPNAME : "";
                siteInfo.otherTemp.TEMPNAME = angular.isDefined(data.OTHERTEMP[0]) ? data.OTHERTEMP[0].TEMPNAME : "";
                siteInfo.xilanTemp.TEMPNAME = angular.isDefined(data.DOCTEMP[0]) ? data.DOCTEMP[0].TEMPNAME : "";
                siteInfo.siteId = $stateParams.site;
                //编辑时默认绑定模板数据转换结束
                saveSite("站点管理-修改站点", siteInfo, $scope.status.data.sites);
            });
    };
    //发布站点
    $scope.publish = function(item) {
        websiteService.websitePublish(item.SITEID, "103");
    };
    //预览站点
    $scope.preview = function(item) {
        var preParams = {
            serviceid: "mlf_publish",
            methodname: "preview",
            ObjectIds: item.SITEID,
            ObjectType: "103",
            TopChannelId: '0',
        };
        trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), preParams, "post")
            .then(function(data) {
                window.open(data.DATA[0].URLS[0]);
            });
    };
    $scope.deleteSite = function(item) {
        var deleteParams = {
            serviceid: "mlf_appconfig",
            methodname: "deleteSite",
            SiteId: item.SITEID
        };
        trsconfirm.inputModel("确认删除此站点", "输入删除的理由，可选填", function(data) {
            productMangageMentAppService.inputPassword(function(password) {
                LazyLoad.js(["./lib/js-base64/base64.js"], function() {
                    deleteParams.PassWord = "__encoded__" + Base64.encode(angular.copy(password));
                    trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), deleteParams, "post")
                        .then(function(data) {
                            trsconfirm.alertType("删除站点成功", "", "success", false, function() {
                                $rootScope.$broadcast("leftAddAppSite", true);
                                requestData().then(function(data) {
                                    $scope.status.data.sites = data.DATA;
                                    $state.transitionTo($state.current, $stateParams, {
                                        reload: false
                                    });
                                });
                            });
                        });
                });
            });
        });
    };
    $scope.search = function(ev) {
        if((angular.isDefined(ev) && ev.keyCode == 13) || angular.isUndefined(ev)) {
            $scope.status.params.SiteDesc = $scope.searchWord;
            /*$state.transitionTo($state.current, $stateParams, {
                reload: false
            });*/
            trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), $scope.status.params, "post").then(
                function(data) {
                    localStorageService.set("manageconfig.app.sites", data);
                    $scope.status.data.sites = data.DATA;
                    /*$state.transitionTo($state.current, $stateParams, {
                        reload: true
                    });*/
                });
        }
    };

    function initStatus() {

        $scope.status = {
            routerPath: $location.path().split("/"),
            data: {
                sites: "",
                selectedSite: "",
            },
            params: {
                'serviceid': "mlf_appconfig",
                'methodname': "queryAppSites",
                'SiteDesc': $stateParams.sitedesc
            },
            rights: {}
        };
        permissionService.isAdministrator().then(function(data) {
            $scope.status.isAdministrator = data; //是否是系统管理员
        });
    }
    //
    $scope.$on("leftSaveAppToChildren", function(event, value) {
        initData();
    });

    function initData() {
        requestData().then(function(data) {
            $scope.status.data.sites = data.DATA;
            $scope.status.data.selectedSite = getSiteById($scope.status.data.sites, $location.search().site);
            $scope.searchWord = $stateParams.sitedesc;
        });
    }

    function getSiteById(sites, siteid) {
        if (angular.isDefined(sites)) {
            for (var i = 0; i < sites.length; i++) {
                if (sites[i].SITEID == siteid)
                    return sites[i];
            }
        }
    }

    function requestData() {
        var deferred = $q.defer();
        trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), $scope.status.params, 'get').then(function(data) {
            deferred.resolve(data);
        });
        return deferred.promise;
    }

    function saveSite(title, siteInfo, allSite) {
        var modalInstance = $modal.open({
            templateUrl: "./manageConfig/productManageMent/app/site/template/app_modify_tpl.html",
            windowClass: 'productManageMent-app-modify-view',
            backdrop: false,
            controller: "mangeProAppSiteModCtrl",
            resolve: {
                /*title: function() {
                    return "站点管理-新增站点";
                },
                */
                params: function() {
                    return {
                        title: title,
                        siteInfo: siteInfo,
                        allSite: allSite,
                    };
                }
            }
        });
        modalInstance.result.then(function(newsite) {
            newsite.serviceid = "mlf_appconfig";
            newsite.methodname = "saveNewSite";
            newsite.SiteDesc = newsite.SiteDesc;
            trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), newsite, "post").then(function(data) {
                trsconfirm.alertType("保存成功", "", "success", false, function() {
                    $rootScope.$broadcast("leftAddAppSite", true);
                    requestData().then(function(data) {
                        $scope.status.data.sites = data.DATA;
                        $state.transitionTo($state.current, $stateParams, {
                            reload: false
                        });
                    });
                });
            });
        });
    }
}]);
