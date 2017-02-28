"use strict";
/**
 * author ：you  2015/12/25
 */
angular.module('productManageMentLeftModule', []).
controller('productManageMentLeftController', ['$scope', "$timeout", '$state', '$stateParams', '$location', '$q', 'trsHttpService', '$modal', 'localStorageService', 'trsconfirm', "permissionService", "productMangageMentWebsiteService", "globleParamsSet", "productManageMentService", "trsColumnTreeLocationService", 'productMangageMentAppService',
    function($scope, $timeout, $state, $stateParams, $location, $q, trsHttpService, $modal, localStorageService, trsconfirm, permissionService, productMangageMentWebsiteService, globleParamsSet, productManageMentService, trsColumnTreeLocationService, productMangageMentAppService) {
        initStatus();

        // Tab 切换
        $scope.setTabSelected = function(moduleName) {
            $scope.isSelectedTab = moduleName;
            if (moduleName === "website") {
                delete $scope.selectedNode; //清除站点选中
                $state.go("manageconfig.productmanage.website.site");
            } else if (moduleName === "app") {
                delete $scope.appSelectedNode; //清除站点选中
                $state.go("manageconfig.productmanage.app.site");
            } else {
                $state.go("manageconfig.productmanage." + moduleName, {
                    site: $scope.status.data[moduleName].selectedItem.SITEID
                }, { reload: "manageconfig.productmanage." + moduleName });
            }
        };

        $scope.addFnWebsite = function() {
            var modalInstance = $modal.open({
                templateUrl: "./manageConfig/productManageMent/website/site/template/website_modify_tpl.html",
                windowClass: 'productManageMent-website-modify-view',
                backdrop: false,
                controller: "mangeProSiteModCtrl",
                resolve: {
                    params: function() {
                        return {
                            title: "站点管理-新增站点",
                            siteInfo: "",
                            allSite: $scope.status.data.website.items,
                        };
                    }
                }
            });
            modalInstance.result.then(function(newsite) {
                newsite.serviceid = "mlf_websiteconfig";
                newsite.methodname = "saveNewSite";
                newsite.SiteDesc = newsite.SiteDesc;
                trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), newsite, "post").then(function(data) {
                    trsconfirm.alertType("保存成功", "", "success", false, function() {
                        $scope.$emit("leftSaveWebSite", "");
                        initWebsiteData();
                    });
                });
            });
        };


        $scope.addFnApp = function() {
            var modalInstance = $modal.open({
                templateUrl: "./manageConfig/productManageMent/app/site/template/app_modify_tpl.html",
                windowClass: 'productManageMent-app-modify-view',
                backdrop: false,
                controller: "mangeProAppSiteModCtrl",
                resolve: {
                    params: function() {
                        return {
                            title: "站点管理-新增站点",
                            siteInfo: "",
                            allSite: $scope.status.data.app.items,
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
                        $scope.$emit("leftSaveApp", "");
                        initAppData();
                    });
                });
            });
        };

        function initStatus() {
            $scope.status = {
                routerPathes: $location.path().split('/'),
                isThisTabShow: 'app',
                more: {
                    moreTabList: [{
                        'name': '微信',
                        'id': "weixin"
                    }, {
                        'name': 'APP',
                        'id': 'app'
                    }, {
                        "name": "微博",
                        "id": "weibo"
                    }],
                    moreTabListItem: {
                        'name': '网站',
                        'id': "website"
                    },
                    isMoreTabListShow: false,
                },
                order: ["paper", "website", "app", "weixin", "weibo"],
                params: {
                    serviceid: "mlf_mediasite",
                    methodname: "queryWebSitesByMediaType",
                    // MediaType: '1' APP：1，网站：2，报纸：3，微信：4，微博：5
                },
                data: {
                    'newspaper': {
                        'items': '',
                        'selectedItem': 'newspapermgr',
                        'isSelectedTab': false
                    },
                    'website': {
                        'items': '',
                        'selectedItem': '',
                        'isSelectedTab': false
                    },
                    'app': {
                        'items': '',
                        'selectedItem': '',
                        'isSelectedTab': false
                    },
                    'weixin': {
                        'items': '',
                        'selectedItem': 'weixinmgr',
                        'isSelectedTab': false
                    },
                    'weibo': {
                        'items': '',
                        'selectedItem': 'weibomgr',
                        'isSelectedTab': false
                    }
                },
            };
            $scope.status.data[$scope.status.routerPathes[3]].isSelectedTab = true;
            $scope.status.isThisTabShow = ($scope.status.isThisTabShow !== $scope.status.routerPathes[3] && $scope.status.routerPathes[3] !== "website" && $scope.status.routerPathes[3] !== 'newspaper') ? $scope.status.routerPathes[3] : $scope.status.isThisTabShow
            permissionService.isAdministrator().then(function(data) {
                $scope.status.isAdministrator = data; //是否是系统管理员
            });
            $scope.treeExpanded = [];
            $scope.appTreeExpanded = [];
            $scope.websiteChannelPreview = function(node) {
                if (!!node.CHANNELID) {
                    globleParamsSet.websiteChannelPreview(node);
                } else {
                    previewSite(node);
                }
            };

            //左侧导航箭头内的导航
            $scope.setMoreTabRouter = function(position) {
                setMoreTabRouter(position);
                $scope.setTabSelected(position);
            };

            function setMoreTabRouter(position) {
                for (var i in $scope.status.configureAccess) {
                    if ($scope.status.configureAccess[i] == 2) {
                        var temp = $scope.status.configureAccess[position];
                        $scope.status.configureAccess[position] = 2;
                        $scope.status.configureAccess[i] = temp;
                    }
                }
                $scope.status.data[position].isSelectedTab = true;
            }
            /**
             * [previewSite description]预览站点
             * @return null [description]
             */
            function previewSite(node) {
                var queryTempParams = {
                    serviceid: "mlf_websiteconfig",
                    methodname: "findWebSiteById",
                    SiteId: node.SITEID
                };
                trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), queryTempParams, "post")
                    .then(function(data) {
                        if (angular.isDefined(data.GAILANTEMP[0])) {
                            var preParams = {
                                serviceid: "mlf_publish",
                                methodname: "preview",
                                ObjectIds: node.SITEID,
                                ObjectType: "103",
                                TemplateId: data.GAILANTEMP[0].TEMPID
                            };
                            trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), preParams, "post")
                                .then(function(data) {
                                    window.open(data.DATA[0].URLS[0]);
                                });
                        } else {
                            trsconfirm.alertType("该站点未设置概览模板", "该站点未设置概览模板", "error", false);
                        }
                    });

            }

            /**
             * [previewChnl description]预览栏目
             * @return null [description]
             */

            permissionService.getPermissionData().then(function(data) {
                $scope.status.configureAccess = data.product;
                $scope.status.routerAttr = getFirstRoot();
                if ($location.path().split('/').length === 3) goDefaultRouter();
                else {
                    initData();
                }
            });

            $scope.treeOpts = {
                nodeChildren: "CHILDREN",
                dirSelectable: true,
                allowDeselect: false,
                isTemplate: "webSite",
                injectClasses: {
                    //"label": "clearfixtree",
                },
                isLeaf: function(node) {
                    return node.HASCHILDREN == 'false';
                }
            };
            /**
             *  //右边联动左边树展开
             */
            $scope.$on("expandLeftTree", function(event, data) {
                if (data === "site") {
                    positionToSite();
                } else {
                    positionToChannel();
                }
            });
            $scope.$on("expandAppLeftTree", function(event, data) {
                if (data === "site") {
                    positionToAppSite();
                } else {
                    positionToAppChannel();
                }
            });
            /**
             *  //右边联动左边新增站点
             */
            $scope.$on("leftAddSite", function(event, data) {
                initWebsiteData();
            });
            $scope.$on("leftAddAppSite", function(event, data) {
                initAppData();
            });
            /**
             *  //右边联动左边新增栏目
             */
            $scope.$on("leftAddChannel", function(event, data) {
                $timeout(function() {
                    getChannelsBySite(angular.copy($scope.selectedNode), 'website').then(
                        function(data) {
                            $scope.selectedNode.CHILDREN = data;
                            $scope.selectedNode.HASCHILDREN = data.length === 0 ? "false" : "true";
                            if (data.length !== 0) {
                                $scope.treeExpanded.push($scope.selectedNode);
                            }
                        });
                }, 100);
            });
            $scope.$on("leftAddAppChannel", function(event, data) {
                $timeout(function() {
                    getChannelsBySite(angular.copy($scope.appSelectedNode), 'app').then(
                        function(data) {
                            $scope.appSelectedNode.CHILDREN = data;
                            $scope.appSelectedNode.HASCHILDREN = data.length === 0 ? "false" : "true";
                            if (data.length !== 0) {
                                $scope.appTreeExpanded.push($scope.appSelectedNode);
                            }
                        });
                }, 100);
            });
            /**
             *  //右边联动左边新增频道
             */
            $scope.$on("leftAddColum", function(event, data) {
                $timeout(function() {
                    getChannelsByChannel(angular.copy($scope.selectedNode), 'website').then(
                        function(data) {
                            $scope.selectedNode.CHILDREN = data.CHILDREN;
                            $scope.selectedNode.HASCHILDREN = data.CHILDREN.length === 0 ? "false" : "true";
                            if (data.CHILDREN.length !== 0) {
                                $scope.treeExpanded.push($scope.selectedNode);
                            }
                        });
                }, 100);
            });
            $scope.$on("leftAddAppColum", function(event, data) {
                $timeout(function() {
                    getChannelsByChannel(angular.copy($scope.appSelectedNode), 'app').then(
                        function(data) {
                            $scope.appSelectedNode.CHILDREN = data.CHILDREN;
                            $scope.appSelectedNode.HASCHILDREN = data.CHILDREN.length === 0 ? "false" : "true";
                            if (data.CHILDREN.length !== 0) {
                                $scope.appTreeExpanded.push($scope.appSelectedNode);
                            }
                        });
                }, 100);
            });
        }

        function initData() {
            initAppData().then(function() {
                return initWebsiteData();
            }).then(function() {
                routerForward();
            });
            // }).then(function() {
            //     return initAppData();
            // }).then(function() {
            //     return initWeiXinData();
            // }).then(function() {
            //     return initWeiboData();
            // }).then(function() {
            //     routerForward();
            // });
            //setWebChannlesBySite(176,1);
        }

        function initNewspaperData() {
            var deferred = $q.defer();
            trsHttpService.httpServer('./manageConfig/productManageMent/data/productManageMent.json', $scope.params, 'get').then(function(data) {
                $scope.status.data.newspaper.items = data.DATA.NEWSPAPER;
                $scope.status.data.newspaper.selectedItem = angular.isArray(data.DATA.NEWSPAPER) && data.DATA.NEWSPAPER.length > 0 ? data.DATA.NEWSPAPER[0] : '';
                deferred.resolve();
            });
            return deferred.promise;
        }

        function initWebsiteData() {
            var deferred = $q.defer();
            $scope.status.params.MediaType = 2;
            var params = {
                'serviceid': "mlf_websiteconfig",
                'methodname': "queryWebSites",
                'SiteDesc': $location.search().sitedesc
            };
            trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), params, 'get').then(function(data) {
                var siteData = [];
                for (var i = 0; i < data.DATA.length; i++) {
                    var site = data.DATA[i];
                    siteData.push({
                        SITEID: site.SITEID,
                        CHNLDESC: site.SITEDESC,
                        CHILDREN: [],
                        isSite: true
                    });

                }
                treeClassic(siteData);
                //setWebChannlesBySite(176,1);
                localStorageService.set("manageconfig.website.sites", data); //缓存站点
                deferred.resolve();
            });
            return deferred.promise;
        }

        function initAppData() {
            var deferred = $q.defer();
            $scope.status.params.MediaType = 1;
            var params = {
                'serviceid': "mlf_appconfig",
                'methodname': "queryAppSites",
                'SiteDesc': $location.search().sitedesc
            };
            trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), params, 'get').then(function(data) {
                var siteData = [];
                for (var i = 0; i < data.DATA.length; i++) {
                    var site = data.DATA[i];
                    siteData.push({
                        SITEID: site.SITEID,
                        CHNLDESC: site.SITEDESC,
                        CHILDREN: [],
                        isSite: true
                    });

                }
                appTreeClassic(siteData);
                //setWebChannlesBySite(176,1);
                localStorageService.set("manageconfig.app.sites", data); //缓存站点
                deferred.resolve();
            });
            return deferred.promise;
        }

        function initWeiXinData() {
            var deferred = $q.defer();
            trsHttpService.httpServer('./manageConfig/productManageMent/data/productManageMent.json', $scope.status.params, 'get').then(function(data) {
                $scope.status.data.weixin.items = data.DATA.WEIXIN;
                $scope.status.data.weixin.selectedItem = angular.isArray(data.WEIXIN) && data.WEIXIN.length > 0 ? data.WEIXIN[0] : '';
                deferred.resolve();
            });
            return deferred.promise;
        }

        function initWeiboData() {
            var deferred = $q.defer();
            // var params = {
            //     "serviceid": "wcm61_scmaccount",
            //     "methodname": "findAccountsToJson"
            // };
            trsHttpService.httpServer('./manageConfig/productManageMent/data/productManageMent.json', $scope.status.params, 'get').then(function(data) {
                $scope.status.data.weibo.items = data.DATA.WEIBO;
                $scope.status.data.weibo.selectedItem = angular.isArray(data.WEIBO) && data.WEIBO.length > 0 ? data.WEIBO[0] : '';
                deferred.resolve();
            });
            return deferred.promise;
        }

        function setDefaultSelectedItem() {
            angular.forEach($scope.status.data[$scope.status.routerPathes[3]].items, function(value, key) {
                if (value.SITEID === $location.search().params) {
                    $scope.status.data[$scope.status.routerPathes[3]].selectedItem = value;
                    return;
                }
            });
        }
        //路由重定向
        function routerForward() {
            var router = $scope.status.routerPathes[3];
            if ($scope.status.mediaNum > 3 && (router === 'weixin' || router === 'weibo')) {
                $scope.setMoreTabRouter(router);
            }
            $scope.status.data[$scope.status.routerPathes[3]].isSelectedTab = true;
        }

        function getSiteById(sites, siteid) {
            if (!angular.isDefined(siteid)) {
                return sites[0];
            } else if (angular.isDefined(sites)) {
                for (var i = 0; i < sites.length; i++) {
                    if (sites[i].SITEID == siteid) {
                        return sites[i];
                    }
                }
            }
        }

        function goDefaultRouter() {
            if ($scope.status.routerPathes.length === 3) {
                $state.go("manageconfig.productmanage." + $scope.status.routerAttr, {
                    site: $scope.status.data[$scope.status.routerAttr].selectedItem.SITEID
                }, {
                    reload: true
                });
                return;
            }
        }

        function getFirstRoot() {
            var routerAttr = "";
            var index = 0;
            for (var i = 0; i < $scope.status.order.length; i++) {
                var j = $scope.status.order[i];
                if ($scope.status.configureAccess[j] && routerAttr === "") {
                    routerAttr = j;
                }
                if ($scope.status.configureAccess[j]) {
                    $scope.status.configureAccess[j] = index;
                    index++;
                }
            }
            $scope.status.mediaNum = index;
            return routerAttr;
        }

        //按照站点获取网站栏目
        function getWebChnlsBySiteid(siteid, platform) {
            var deferred = $q.defer();
            var params = {
                serviceid: "mlf_mediasite",
                methodname: "queryClassifyBySite",
                siteid: siteid,
                platform: 1,
            };
            trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), params, "get")
                .then(
                    function(data) {
                        deferred.resolve(data);
                    },
                    function(data) {
                        deferred.reject(data);
                    });
            return deferred.promise;
        }
        //处理网站树选中状态
        function treeClassic(data) {
            $scope.treedata = data;
            var curRouter = $state.current;
            if (curRouter.name === "manageconfig.productmanage.website.channel") { //当前左边选中站点，右边展示站点下频道列表，树定位到指定站点
                positionToSite();
            } else if (curRouter.name === "manageconfig.productmanage.website.column") { //当前左边选中频道或栏目，右边显示该频道或栏目下的子栏目，树定位到指定栏目
                positionToChannel();
            }
        }
        //处理APP树选中状态
        function appTreeClassic(data) {
            $scope.appTreedata = data;
            var curRouter = $state.current;
            if (curRouter.name === "manageconfig.productmanage.app.channel") { //当前左边选中站点，右边展示站点下频道列表，树定位到指定站点
                positionToAppSite();
            } else if (curRouter.name === "manageconfig.productmanage.app.column") { //当前左边选中频道或栏目，右边显示该频道或栏目下的子栏目，树定位到指定栏目
                positionToAppChannel();
            }
        }

        //定位到站点
        function positionToSite() {
            $scope.selectedNode = $scope.treedata[productManageMentService.leftTreeChooseSite($scope.treedata, $location.search().site)];
        }

        function positionToAppSite() {
            $scope.appSelectedNode = $scope.appTreedata[productManageMentService.leftTreeChooseSite($scope.appTreedata, $location.search().site)];
        }
        //定位到频道或栏目
        function positionToChannel() {
            $timeout(function() {
                if (angular.isUndefined($location.search().channel)) return;
                getChannelsBySite($scope.treedata[productManageMentService.leftTreeChooseSite($scope.treedata, $location.search().site)], 'website').then(function() {
                    trsColumnTreeLocationService.columnTreeLocation($location.search().channel, $scope.treedata[productManageMentService.leftTreeChooseSite($scope.treedata, $location.search().site)], $scope.selectedNode, $scope.treeExpanded, function(tree, array, selectedNode) {
                        $scope.treedata[productManageMentService.leftTreeChooseSite($scope.treedata, $location.search().site)] = tree;
                        $scope.treeExpanded.push($scope.treedata[productManageMentService.leftTreeChooseSite($scope.treedata, $location.search().site)]);
                        $scope.selectedNode = selectedNode;
                    });
                });
            }, 600);
        }

        function positionToAppChannel() {
            $timeout(function() {
                if (angular.isUndefined($location.search().channel)) return;
                getChannelsBySite($scope.appTreedata[productManageMentService.leftTreeChooseSite($scope.appTreedata, $location.search().site)], 'app').then(function() {
                    trsColumnTreeLocationService.columnTreeLocation($location.search().channel, $scope.appTreedata[productManageMentService.leftTreeChooseSite($scope.appTreedata, $location.search().site)], $scope.appSelectedNode, $scope.appTreeExpanded, function(tree, array, selectedNode) {
                        $scope.appTreedata[productManageMentService.leftTreeChooseSite($scope.appTreedata, $location.search().site)] = tree;
                        $scope.appTreeExpanded.push($scope.appTreedata[productManageMentService.leftTreeChooseSite($scope.appTreedata, $location.search().site)]);
                        $scope.appSelectedNode = selectedNode;
                    });
                });
            }, 600)
        }
        //定位到栏目
        $scope.showSelected = function(sel) {
            $scope.selectedNode = sel;
            if (!!sel.CHANNELID) {
                productMangageMentWebsiteService.getCloumnAccessAuthority(sel.TOPCHNLID).then(function(data) {
                    //將权限信息存入缓存，用于底部路由区加载使用开始
                    localStorageService.remove("rightOperType_channel"); //初始化缓存
                    localStorageService.set("rightOperType_channel", {
                        type: data.router,
                        data: data.data
                    });
                    //將权限信息存入缓存，用于底部路由区加载使用结束
                    $state.go("manageconfig.productmanage.website." + data.router, {
                        channel: sel.CHANNELID,
                        parentchnl: sel.TOPCHNLID,
                        site: sel.SITEID
                    });
                });
            } else {
                productMangageMentWebsiteService.getChannelAccessAuthority(sel.SITEID).then(function(_data) {
                    //將权限信息存入缓存，用于底部路由区加载使用开始
                    localStorageService.remove("rightOperType_site"); //初始化缓存
                    localStorageService.set("rightOperType_site", { "type": _data.router, "data": _data.data });
                    //將权限信息存入缓存，用于底部路由区加载使用结束
                    var url = "manageconfig.productmanage.website." + _data.router;
                    $state.go(url, { site: sel.SITEID });

                    //$state.go("manageconfig.productmanage.website." + _data.router);
                });
            }
        };

        $scope.showAppSelected = function(sel) {
            $scope.appSelectedNode = sel;
            if (!!sel.CHANNELID) {
                productMangageMentAppService.getCloumnAccessAuthority(sel.TOPCHNLID).then(function(data) {
                    //將权限信息存入缓存，用于底部路由区加载使用开始
                    localStorageService.remove("appRightOperType_channel"); //初始化缓存
                    localStorageService.set("appRightOperType_channel", {
                        type: data.router,
                        data: data.data
                    });
                    //將权限信息存入缓存，用于底部路由区加载使用结束
                    $state.go("manageconfig.productmanage.app." + data.router, {
                        channel: sel.CHANNELID,
                        parentchnl: sel.TOPCHNLID,
                        site: sel.SITEID
                    });
                });
                // $state.go("manageconfig.productmanage.app." + "column", {
                //     channel: sel.CHANNELID,
                //     parentchnl: sel.TOPCHNLID,
                //     site: sel.SITEID
                // });
            } else {
                productMangageMentAppService.getChannelAccessAuthority(sel.SITEID).then(function(_data) {
                    //將权限信息存入缓存，用于底部路由区加载使用开始
                    localStorageService.remove("appRightOperType_site"); //初始化缓存
                    localStorageService.set("appRightOperType_site", { "type": _data.router, "data": _data.data });
                    //將权限信息存入缓存，用于底部路由区加载使用结束
                    var url = "manageconfig.productmanage.app." + _data.router;
                    $state.go(url, { site: sel.SITEID });
                    //$state.go("manageconfig.productmanage.website." + _data.router);
                });
                // var url = "manageconfig.productmanage.app." + "channel";
                // $state.go(url, { site: sel.SITEID });
            }
        };

        $scope.showToggle = function(node, type) {
            if (node.isSite && node.CHILDREN.length === 0) {
                getChannelsBySite(node, type);
            } else {
                if (node.HASCHILDREN == "true" && angular.isUndefined(node.CHILDREN)) {
                    getChannelsByChannel(node, type);
                }
            }

        };
        /**
         * [getChannelsBySite description]根据站点获取栏目
         * @return null [description]
         */
        function getChannelsBySite(node, type) {
            var deffer = $q.defer();
            var params;
            if (type == 'website') {
                params = {
                    serviceid: "mlf_websiteconfig",
                    methodname: "queryChannelsBySite",
                    siteid: node.SITEID,
                    platform: 4,
                };
            } else if (type == 'app') {
                params = {
                    serviceid: "mlf_appconfig",
                    methodname: "queryChannelsBySite",
                    siteid: node.SITEID,
                    platform: 1,
                };
            }
            trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), params, "get").then(function(data) {
                for (var i = 0; i < data.length; i++) {
                    data[i].TOPCHNLID = data[i].CHANNELID;
                    data[i].SITEID = node.SITEID;
                }
                node.CHILDREN = data;
                deffer.resolve(data);
            });
            return deffer.promise;
        }
        /**
         * [getChannelsByChannel description]根据父栏目获取栏目
         * @return null [description]
         */
        function getChannelsByChannel(node, type) {
            var deffer = $q.defer();
            var paramsChnl;
            if (type == 'website') {
                paramsChnl = {
                    serviceid: "mlf_websiteconfig",
                    methodname: "queryChannelsByChannel",
                    channelid: node.CHANNELID,
                    platform: 4,
                };
            } else if (type == 'app') {
                paramsChnl = {
                    serviceid: "mlf_appconfig",
                    methodname: "queryChannelsByChannel",
                    channelid: node.CHANNELID,
                    platform: 1,
                };
            }
            trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), paramsChnl, "get").then(function(data) {
                for (var i = 0; i < data.length; i++) {
                    data[i].SITEID = node.SITEID;
                }
                deffer.resolve(node);
                node.CHILDREN = data;
            });
            return deffer.promise;
        }

    }
]);
