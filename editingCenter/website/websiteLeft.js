"use strict";
/**
 * created by zheng.lu in 2017.2.27
 */
angular.module('websiteLeftModule', [])
    .controller('websiteLeftCtrl', ['$scope', '$q', '$location', '$state', '$filter', 'trsHttpService', 'editingCenterService', 'globleParamsSet', function($scope, $q, $location, $state, $filter, trsHttpService, editingCenterService, globleParamsSet) {
        initStatus();
        initData();

        /**
         * [initStatus description] 初始化状态
         * @return {[type]} [description]
         */
        function initStatus() {
            $scope.status = {
                sites: [], // 一级导航数据存放到该数组
                selectedSite: {},

                websiteMediaType: 1, // 网站：1，APP：2，微信：3，微博：4
                waitcompiled: {
                    channels: "",
                    selectedChnl: ""
                },
                treeOptions: {
                    nodeChildren: "CHILDREN",
                    dirSelectable: false,
                    allowDeselect: false,
                    injectClasses: {
                        ul: "moveDraftTree-ul",
                        li: "moveDraftTree-li",
                        liSelected: "a7",
                        iExpanded: "a3",
                        iCollapsed: "a4",
                        iLeaf: "a5",
                        label: "moveDraftTree-label",
                        labelSelected: "rolegrouplabselected"
                    },
                    isLeaf: function(node) {
                        return node.HASCHILDREN === "false";
                    }
                }
            };
        }

        /**
         * [initData description] 初始化数据
         * @return {[type]} [description]
         */
        function initData() {
            initSites()
                .then(function() {
                    initChannelList($scope.status.selectedSite);
                    $state.go('editctr.website.waitcompiled', { siteid: $scope.status.selectedSite.SITEID });
                });
        }

        /**
         * [initSites description] 初始化一级导航菜单
         * @return {[type]} [description]
         */
        function initSites() {
            var deferred = $q.defer();
            editingCenterService.querySitesByMediaType($scope.status.websiteMediaType).then(function(data) {
                // 当网站不存在时退出 WCM bug
                if (!data.DATA || data.DATA.length < 1) return;
                $scope.status.sites = data.DATA;
                // 被选中的网站
                var filteredSite = $filter('filterBy')($scope.status.sites, ['SITEID'], $location.search().siteid);
                // 将一级导航第一栏赋值给$scope.status.selectedSite
                $scope.status.selectedSite = filteredSite.length > 0 ? filteredSite[0] : data.DATA[0];
                deferred.resolve();
            });
            return deferred.promise;
        }

        /**
         * [selectSites description] 一级导航菜单切换
         * @param  {[type]} site [description] 被选中的一级导航站点
         * @return {[type]}      [description]
         */
        $scope.selectSites = function(site) {
            if ($scope.status.selectedSite === site) return;
            // 将点中的站点赋给$scope.status.selectedSite展示出来
            $scope.status.selectedSite = site;
            $state.go($state.$current, {
                siteid: site.SITEID
            });
        };

        /**
         * [initChannelList description] 请求子级导航
         * @param  {[type]} siteid [description] 根据siteid获取子级
         * @return {[type]}        [description]
         */
        function initChannelList(siteid) {
            var deferred = $q.defer();
            var params = {
                serviceid: 'gov_site',
                methodname: 'queryChildrenChannelsOnEditorCenter',
                ParentChannelId: 0,
                SITEID: siteid.SITEID
            };
            trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), params, 'get').then(function(data) {
                $scope.status.waitcompiled.channels = data.DATA;
                console.log(data.DATA[0].CHANNELID);
                $state.go('editctr.website.waitcompiled', { channelid: data.DATA[0].CHANNELID });
                // var routerChannelId = $location.search().channelid;
                // $scope.status.waitcompiled.selectedChnl = (routerChannelId && $location.search().siteid === $scope.status.selectedSite.SITEID) ? $filter('filterBy')(data.DATA, ['CHANNELID'], routerChannelId)[0] : data.DATA[0];

                deferred.resolve();
            });
            return deferred.promise;
        }

        /**
         * [queryNodeChildren description] 查询子节点 异步加载树
         * @param  {[type]} node [description] 子节点
         * @return {[type]}      [description]
         */
        $scope.queryNodeChildren = function(node) {
            if (node.HASCHILDREN == 'true' && !node.CHILDREN) {
                var deferred = $q.defer();
                var params = {
                    serviceid: 'gov_site',
                    methodname: 'queryChildrenChannelsOnEditorCenter',
                    ParentChannelId: node.CHANNELID
                };
                trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), params, 'get').then(function(data) {
                    node.CHILDREN = data.DATA;
                    $state.go('editctr.website.waitcompiled', { channelid: node.CHANNELID });

                    deferred.resolve(node);
                });
                return deferred.promise;
            }
        };
    }]);