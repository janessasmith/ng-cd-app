/*
    Create by CC 2016-11-03
*/
'use strict';
angular.module("draftToDepartmentModule", [])
    .controller("draftToDepartmentCtrl", ["$scope", "$state", "$q", "$filter", "$timeout", "$modalInstance", "trsHttpService", "trsspliceString", "trsconfirm", "items","title",function($scope, $state, $q, $filter, $timeout, $modalInstance, trsHttpService, trsspliceString, trsconfirm, items,title) {
        initStatus();
        initData();
        /**
         * [initStatus description]初始化状态
         * @return {[type]} [description]
         */
        function initStatus() {
            $scope.data = {
                items: items,
                title:title,
                units: [],        //单位列表
                departments: [],  //部门列表
                selectedUnit: "", //被选中的一级单位
                selectDepartment: "", //被选中的二级部门
                departmentid: $state.params.departmentid
            };
        }
        /**
         * [initData description]初始化数据
         * @return {[type]} [description]
         */
        function initData() {
            getUnits().then(function(data) {
                $scope.data.units = data.DATA?data.DATA:data;
                $scope.data.selectedUnit = $scope.data.units[0];
                getDepartments($scope.data.selectedUnit.DEPARTMENTID).then(function(data) {
                    $scope.data.departments = data.DATA?data.DATA:data;
                });
            });
        }
        /**
         * [getUnits description]获得单位
         * @return {[type]} [description]
         */
        function getUnits() {
            var deffered = $q.defer();
            var params = {
                serviceid: "nb_departmentrelease",
                methodname: "queryUnitsOnSubmit",
            };
            trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), params, "get").then(function(data) {
                deffered.resolve(data);
            });
            return deffered.promise;
        }
        /**
         * [getDepartments description]获得部门信息
         * @param  {[num]} deparmentId  [description]部门ID
         * @return {[type]}             [description]
         */
        function getDepartments(deparmentId) {
            var deffered = $q.defer();
            var params = {
                serviceid: "nb_departmentrelease",
                methodname: "queryDepartmentsOnSubmit",
                UnitId: deparmentId,
            };
            trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), params, "get").then(function(data) {
                deffered.resolve(data);
            });
            return deffered.promise;
        }
        /**
         * [selectFristDep description]选择一级部门,获得二级部门
         * @param  {[obj]} item  [description]一级部门信息
         * @return {[type]}      [description]
         */
        $scope.selectUnit = function(item) {
            $scope.data.selectedUnit = item;
            $scope.data.selectDepartment = null;
            getDepartments(item.DEPARTMENTID).then(function(data) {
                $scope.data.departments = data.DATA?data.DATA:data;
            });
        };
        /**
         * [selectSecDep description]选择二级部门
         * @param  {[type]} item [description]
         * @return {[type]}      [description]
         */
        $scope.selectDepartment = function(item) {
            if (item.DEPARTMENTID == $scope.data.departmentid) return;
            $scope.data.selectDepartment = item;
        };
        /**
         * [deleteItem description]删除稿件
         * @param  {[obj]} item  [description]稿件信息
         * @return {[type]}      [description]
         */
        $scope.deleteDraft = function(item) {
            $scope.data.items.splice($scope.data.items.indexOf(item), 1);
        };
        $scope.confirm = function() {
            if ($scope.data.items.length < 1) {
                trsconfirm.alertType('操作失败', '所选稿件为空', "warning", false);
                return;
            }
            $modalInstance.close($scope.data.selectDepartment);
        };
        $scope.cancel = function() {
            $modalInstance.dismiss();
        };
    }]);
