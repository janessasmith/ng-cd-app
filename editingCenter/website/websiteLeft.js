"use strict";
/**
 * created by zheng.lu in 2017.2.27
 */
angular.module('websiteLeftModule', [])
    .controller('websiteLeftCtrl', ['$scope', '$q', '$location', '$state', '$filter', 'trsHttpService', 'editingCenterService', 'globleParamsSet', function ($scope, $q, $location, $state, $filter, trsHttpService, editingCenterService, globleParamsSet) {
        initStatus();
        initData();

        /**
         * [initStatus description] 初始化状态
         * @return {[type]} [description]
         */
        function initStatus() {
            $scope.status= {
                sites: [],   // 一级导航数据存放到该数组
                selectedSite: {},

                websiteMediaType: 1,   // 网站：1，APP：2，微信：3，微博：4
            };
        }

        /**
         * [initData description] 初始化数据
         * @return {[type]} [description]
         */
        function initData() {
            initSites();
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
    }]);