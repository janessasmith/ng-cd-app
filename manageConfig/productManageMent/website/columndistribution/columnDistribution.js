/**
 *  by zhou 2016-7-15
 *  函数书写方式 对应网站位置 上中下，从左至右
 */
'use strict';
angular.module("productManageMentWebsiteColumnDistributionModule", ['columnDistributionMgeServiceModule'])
    .controller('productManageMentWebsiteColumnDistributionCtrl', ['$scope', '$filter', '$stateParams', '$modal', 'trsspliceString', 'trsconfirm', 'globleParamsSet', 'trsHttpService', 'columnDistributionMgeService', function($scope, $filter, $stateParams, $modal, trsspliceString, trsconfirm, globleParamsSet, trsHttpService, columnDistributionMgeService) {
        initStatus();
        initData();
        //初始化状态
        function initStatus() {
            /**
             * [page description]
             * @type {Object}
             * CURRPAGE  当前页
             * PAGESIZE  每页数量
             * ITEMCOUNT 总数据
             * PAGECOUNT 总分页数
             */
            $scope.page = {
                "CURRPAGE": 1,
                "PAGESIZE": globleParamsSet.getPageSize(),
                "ITEMCOUNT": 0,
                "PAGECOUNT": 0
            };
            $scope.status = {
                params: {
                    serviceid: "mlf_websiteconfig",
                    methodname: "queryDocumentSyn",
                    CurrPage: $scope.page.CURRPAGE,
                    PageSize: $scope.page.PAGESIZE,
                    ChannelId: $stateParams.channel
                },
                // btn点击操作的动态
                batchOperateBtn: {
                    hoverStatus: ""
                },
                // 跳转页面
                copyCurrPage: 1
            };
            /**
             * [items description] 列表数组
             * [selectedArray description] 全选
             * @type {Object}
             */
            $scope.data = {
                items: [],
                selectedArray: []
            };
        }
        // 初始化数据
        function initData() {
            requestData();
        }
        /**
         * [requestData description]请求数据
         * @return {[type]} [description]
         */
        function requestData() {
            var params = $scope.status.params;
            $scope.loadingPromise = trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), params, 'get').then(function(data) {
                $scope.data.items = data.DATA;
                timeStamp();
                $scope.page.ITEMCOUNT = data.PAGER.ITEMCOUNT;
                $scope.page.PAGESIZE = data.PAGER.PAGESIZE;
                $scope.data.selectedArray = [];
            });
        }
        /**
         * [createColumn description] 新建
         */
        $scope.createColumn = function() {
            createOrEditColumn();
        };

        /**
         * [editColumn description] 编辑 
         * @param  {[type]} item [description]
         * @return {[type]}      [description]
         */
        $scope.editColumn = function(item) {
            createOrEditColumn(item);
        };

        /**
         * [createOrEditColumn description] 新建和编辑页面弹窗
         * @param  {[type]} item [description]
         * @return {[type]}      [description]
         */
        function createOrEditColumn(item) {
            columnDistributionMgeService.createOrEditColumnDistribution(item, function(data) {
                if (data === "success") {
                    initData();
                }
            });
        }

        /**
         * [multDelete description] 删除栏目
         * @return {[type]} [description]
         */
        $scope.multDelete = function(item) {
            trsconfirm.confirmModel("删除", "确认删除栏目", function() {
                var objectIds = item ? item.CHANNELSYNID : trsspliceString.spliceString($scope.data.selectedArray, "CHANNELSYNID", ",");
                var params = {
                    serviceid: "mlf_websiteconfig",
                    methodname: "deleteDocumentSyn",
                    ChannelId: $stateParams.channel,
                    ObjectIds: objectIds
                };
                $scope.loadingPromise = trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), params, "post").then(function(data) {
                    trsconfirm.alertType("删除栏目成功", "", "success", false, function() {
                        requestData();
                    });
                });
            });
        };

        /**
         * [carriedOut description] 立即执行
         * @return {[type]} [description]
         */
        $scope.carriedOut = function() {
            trsconfirm.confirmModel("执行", "确认立即执行栏目", function() {
                var objectIds = trsspliceString.spliceString($scope.data.selectedArray, "CHANNELSYNID", ",");
                var params = {
                    serviceid: "mlf_websiteconfig",
                    methodname: "synUndoContent",
                    ChannelId: $stateParams.channel,
                    ObjectIds: objectIds
                };
                $scope.loadingPromise = trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), params, "post").then(function(data) {
                    trsconfirm.alertType("栏目发送成功", "", "success", false, function() {
                        requestData();
                    });
                });
            });
        };
        /**
         * [selectAll description]列表全选
         * @return {[type]} [description]
         */
        $scope.selectAll = function() {
            $scope.data.selectedArray = $scope.data.selectedArray.length == $scope.data.items.length ? [] : []
                .concat($scope.data.items);
        };
        /**
         * [selectDoc description]列表单选
         * @return {[type]} [description]
         */
        $scope.selectDoc = function(item) {
            var index = $scope.data.selectedArray.indexOf(item);
            if (index < 0) {
                $scope.data.selectedArray.push(item);
            } else {
                $scope.data.selectedArray.splice(index, 1);
            }
        };
        /**
         * [timeStamp description] 将日期字符串转换为时间戳
         * @return {[type]} [description]
         */
        function timeStamp() {
            angular.forEach($scope.data.items, function(data, index) {
                if (data.SDATE !== "") {
                    data.SDATE = new Date(Date.parse(data.SDATE.replace(/-/g, "/"))).getTime();
                }
                if (data.EDATE !== "") {
                    data.EDATE = new Date(Date.parse(data.EDATE.replace(/-/g, "/"))).getTime();
                }
                if (data.DOCSDATE !== "") {
                    data.DOCSDATE = new Date(Date.parse(data.DOCSDATE.replace(/-/g, "/"))).getTime();
                }
            });
        }
        /**
         * [selectPageNum description]分页显示数目
         * @return {[type]} [description]
         */
        $scope.selectPageNum = function() {
            $scope.status.copyCurrPage = 1;
            $scope.status.params.PageSize = $scope.page.PAGESIZE;
            $scope.status.params.CurrPage = $scope.page.CURRPAGE;
            requestData();
        };
        /**
         * [pageChanged description] 下一页 页面改变调取数据
         * @return {[type]} [description]
         */
        $scope.pageChanged = function() {
            $scope.status.params.PageSize = $scope.page.PAGESIZE;
            $scope.status.params.CurrPage = $scope.page.CURRPAGE;
            requestData();
        };
        /**
         * [jumpToPage description] 跳转页
         * @return {[type]} [description]
         */
        $scope.jumpToPage = function() {
            if ($scope.status.copyCurrPage > $scope.page.PAGECOUNT) {
                $scope.status.copyCurrPage = $scope.page.PAGECOUNT;
            }
            $scope.status.params.CurrPage = $scope.status.copyCurrPage;
            $scope.page.CURRPAGE = $scope.status.params.CurrPage;
            requestData();
        };
    }]);
