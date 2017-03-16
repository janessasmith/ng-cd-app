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
                // "PAGESIZE": globleParamsSet.getPageSize(),
                "PAGESIZE": 50,
                "ITEMCOUNT": 0,
                "PAGECOUNT": 1
            };
            $scope.status = {
                batchOperateBtn: {
                    'hoverStatus': "",
                    'clickStatus': ""
                },
                onlyCurChannel: 0,   // 只看当前栏目，0：查看包含子栏目的文档，1：仅查看自己的文档，默认显示0
                isESSearch: false,
                // 分页跳转当前页
                jumpCurrPage: 1,
                params: {
                    "serviceid": "gov_document",
                    "methodname": "queryDocumentsInDaibian",
                    "SiteId": $stateParams.siteid,
                    "ChannelId": $stateParams.channelid,
                    "PageSize": $scope.page.PAGESIZE,
                    "PageIndex": $scope.page.CURRPAGE,
                    "DocType": "",
                    "DocRelTime": ""
                }
            };
        }


        /**
         * [initData description: 初始化数据]
         * @return {[type]} [description]
         */
        function initData() {
            initDropDown();
            requestData();
        }

        /**
         * [requestData description: 获取数据]
         * @return {[type]} [description]
         */
        function requestData() {
            var params = $scope.status.isESSearch ? getESSearchParams() : $scope.status.params;
            $scope.loadingPromise = trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), params, 'get').then(function(data) {
                $scope.data.items = data.DATA;

                !!data.PAGER ? $scope.page = data.PAGER : $scope.page.ITEMCOUNT = "0";

                $scope.data.selectedArray = [];
            });
        }

        /**
         * [isOnlyCurChannel description] 只看当前栏目
         * @return {Boolean} [description]
         */
        $scope.isOnlyCurChannel = function() {
            $scope.status.jumpCurrPage = $scope.status.params.PageIndex = $scope.page.CURRPAGE = "1";
            $scope.status.onlyCurChannel = $scope.status.onlyCurChannel == 0 ? 1 : 0;
            // $scope.status.onlyCurChannel = !$scope.status.onlyCurChannel;
            // $scope.status.onlyCurChannel === true ? 1: 0;
            $scope.status.params.OnlyMy = $scope.status.onlyCurChannel;
            requestData();
        };

        /**
         * [initDropDown description: 初始化下拉框]
         * @return {[type]} [description]
         */
        function initDropDown() {
            // 初始化稿件类型
            $scope.data.docTypeName = initSingleSelecet.websiteDocType();
            $scope.data.selectedDocType = angular.copy($scope.data.docTypeName[0]);
            // 初始化稿件时间
            $scope.data.timeTypeName = initSingleSelecet.websiteTimeType();
            $scope.data.selectedTimeType = angular.copy($scope.data.timeTypeName[0]);
            //初始化搜索框边的下拉框
            $scope.data.websiteAll = initSingleSelecet.websiteESCondition();
            $scope.data.websiteAllSelected = angular.copy($scope.data.websiteAll[0]);
            // 分页pageer显示的最大个数
            // $scope.maxSize = 6;
        }

        /**
         * [queryByDropdown description: 筛选条件触发后请求数据]
         * @param  {[type]} key   [description: 请求对象参数key]
         * @param  {[type]} value [description: 请求对象值]
         */
        $scope.queryByDropdown = function(key, value) {
            $scope.status.params[key] = value;
            $scope.status.params.PageIndex = $scope.status.copyCurrPage = $scope.page.CURRPAGE = "1";
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
            $scope.status.params.PageIndex = $scope.page.CURRPAGE;
            $scope.status.jumpCurrPage = $scope.page.CURRPAGE;
            requestData();
        };

        /**
         * [jumpToPage description: 跳转指定页面]
         * @return {[type]} [description]
         */
        $scope.jumpToPage = function() {
            $scope.status.params.PageIndex = $scope.status.jumpCurrPage;
            $scope.page.CURRPAGE = $scope.status.jumpCurrPage;
            requestData();
        };

        /**
         * [getESSearchParams description]设置ES检索参数
         * @return {[json]} [description] 参数对象
         */
        function getESSearchParams() {
            var esParams = {
                serviceid: "gov_document",
                methodname: "queryDocumentsInDaibian",
                SearchFields: {
                    PAGESIZE: $scope.page.PAGESIZE + "",
                    PAGEINDEX: $scope.page.CURRPAGE + "",
                    searchFields: [{
                        searchField: $scope.data.websiteAllSelected.value,
                        keywords: $scope.keywords ? $scope.keywords : ""
                    }, {
                        searchField: "DocId",
                        keywords: $stateParams.channelid
                    }]
                }
            };
            esParams.SearchFields = JSON.stringify(esParams.SearchFields);
            return esParams;
        }

        /**
         * [fullTextSearch description] 全文检索
         * @param  {[type]} ev [description] 按下空格也能提交
         */
        $scope.fullTextSearch = function(ev) {
            if ($scope.data.websiteAllSelected.value == "DocId") {
                $scope.status.isESSearch = false;
                $scope.status.params.DocId = $scope.keywords;
            } else {
                $scope.status.isESSearch = true;
            }
            if ((angular.isDefined(ev) && ev.keyCode == 13) || angular.isUndefined(ev)) {
                $scope.page.CURRPAGE = 1;
                requestData();
            }
        };
    }
]);
