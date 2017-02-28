"use strict";
/*
author:zhou
date:2016-08-01
 */
angular.module("largeScreenControlEventControlModule", ["largeScreenControlEventControlRouterModule"])
    .controller("largeScreenControlEventControlCtrl", ['$scope', '$filter', '$q', 'globleParamsSet', 'trsHttpService', 'trsconfirm', function($scope, $filter, $q, globleParamsSet, trsHttpService, trsconfirm) {
        initStatus();
        initData();

        /**
         * [initStatus description] 初始化状态
         * @return {[type]} [description]
         */
        function initStatus() {
            $scope.data = {
                items: [],
            };
            $scope.status = {
                page: {
                    "CURRPAGE": 1,
                    "PAGESIZE": globleParamsSet.getPageSize(),
                    "ITEMCOUNT": 0,
                    "PAGECOUNT": 1
                },
                selectedType: {
                    1: "左屏",
                    2: "中屏",
                    3: "右屏",
                    4: "全屏"
                },
                showType: "显示已选",
                keywords: ""
            };
            $scope.params = {
                "typeid": "screen",
                "serviceid": "eventcontrol",
                "modelid": "eventlist",
                "page_no": $scope.status.page.CURRPAGE - 1,
                "page_size": $scope.status.page.PAGESIZE,
                "showtype": "",
                "keywords": "",
                "id": ""
            };
        }

        /**
         * [initData description] 初始化数据
         * @return {[type]} [description]
         */
        function initData() {
            requestData();
        }

        /**
         * [requestData description] 请求数据
         * @return {[type]} [description]
         */
        function requestData() {
            $scope.loadingPromise = trsHttpService.httpServer(trsHttpService.getBigDataRootUrl(), $scope.params, 'GET').then(function(data) {
                $scope.data.items = data.CONTENT;
                $scope.status.page.ITEMCOUNT = data.TOTALELEMENTS;
                $scope.status.page.PAGESIZE = data.SIZE;
            });
        }

        /**
         * 将日期字符串转换为时间戳
         */
        $scope.timeStamp = function(item) {
            var date = new Date(Date.parse(item.START_TIME));
            return $filter("date")(date, "yyyy-MM-dd").toString();
        };

        /**
         * [showSelectedOrAll description] 显示已选或显示全部
         * @return {[type]} [description]
         */
        $scope.showSelectedOrAll = function() {
            if ($scope.status.showType == "显示已选") {
                $scope.params.modelid = "show";
                $scope.params.showtype = "1";
                $scope.status.page.CurrPage = 1;
                requestData();
                $scope.status.showType = "显示全部";
            } else {
                $scope.params.modelid = "show";
                $scope.params.showtype = "0";
                $scope.status.page.CurrPage = 1;
                requestData();
                $scope.status.showType = "显示已选";
            }
        };

        /**
         * [search description] 搜索标题
         * @return {[type]} [description]
         */
        $scope.search = function(ev) {
            if ((angular.isDefined(ev) && ev.keyCode == 13) || angular.isUndefined(ev)) {
                $scope.params.keywords = $scope.status.keywords;
                $scope.params.modelid = "search";
                $scope.status.page.CurrPage = 1;
                requestData();
            }
        };

        /**
         * [getShowType description] 选择显示方式
         * @param  {[type]} id   [description]
         * @param  {[type]} type [description]
         * @return {[type]}      [description]
         */
        $scope.getShowType = function(item, type) {
            if (item.FULL_SCREEN != 1 && type == 4) return;
            var showMessage = item.SCREEN_CHECK.indexOf(type)<0 ? $scope.status.selectedType[type] : "取消" + $scope.status.selectedType[type];
            trsconfirm.alertType("确认", "是否确认" + showMessage + "显示此事件", "info", true, function() {
                $scope.params.modelid = "checkscreen";
                $scope.params.id = item.ID;
                $scope.params.screencheck = type;
                requestData();
            });
        };

        /**
         * [selectPageNum description] 选择每页显示的数据数量
         * @return {[type]} [description]
         */
        $scope.selectPageNum = function() {
            $scope.status.page.CurrPageCopy = 1;
            $scope.params.page_no = $scope.status.page.CURRPAGE - 1;
            $scope.params.page_size = $scope.status.page.PAGESIZE;
            requestData();
        };

        /**
         * [pageChanged description] 分页
         * @return {[type]} [description]
         */
        $scope.pageChanged = function() {
            $scope.params.page_no = $scope.status.page.CURRPAGE - 1;
            $scope.status.page.CurrPageCopy = $scope.status.page.CURRPAGE;
            requestData();
        };

        /**
         * [jumpToPage description] 跳转到指定页面
         * @return {[type]} [description]
         */
        $scope.jumpToPage = function() {
            if ($scope.status.page.CurrPageCopy > $scope.status.page.PAGECOUNT) {
                $scope.status.page.CurrPageCopy = $scope.status.page.PAGECOUNT;
            }
            $scope.params.page_no = $scope.status.page.CurrPageCopy - 1;
            $scope.status.page.CURRPAGE = $scope.status.page.CurrPageCopy;
            requestData();
        };

    }]);
