"use strict";
angular.module('planCenCommandTaskClueModule', [])
    .controller('planCenCommandTaskClueCtrl', ['$scope', '$q', '$state', '$filter', 'trsHttpService', 'trsspliceString', 'trsconfirm', 'appointTaskService', '$modal', 'dateFilter', function($scope, $q, $state, $filter, trsHttpService, trsspliceString, trsconfirm, appointTaskService, $modal, dateFilter) {
        initStatus();
        initData();
        /**
         * [initStatus description:初始化状态]
         */
        function initStatus() {
            $scope.status = {
                batchOperateBtn: {
                    "hoverStatus": "",
                    "clickStatus": ""
                },
                taskType: ["未读", "已读"],
                isUrgent: ["否", "是"]
            };
            $scope.page = {
                PageNum: 1,
                PageSize: 20
            };
            $scope.params = {
                serviceid: "mlf_task",
                methodname: "queryPlanTasks",
                CurrPage: $scope.page.PageNum,
                PageSize: $scope.page.PageSize,
                TaskType: 1
            };
            $scope.data = {
                selectedArray: [],
                items: {
                    PAGER: {
                        CURRPAGE: 1,
                        PAGESIZE: 20,
                        ITEMCOUNT: 0
                    },
                    DATA: []
                }
            };
            initDropDownList();
            //根据截止日期过滤
            /*$scope.$watch("params.TaskEndTime", function(newV, oldV) {
                if (newV === "" || newV === oldV) return;
                $scope.params.TaskEndTime = $filter("date")(new Date(Date.parse(newV), "yyyy-MM-dd"));
                requestData();
            });*/
        }
        /**
         * [initData description:初始化数据]
         */
        function initData() {
            requestData();
        }
        /**
         * [initDropDownList description:初始化下拉菜单]
         */
        function initDropDownList() {
            $scope.status.appointTypes = appointTaskService.initDropDownList().appointTypes;
            $scope.status.appointStatuses = appointTaskService.initDropDownList().taskViewStatus;
            $scope.status.searchTypes = appointTaskService.initDropDownList().searchTypes;
        }
        /**
         * [chooseDropList description:选中下拉菜单回调]
         */
        $scope.chooseDropList = function(type) {
            var value = $scope.status[type].value;
            if (type == "SearchType") {
                $scope.params[value] = angular.copy($scope.keyword);
                value == "title" ? (delete $scope.params.content) : (delete $scope.params.title);
            } else {
                $scope.params[type] = value;
            }
            requestData();
        };
        /**
         * [selectDoc description:选择事件或任务]
         */
        $scope.selectDoc = function(item) {
            if ($scope.isChecked(item)) {
                $scope.data.selectedArray.splice($scope.data.selectedArray.indexOf(item), 1);
            } else {
                $scope.data.selectedArray.push(item);
            }
        };
        /**
         * [selectAll description:全选]
         */
        $scope.selectAll = function() {
            var arr = angular.copy($scope.data.items);
            $scope.data.selectedArray = $scope.data.selectedArray.length === $scope.data.items.length ? [] : arr;
        };
        /** [requestData 请求列表数据] */
        function requestData() {
            var deffer = $q.defer();
            trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), $scope.params, "post")
                .then(function(data) {
                    deffer.resolve();
                    $scope.data.items = data.DATA;
                    $scope.page = data.PAGER;
                    // $scope.page.PageNum = data.PAGER.CURRPAGE > data.PAGER.PAGECOUNT ? data.PAGER.PAGECOUNT : data.PAGER.CURRPAGE;
                    // $scope.page.CURRPAGE = data.PAGER.CURRPAGE > data.PAGER.PAGECOUNT ? data.PAGER.PAGECOUNT : data.PAGER.CURRPAGE;
                });
            return deffer.promise;
        }
        /** [jumpToPage 跳页] */
        $scope.jumpToPage = function() {
            $scope.page.jumptoPage = $scope.page.jumptoPage > $scope.page.PAGECOUNT ? $scope.page.PAGECOUNT : $scope.page.jumptoPage;
            $scope.page.PageNum = $scope.page.CURRPAGE = $scope.page.jumptoPage;
            requestData();
        };
        /**
         * [pageChanged description]分页
         * @return {[type]} [description]
         */
        $scope.pageChanged = function() {
            $scope.params.CurrPage = $scope.page.CURRPAGE;
            requestData();
        };
        /** [openAcceptModal 接受] */
        $scope.openAcceptModal = function() {
            if ($scope.data.selectedArray.length) {
                var modalInstance = $modal.open({
                    templateUrl: "./planningCenter/command/task/taskView/acceptModal/acceptModal.html",
                    windowClass: 'resource-reserve-modal',
                    backdrop: false,
                    controller: "acceptModalCtrl",
                    resolve: {
                        selectItems: function() {
                            return $scope.data.selectedArray;
                        }
                    }
                });
            } else {
                trsconfirm.alertType("请选择接受的任务！", "", "error", false, "");
            }
        };
        /** [viewTask 单条记录接受] */
        $scope.viewTask = function(item) {
            var modalInstance = $modal.open({
                templateUrl: "./planningCenter/command/task/taskView/acceptModal/acceptModal.html",
                windowClass: 'resource-reserve-modal',
                backdrop: false,
                controller: "acceptModalCtrl",
                resolve: {
                    selectItems: function() {
                        return [item];
                    }
                }
            });
        };
        /** [chooseDate 选择时间] */
        $scope.chooseDate = function(date) {
            $scope.params.TaskEndTime = dateFilter(date, 'yyyy-MM-dd');
            requestData();
        };
        /** [fullTextSearch description] */
        $scope.searchWitdhKeyword = function(e) {
            if (!e || (e && e.keyCode == 13)) {
                if ($scope.keyword) {
                    $scope.params[($scope.status.SearchType && $scope.status.SearchType.value) || "title"] = angular.copy($scope.keyword);
                } else {
                    delete $scope.params[($scope.status.SearchType && $scope.status.SearchType.value) || "title"];
                }
                requestData();
            }
        };
        // 是否选中
        $scope.isChecked = function(item) {
            var temp = false;
            angular.forEach($scope.data.selectedArray, function(n, i) {
                if (item.TASKID == n.TASKID) {
                    temp = true;
                    return temp;
                }
            });
            return temp;
        };
    }]);