/**
 * createdBy cc 2016-6-28
 * app模块左侧
 */
"use strict";
angular.module('editingCenterAppLeftModule', [])
    .controller('appLeftCtrl', ['$scope', '$state', '$location', '$q', 'editingCenterService', 'editingMediatype', '$filter', 'trsHttpService', 'globleParamsSet',
        function($scope, $state, $location, $q, editingCenterService, editingMediatype, $filter, trsHttpService, globleParamsSet) {

            initStatus();
            initData();

            function initStatus() {
                $scope.pathes = $location.path()
                    .split('/');
                $scope.status = {
                    app: {
                        sites: "",
                        selectedSite: "",
                        utilBtns: {}, //按钮工具类
                        mediaType: 1,
                        platformParam: {
                            "waitcompiled": 7,
                            "pending": 5,
                            "signed": 6
                        },
                        selectedPlatform: $scope.pathes[3] || "waitcompiled", //默认展开平台
                        isDownPicShow: false, //站点列表是否展开
                        isPanelOpen: {
                            0: false
                        },
                        waitcompiled: {
                            channels: "",
                            selectedChnl: "",
                            isSelected: true,
                            isPanelOpen: {
                                0: false
                            }
                        },
                        pending: {
                            channels: "",
                            selectedChnl: "",
                            isSelected: $scope.pathes[3] === 'pending',
                            isPanelOpen: {
                                0: false
                            }
                        },
                        signed: {
                            channels: "",
                            selectedChnl: "",
                            isSelected: $scope.pathes[3] === 'signed',
                            isPanelOpen: {
                                0: false
                            }
                        },
                    },
                };
                $scope.data = {
                    expandedNodes: {
                        waitcompiled: [],
                        pending:[],
                        signed:[],
                    },//树展开节点，根据不同渠道做区分
                };
                $scope.treeOpts = editingCenterService.channelTreeOptions();

            }


            function initData() {
                initAppData();
            }

            function initAppData() {
                initSites().then(function() {
                    getAppSiteAccessAuthority();
                    initChannel();
                });

            }
            //APP平台切换
            $scope.changeAppPlatform = function(platform) {
                if ($scope.status.app.selectedPlatform === platform) return;
                $scope.status.app.selectedPlatform = platform;
                $scope.status.app[$scope.status.app.selectedPlatform].isSelected = true;
                if (angular.isArray($scope.status.app[platform].channels) && $scope.status.app[platform].channels[0].SITEID === $scope.status.app.selectedSite.SITEID) {
                    routerChange();
                } else {
                    initChannel();
                }
            };
            //初始化站点
            function initSites() {
                var defer = $q.defer();
                editingCenterService.querySitesByMediaType(editingMediatype.app).then(function(data) {
                    $scope.status.app.sites = data.DATA;
                    $scope.status.app.isDownImgShow = data.DATA.length > 1 ? true : false;
                    var filteredSite = $filter('filterBy')(data.DATA, ['SITEID'], $location.search().siteid);
                    $scope.status.app.selectedSite = filteredSite.length > 0 ? filteredSite[0] : data.DATA[0];
                    defer.resolve();
                });
                return defer.promise;
            }
            /**
             * [getAppSiteAccessAuthority description] 初始化权限
             * @return {[type]} [description]
             */
            function getAppSiteAccessAuthority() {
                var params = {
                    serviceid: "mlf_metadataright",
                    methodname: "queryAppSiteOperTypesBySiteId",
                    SiteId: $scope.status.app.selectedSite.SITEID
                };
                trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), params, "post")
                    .then(function(data) {
                        $scope.status.appAccessAuthority = globleParamsSet.handlePermissionData(data);
                    });
            }
            //初始化栏目
            function initChannel() {
                editingCenterService.queryClassifyBySite($scope.status.app.selectedSite.SITEID, $scope.status.app.platformParam[$scope.status.app.selectedPlatform]).then(function(data) {
                    $scope.status.app[$scope.status.app.selectedPlatform].channels = data.CHILDREN;
                    $scope.status.app[$scope.status.app.selectedPlatform].selectedChnl = data.CHILDREN[0];
                    routerChange();
                });
            }
            //路由切换
            function routerChange() {
                if (angular.isObject($scope.status.app[$scope.status.app.selectedPlatform].selectedChnl))
                    $state.go('editctr.app.' + $scope.status.app.selectedPlatform, { channelid: $scope.status.app[$scope.status.app.selectedPlatform].selectedChnl.CHANNELID, siteid: $scope.status.app.selectedSite.SITEID, type: $scope.status.app[$scope.status.app.selectedPlatform].selectedChnl.TABLENAME });
                else {
                    $state.go('editctr.app.' + $scope.status.app.selectedPlatform + "." + $scope.status.app[$scope.status.app.selectedPlatform].selectedChnl);
                }
            }
            //站点切换
            $scope.setAppSiteSelected = function(site) {
                if ($scope.status.app.selectedSite == site) return;
                $scope.status.app.selectedSite = site;
                initChannel();
            };
            /**
             * [setAppSelectedChnl description]切换app选中栏目
             * @param {[obj]} item          [description]栏目信息
             * @param {[str]} platform      [description]渠道信息
             * @param {[str]} platformType  [description]渠道信息数字分类
             */
            $scope.setAppSelectedChnl = function(item, platform, platformType) {
                // if (item.HASCHILDREN == "true" && $scope.data.expandedNodes[platform].length < 1) { //在选中节点后添加展开节点功能
                //     editingCenterService.queryChildChannel(item, platformType).then(function(children) {
                //         item.CHILDREN = children;
                //         $scope.data.expandedNodes[platform].push(item);
                //     });
                // } else {
                //     $scope.data.expandedNodes[platform] = [];
                // }
                routerToList(item, platform);
            };
            /**
             * [routerToList description]跳转路由到列表
             * @param  {[obj]} item      [description]节点信息
             * @param  {[str]} platform  [description]渠道信息
             * @return {[type]}          [description]
             */
            function routerToList(item, platform) {
                $scope.status.isMoreIconsShow = "";
                $scope.status.app[platform].selectedChnl = item;
                if (angular.isObject(item))
                    $state.go("editctr.app." + platform, {
                        channelid: item.CHANNELID,
                        type: item.TABLENAME //新增分类字段
                    }, { reload: "editctr.app." + platform });
                else {
                    $state.go("editctr.app." + platform + "." + item, {
                        siteid: $scope.status.app.selectedSite.SITEID
                    }, { reload: "editctr.app." + platform + "." + item });
                }
            }
            /**
             * [getSelectedNode description] 判断栏目树中的栏目是否被选中
             * @return {[type]} [description]
             */
            $scope.getSelectedNode = function() {
                if (angular.isObject($scope.status.app[$scope.status.app.selectedPlatform].selectedChnl)) {
                    return $scope.status.app[$scope.status.app.selectedPlatform].selectedChnl;
                } else {
                    return undefined;
                }
            };
            /**
             * [queryNodeChildren description]查询子节点
             * @param  {[obj]} node     [description]节点信息
             * @param  {[num]} platform [description]平台
             * @return {[type]}          [description]
             */
            $scope.queryNodeChildren = function(node, platform) {
                editingCenterService.queryChildChannel(node, platform).then(function(children) {
                    node.CHILDREN = children;
                });
            };
            /**
             * [siteCut description]  根据不同分辨率截取不同长度的名称
             * @param {[type]} site [description]
             */
            $scope.siteCut = function(site) {
                if (window.screen.width <= '1366') {
                    site = $filter('trsLimitTo')(site, '8');
                } else if (window.screen.width <= '1680' && window.screen.width > '1366') {
                    site = $filter('trsLimitTo')(site, '10');
                } else if (window.screen.width > '1680') {
                    site = $filter('trsLimitTo')(site, '12');
                }
                return site;
            };
        }
    ]);
