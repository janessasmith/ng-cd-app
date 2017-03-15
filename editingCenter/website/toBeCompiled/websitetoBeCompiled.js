"use strict";
/**
 * created by zheng.lu in 2017.3.14
 */
angular.module('websitetoBeCompiledModule', [
    'websitetoBeCompiledRouterModule',
    /*'editingCenterCompiledWebsiteTimingSignModule',
    'editingCenterCompiledWebsiteRecycleModule',
    "websiteAtlasModule",
    'websiteLinkDocModule',
    'websiteSubjectModule',
    'initWebsiteDataModule',
    'editingCenterWebsiteOwnerModule',*/
]).
controller('websitetoBeCompiledCtrl', ["$scope", "$filter", "$q", '$state', "$timeout", "$stateParams", "$window", "localStorageService", "trsHttpService", "initSingleSelecet", "trsconfirm", "trsspliceString", "editingCenterService", "websiteService", "initVersionService", "initeditctrBtnsService", "storageListenerService", 'editcenterRightsService', 'globleParamsSet', 'editIsLock', 'trsPrintService',
    function toBeCompiled($scope, $filter, $q, $state, $timeout, $stateParams, $window, localStorageService, trsHttpService, initSingleSelecet, trsconfirm, trsspliceString, editingCenterService, websiteService, initVersionService, initeditctrBtnsService, storageListenerService, editcenterRightsService, globleParamsSet, editIsLock, trsPrintService) {
        initStatus();
        initData();

        /**
         * [initStatus description: 初始化状态]
         * @return {[type]} [description]
         */
        function initStatus() {
            $scope.data = {
                // 初始化列表
                items: [],
                // 初始化复选框
                selectedArray: [],
            };

            /**
             * [page description: 分页]
             * @type {Object}
             */
            $scope.page = {
                "CURRPAGE": 1,
                "PAGESIZE": globleParamsSet.getPageSize(),
                "ITEMCOUNT": 0,
                "PAGECOUNT": 1
            };
            $scope.status = {
                batchOperateBtn: {
                    'hoverStatus': "",
                    'clickStatus': ""
                },
                // 分页跳转当前页
                jumpCurrPage: 1,
                params: {
                    "SiteId": $stateParams.siteid,
                    "ChannelId": $stateParams.channelid,
                    "serviceid": "gov_document",
                    "methodname": "queryDocumentsInDaibian",
                    "DocType": "",
                    "DocRelTime": "",
                    "PageSize": $scope.page.PAGESIZE,
                    "CurrPage": $scope.page.CURRPAGE
                }
            };
        }


        /**
         * [initData description: 初始化数据]
         * @return {[type]} [description]
         */
        function initData() {
            requestData();
            initDropDown();
        }

        /**
         * [requestData description: 获取数据]
         * @return {[type]} [description]
         */
        function requestData() {
            var params = $scope.status.params;
            $scope.loadingPromise = trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), params, 'get').then(function(data) {
                $scope.data.items = data.DATA;

                !!data.PAGER ? $scope.page = data.PAGER : $scope.page.ITEMCOUNT = "0";

                $scope.data.selectedArray = [];
            });
        }

        /**
         * [initDropDown description: 初始化下拉框]
         * @return {[type]} [description]
         */
        function initDropDown() {
            // 初始化稿件类型
            $scope.performDocStatusName = initSingleSelecet.docType();
            $scope.performDocStatusSelected = angular.copy($scope.performDocStatusName[0]);

            // 初始化稿件时间
            $scope.performTimeStatus = initSingleSelecet.timeType();
            $scope.performTimeStatusSelected = angular.copy($scope.performTimeStatus[0]);

            // 分页pageer显示的最大个数
            $scope.maxSize = 6;
        }

        /**
         * [queryByDropdown description: 筛选条件触发后请求数据]
         * @param  {[type]} key   [description: 请求对象参数key]
         * @param  {[type]} value [description: 请求对象值]
         */
        $scope.queryByDropdown = function(key, value) {
            $scope.status.params[key] = value;
            // $scope.status.params.CurrPage = $scope.status.copyCurrPage = $scope.page.CURRPAGE = "1";
            requestData();
        };

        /**
         * [checkSingle description: 单选]
         * @param  {[type]} val [description: 单个对象]
         */
        $scope.checkSingle = function(val) {
            if ($scope.data.selectedArray.indexOf(val) < 0) {
                // 向数组末尾添加元素
                $scope.data.selectedArray.push(val);
            } else {
                // 从已有的数组显示选取的元素
                $scope.data.selectedArray.splice($scope.data.selectedArray.indexOf(val), 1);
            }
        };

        /**
         * [checkAll description: 全选]
         * @return {[type]} [description]
         */
        $scope.checkAll = function() {
            $scope.data.selectedArray = $scope.data.selectedArray.length == $scope.data.items.length ? [] : [].concat($scope.data.items);
        };

        /**
         * [pageChanged description: 分页 下一页]
         * @return {[type]} [description]
         */
        $scope.pageChanged = function() {
            $scope.status.params.CurrPage = $scope.page.CURRPAGE;
            $scope.status.jumpCurrPage = $scope.page.CURRPAGE;
            requestData();
        };

        /**
         * [jumpToPage description: 跳转指定页面]
         * @return {[type]} [description]
         */
        $scope.jumpToPage = function() {
            $scope.status.params.CurrPage = $scope.status.jumpCurrPage;
            $scope.page.CURRPAGE = $scope.status.jumpCurrPage;
            requestData();
        };
    }
]);
