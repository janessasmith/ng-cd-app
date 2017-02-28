"use strict";
/**
 * customMonitor Module
 *
 * Description 部门稿库列表管理
 * Author:CC 2016-11-1
 */
angular.module('departmentListManageMentModule', ['departmentManageMentRouterModule']).
controller('departmentListManageMentController', ['$scope', '$state', '$timeout', '$filter', 'treeService', 'trsHttpService', 'trsconfirm', 'trsspliceString', 'trsGroupTreeLocationService', 'globleParamsSet', 'departmentService',
    function($scope, $state, $timeout, $filter, treeService, trsHttpService, trsconfirm, trsspliceString, trsGroupTreeLocationService, globleParamsSet, departmentService) {
        initStatus();
        initData();
        /**
         * [initStatus description:初始化状态]
         */
        function initStatus() {
            $scope.data = {
                items: [],
                selectedArray: [], //已选
                copyItems: [], //为了模糊搜索使用
                unitorDep: $state.params.departmentid ? "部门" : "单位"
            };
            $scope.status = {
                batchOperateBtn: {
                    "hoverStatus": "",
                    "clickStatus": ""
                },
                copyCurrPage: 1,
                btnRights: {}, //权限按钮
                deprtmentsStatus: {
                    0: "已隐藏",
                    1: "已显示"
                }
            };
            $scope.unitParams = {
                "serviceid": "nb_departmentSet",
                "methodname": "queryUnits",
            };
            $scope.departmentParams = {
                "serviceid": "nb_departmentSet",
                "methodname": "queryDepartments",
                "UnitId": $state.params.departmentid
            };
        }
        /**
         * [initData description]初始化数据
         * @return {[type]} [description]
         */
        function initData() {
            requestData();
            getBtnRihts();
        }
        /**
         * [getBtnRihts description]获得按钮的权限
         * @return {[type]} [description]
         */
        function getBtnRihts() {
            departmentService.getBtnRights().then(function(data) {
                $scope.status.btnRights = data;
            });
        }
        /**
         * [requestData description]数据请求
         * @return {[type]} [description]
         */
        function requestData() {
            var params = $state.params.departmentid ? $scope.departmentParams : $scope.unitParams;
            trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), params, "post").then(function(data) {
                $scope.data.copyItems = $scope.data.items = data.DATA ? data.DATA : data;
                $scope.data.selectedArray = [];
            }).then(function() {
                $scope.data.selectedArray = [];
            });
        }
        /**
         * [pageChanged description:下一页]
         */
        $scope.pageChanged = function() {
            $scope.params.CurrPage = $scope.page.CURRPAGE;
            $scope.copyCurrPage = $scope.page.CURRPAGE;
            requestData();
        };

        /**
         * [jumpToPage description:跳转指定页面]
         */
        $scope.jumpToPage = function() {
            if ($scope.status.copyCurrPage > $scope.page.PAGECOUNT) {
                $scope.status.copyCurrPage = $scope.page.PAGECOUNT;
            }
            $scope.status.params.CurrPage = $scope.status.copyCurrPage;
            $scope.page.CURRPAGE = $scope.status.copyCurrPage;
            requestData();
        };
        /**
         * [selectPageNum description:选择单页显示个数]
         */
        $scope.selectPageNum = function() {
            $scope.params.PageSize = $scope.page.PAGESIZE;
            $scope.params.CurrPage = $scope.page.CURRPAGE;
            $scope.status.copyCurrPage = 1;
            requestData();
        };
        /**
         * [selectDoc 单选]
         * @param  {[type]} item [description：单个对象] 
         */
        $scope.selectDoc = function(item) {
            if ($scope.data.selectedArray.indexOf(item) < 0) {
                $scope.data.selectedArray.push(item);
            } else {
                $scope.data.selectedArray.splice($scope.data.selectedArray.indexOf(item), 1);
            }
        };
        /**
         * [selectAll description:全选]
         */
        $scope.selectAll = function() {
            $scope.data.selectedArray = $scope.data.selectedArray.length == $scope.data.items.length ? [] : [].concat($scope.data.items);
        };
        /**
         * [newDepartment description]新建部门
         * @return {[type]} [description]
         */
        $scope.newDepartment = function() {
            departmentService.createOrEditDepartment().then(function(data) {
                if ($scope.data.unitorDep == '单位') $scope.$emit("changeUnit", "change");
                requestData();
            });
        };
        /**
         * [editDepartment description]编辑部门稿库
         * @param  {[obj]} item  [description]部门稿库详情
         * @return {[type]}      [description]
         */
        $scope.editDepartment = function(item) {
            departmentService.createOrEditDepartment(angular.copy(item)).then(function(data) {
                if ($scope.data.unitorDep == '单位') $scope.$emit("changeUnit", "change");
                requestData();
            });
        };
        /**
         * [deleteDepartments description]批量删除部门
         * @return {[type]} [description]
         */
        $scope.deleteDepartments = function() {
            trsconfirm.confirmModel('是否确认删除' + $scope.data.unitorDep, "是否确认删除选中的" + $scope.data.unitorDep, function() {
                deleteDepartment($scope.data.selectedArray);
            });
        };
        /**
         * [deleteDepartment description]单个删除部门
         * @param  {[obj]} item  [description]
         * @return {[type]}      [description]
         */
        $scope.deleteDepartment = function(item) {
            trsconfirm.confirmModel('是否确认删除' + $scope.data.unitorDep, "是否确认删除选中的" + $scope.data.unitorDep, function() {
                deleteDepartment([item]);
            });
        };
        /**
         * [deleteDepartment description]删除部门
         * @param  {[array]} item [description]要删除的部门集合
         * @return {[type]}       [description]
         */
        function deleteDepartment(item) {
            var params = {
                serviceid: "nb_departmentSet",
                methodname: "deleteDepartments",
                ObjectIds: trsspliceString.spliceString(item, "DEPARTMENTID", ",")
            };
            trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), params, "post").then(function(data) {
                trsconfirm.alertType($scope.data.unitorDep + "删除成功", "", "success", false, function() {
                    if ($scope.data.unitorDep == '单位') $scope.$emit("changeUnit", "change");
                    requestData();
                });
            });
        }
        /**
         * [disableDepartment description]批量隐藏部门
         * @return {[type]} [description]
         */
        $scope.hideDepartments = function() {
            trsconfirm.confirmModel("隐藏" + $scope.data.unitorDep, "是否确认将当前选中的" + $scope.data.unitorDep + "隐藏", function() {
                toggleDepartment('hideDepartmentStatus', $scope.data.selectedArray, '隐藏');
            });
        };
        /**
         * [hiddenDepartment description]单个隐藏部门
         * @param  {[obj]} item  [description]选中的部门信息
         * @return {[type]}      [description]
         */
        $scope.hiddenDepartment = function(item) {
            trsconfirm.confirmModel("隐藏" + $scope.data.unitorDep, "是否确认将当前选中的" + $scope.data.unitorDep + "隐藏", function() {
                toggleDepartment('hideDepartmentStatus', [item], '隐藏');
            });
        };
        /**
         * [showDepartment description]单个显示部门
         * @param  {[obj]} item  [description]选中的部门信息
         * @return {[type]}      [description]
         */
        $scope.showDepartment = function(item) {
            trsconfirm.confirmModel("显示" + $scope.data.unitorDep, "是否确认将当前选中的" + $scope.data.unitorDep + "显示", function() {
                toggleDepartment("displayDepartmentStatus", [item], '显示');
            });
        };
        /**
         * [reStartDepartment description]批量显示部门
         * @return {[type]} [description]
         */
        $scope.showDepartments = function() {
            trsconfirm.confirmModel("显示" + $scope.data.unitorDep, "是否确认将当前选中的" + $scope.data.unitorDep + "显示", function() {
                toggleDepartment("displayDepartmentStatus", $scope.data.selectedArray, '显示');
            });
        };
        /**
         * [toggleDepartment description]切换部门显示和隐藏
         * @param  {[str]} methodname  [description]调用的方法
         * @param  {[arry]} items      [description]显示或隐藏的集合
         * @param  {[str]} info        [description]提示语
         * @return {[type]}            [description]
         */
        function toggleDepartment(methodname, items, info) {
            var params = {
                serviceid: "nb_departmentSet",
                methodname: methodname,
                ObjectIds: trsspliceString.spliceString(items, "DEPARTMENTID", ",")
            };
            trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), params, "post").then(function(data) {
                trsconfirm.alertType($scope.data.unitorDep + info + "成功", "", "success", false, function() {
                    if ($scope.data.unitorDep == '单位') $scope.$emit("changeUnit", "change");
                    requestData();
                });
            });
        }
        /**
         * [rankDepartment description]部门排序
         * @return {[type]} [description]
         */
        $scope.rankDepartment = function() {
            departmentService.pressRank(angular.copy($scope.data.items)).then(function() {
                if ($scope.data.unitorDep == '单位') $scope.$emit("changeUnit", "change");
                requestData();
            });
        };
        /**
         * [departmentSearch description]模糊搜索
         * @param  {[obj]} event  [description]事件对象
         * @return {[type]}       [description]
         */
        $scope.departmentSearch = function(event) {
            if (angular.isUndefined(event) || (angular.isDefined(event) && event.keyCode == 13)) {
                $scope.data.items = $filter('fuzzy')($scope.data.copyItems, $scope.data.keywords);
            }

        };

    }
]);
