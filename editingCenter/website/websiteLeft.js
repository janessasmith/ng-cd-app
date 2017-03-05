"use strict";
/**
 * created by zheng.lu in 2017.2.27
 */
angular.module('websiteLeftModule', [])
    .controller('websiteLeftCtrl', ['$scope', '$q', '$location', '$state', '$filter', 'trsHttpService', 'editingCenterService', 'editingMediatype', 'globleParamsSet', function($scope, $q, $location, $state, $filter, trsHttpService, editingCenterService, editingMediatype, globleParamsSet) {
        initStatus();
        initData();

        /**
         * [initStatus description] 初始化状态
         * @return {[type]} [description]
         */
        function initStatus() {
            $scope.router = $location.path().split('/');
            $scope.status = {
                sites: [], // 一级导航数据存放到该数组
                selectedSite: {},

                platformParam: ["waitcompiled", "pending", "waitpending", "signed"],
                selectedPlatform: $scope.router[4] || "waitcompiled", //默认展开平台
                
                waitcompiled: {
                    channels: "",
                    selectedChnl: "",
                    isSelected: true,
                },
                pending: {
                    channels: "",
                    selectedChnl: "",
                    isSelected: $scope.router[4] === 'pending',
                },
                waitpending: {
                    channels: "",
                    selectedChnl: "",
                    isSelected: $scope.router[4] === 'waitpending',
                },
                signed: {
                    channels: "",
                    selectedChnl: "",
                    isSelected: $scope.router[4] === 'signed',
                },
                channelTreeOptions: editingCenterService.channelTreeOptions()
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
                    // $state.go('editctr.website.' + $scope.status.selectedPlatform, { siteid: $scope.status.selectedSite.SITEID });
                });
        }

        /**
         * [initSites description] 初始化一级导航菜单
         * @return {[type]} [description]
         */
        function initSites() {
            var deferred = $q.defer();
            editingCenterService.querySitesByMediaType(editingMediatype.website).then(function(data) {
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
        function initChannelList(site) {
            editingCenterService.queryChildChannel(site.SITEID, 0).then(function(data) {
                $scope.status[$scope.status.selectedPlatform].channels = data.DATA;

                var routerChannelId = $location.search().channelid;
                $scope.status.waitcompiled.selectedChnl = (routerChannelId && $location.search().siteid === $scope.status.selectedSite.SITEID) ? $filter('filterBy')(data.DATA, ['CHANNELID'], routerChannelId)[0] : data.DATA[0];

                $state.go('editctr.website.' + $scope.status.selectedPlatform, { siteid: $scope.status.selectedSite.SITEID, channelid: data.DATA[0].CHANNELID });
            });
        }

        /**
         * [queryNodeChildren description] 查询子节点 异步加载树
         * @param  {[type]} node [description] 子节点
         * @return {[type]}      [description]
         */
        $scope.queryNodeChildren = function(node) {
            if (node.HASCHILDREN == 'true' && !node.CHILDREN) {
                editingCenterService.queryChildChannel(node.SITEID, node.CHANNELID).then(function(data) {
                    node.CHILDREN = data.DATA;
                });
            }
        };

        /**
         * [changeWebPlatform description] tab平台切换
         * @param  {[type]} platform [description]
         * @return {[type]}          [description]
         */
        $scope.changeWebPlatform = function(platform) {
            if($scope.status.selectedPlatform === platform) return;
            $scope.status.selectedPlatform = platform;
            $scope.status[$scope.status.selectedPlatform].isSelected = true;
        };

        /**
         * [setWebSelectedChnl description]设置网站当前选中的栏目
         * @param {[type]} item     [description]  被点击对象
         * @param {[type]} platform [description] 平台：待编，待审，已签发
         */
        $scope.setWebSelectedChnl = function(item, platform) {
            $scope.status[platform].selectedChnl = item;  // 将当前选中的对象赋给selectedChnl
            if (angular.isObject(item))
                $state.go("editctr.website." + platform, {
                    channelid: item.CHANNELID,
                }, { reload: "editctr.website." + platform });
            else {
                $state.go("editctr.website." + platform + "." + item, "", { reload: "editctr.website." + platform + "." + item });
            }
        };

        /**
         * [getSelectedNode description] 判断栏目树中的栏目是否被选中
         * @return {[type]} [description]
         */
        $scope.getSelectedNode = function() {
            // console.log($scope.status[$scope.status.selectedPlatform].selectedChnl);
            if (angular.isObject($scope.status[$scope.status.selectedPlatform].selectedChnl)) {
                return $scope.status[$scope.status.selectedPlatform].selectedChnl;
            } else {
                return undefined;
            }
        };
    }]);